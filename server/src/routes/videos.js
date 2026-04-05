const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Video = require('../models/Video');

// @route   GET /api/videos
// @desc    Get all videos
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, page = 1, limit = 10, search, published } = req.query;
    const query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    if (published !== 'all') {
      if (published === 'true' || published === 'false') {
        query.isPublished = published === 'true';
      } else {
        query.isPublished = { $ne: false };
      }
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 }
    };

    const videos = await Video.find(query)
      .skip((options.page - 1) * options.limit)
      .limit(options.limit)
      .sort(options.sort)
      .lean();

    const total = await Video.countDocuments(query);

    res.json({
      success: true,
      data: videos,
      pagination: {
        current: options.page,
        total: Math.ceil(total / options.limit),
        hasMore: options.page * options.limit < total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    const previousWeekStart = new Date(now);
    previousWeekStart.setDate(now.getDate() - 14);

    const monthStart = new Date(now);
    monthStart.setDate(now.getDate() - 30);
    const previousMonthStart = new Date(now);
    previousMonthStart.setDate(now.getDate() - 60);

    const [
      total,
      published,
      totalViews,
      categories,
      weeklyNew,
      previousWeeklyNew,
      monthlyNew,
      previousMonthlyNew
    ] = await Promise.all([
      Video.countDocuments(),
      Video.countDocuments({ isPublished: { $ne: false } }),
      Video.aggregate([{ $group: { _id: null, total: { $sum: '$viewCount' } } }]),
      Video.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Video.countDocuments({ createdAt: { $gte: weekStart, $lte: now } }),
      Video.countDocuments({ createdAt: { $gte: previousWeekStart, $lt: weekStart } }),
      Video.countDocuments({ createdAt: { $gte: monthStart, $lte: now } }),
      Video.countDocuments({ createdAt: { $gte: previousMonthStart, $lt: monthStart } })
    ]);

    const weeklyGrowth = previousWeeklyNew
      ? Math.round(((weeklyNew - previousWeeklyNew) / previousWeeklyNew) * 100)
      : weeklyNew > 0
        ? 100
        : 0;

    const monthlyGrowth = previousMonthlyNew
      ? Math.round(((monthlyNew - previousMonthlyNew) / previousMonthlyNew) * 100)
      : monthlyNew > 0
        ? 100
        : 0;

    res.json({
      success: true,
      data: {
        total,
        published,
        totalViews: totalViews[0]?.total || 0,
        categories,
        weeklyNew,
        weeklyGrowth,
        monthlyNew,
        monthlyGrowth
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const includeUnpublished = req.query.includeUnpublished === 'true';
    const query = { _id: req.params.id };
    if (!includeUnpublished) {
      query.isPublished = { $ne: false };
    }

    const video = await Video.findOneAndUpdate(
      query,
      { $inc: { viewCount: 1 } },
      { new: true }
    );

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    res.json({
      success: true,
      data: video
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/videos
// @desc    Create a video
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const {
      title,
      description,
      embedUrl,
      category,
      thumbnailUrl,
      videoSource,
      duration,
      isPublished
    } = req.body;

    const video = await Video.create({
      title,
      description,
      embedUrl,
      category,
      thumbnailUrl,
      videoSource,
      duration,
      isPublished: isPublished === undefined ? true : isPublished === 'true' || isPublished === true,
      uploadedBy: req.user?._id
    });

    res.status(201).json({
      success: true,
      data: video
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/videos/:id
// @desc    Delete a video
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    await video.remove();

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/videos/:id
// @desc    Update a video
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const {
      title,
      description,
      embedUrl,
      category,
      thumbnailUrl,
      videoSource,
      duration,
      isPublished
    } = req.body;

    let video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    video = await Video.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        embedUrl,
        category,
        thumbnailUrl,
        videoSource,
        duration,
        isPublished: isPublished === undefined ? video.isPublished : isPublished === 'true' || isPublished === true,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: video
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router; 
