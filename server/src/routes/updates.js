const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, authorize } = require('../middleware/auth');
const Update = require('../models/Update');
const cloudinary = require('../config/cloudinary');

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

const toDataUri = (file) => `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

// @route   GET /api/updates
// @desc    Get all updates with pagination, search, and filtering
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 9,
      search,
      category,
      sortBy = 'createdAt',
      startDate,
      endDate,
      tags,
      published
    } = req.query;
    const query = {};
    const categoryQuery = {};

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    if (tags) {
      const tagList = tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);
      if (tagList.length) {
        query.tags = { $in: tagList };
      }
    }

    if (startDate || endDate) {
      query.publishDate = {};
      if (startDate) {
        query.publishDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.publishDate.$lte = new Date(endDate);
      }
      categoryQuery.publishDate = query.publishDate;
    }

    if (published !== 'all') {
      if (published === 'true' || published === 'false') {
        query.isPublished = published === 'true';
      } else {
        query.isPublished = { $ne: false };
      }
      categoryQuery.isPublished = query.isPublished;
    }

    if (published === undefined || published === 'true') {
      const now = new Date();

      // Include content with publishDate in the past OR missing publishDate
      // so legacy/admin-edited records without this field still render publicly.
      if (query.publishDate && (query.publishDate.$gte || query.publishDate.$lte)) {
        query.publishDate.$lte = now;
      } else {
        query.$or = [
          { publishDate: { $lte: now } },
          { publishDate: { $exists: false } }
        ];
      }

      if (categoryQuery.publishDate && (categoryQuery.publishDate.$gte || categoryQuery.publishDate.$lte)) {
        categoryQuery.publishDate.$lte = now;
      } else {
        categoryQuery.$or = [
          { publishDate: { $lte: now } },
          { publishDate: { $exists: false } }
        ];
      }
    }

    // Sorting options
    const sortOptions = {
      createdAt: { isPinned: -1, createdAt: -1 },
      newest: { isPinned: -1, publishDate: -1, createdAt: -1 },
      oldest: { isPinned: -1, publishDate: 1, createdAt: 1 },
      title: { isPinned: -1, title: 1 },
      category: { isPinned: -1, category: 1, publishDate: -1 },
      popular: { isPinned: -1, viewCount: -1, publishDate: -1 }
    };

    const options = {
      skip: (parseInt(page) - 1) * parseInt(limit),
      limit: parseInt(limit),
      sort: sortOptions[sortBy] || sortOptions.createdAt
    };

    const [updates, total] = await Promise.all([
      Update.find(query, null, options).lean(),
      Update.countDocuments(query)
    ]);

    // Get unique categories for filtering
    const categories = await Update.distinct('category', categoryQuery);

    res.json({
      success: true,
      data: updates,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasMore: options.skip + updates.length < total
      },
      metadata: {
        total,
        categories
      }
    });
  } catch (error) {
    console.error('Error in GET /api/updates:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
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
      pinned,
      totalViews,
      categories,
      priorities,
      weeklyNew,
      previousWeeklyNew,
      monthlyNew,
      previousMonthlyNew
    ] = await Promise.all([
      Update.countDocuments(),
      Update.countDocuments({ isPublished: { $ne: false } }),
      Update.countDocuments({ isPinned: true }),
      Update.aggregate([{ $group: { _id: null, total: { $sum: '$viewCount' } } }]),
      Update.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Update.aggregate([
        { $group: { _id: '$priority', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Update.countDocuments({ publishDate: { $gte: weekStart, $lte: now } }),
      Update.countDocuments({ publishDate: { $gte: previousWeekStart, $lt: weekStart } }),
      Update.countDocuments({ publishDate: { $gte: monthStart, $lte: now } }),
      Update.countDocuments({ publishDate: { $gte: previousMonthStart, $lt: monthStart } })
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
        pinned,
        totalViews: totalViews[0]?.total || 0,
        categories,
        priorities,
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
      query.$or = [
        { publishDate: { $lte: new Date() } },
        { publishDate: { $exists: false } }
      ];
    }

    const update = await Update.findOneAndUpdate(
      query,
      { $inc: { viewCount: 1 } },
      { new: true }
    );

    if (!update) {
      return res.status(404).json({
        success: false,
        message: 'Update not found'
      });
    }

    res.json({
      success: true,
      data: update
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/updates
// @desc    Create a new update
// @access  Private/Admin
router.post('/', protect, authorize('admin'), upload.array('images', 5), async (req, res) => {
  try {
    const {
      title,
      content,
      category,
      summary,
      tags,
      priority,
      isPinned,
      isPublished,
      publishDate
    } = req.body;
    const images = [];
    const cloudinaryIds = [];

    // Upload images to cloudinary if any
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(toDataUri(file), {
          folder: 'updates',
          resource_type: 'auto',
          quality: 'auto',
          fetch_format: 'auto'
        });
        images.push(result.secure_url);
        cloudinaryIds.push(result.public_id);
      }
    }

    const update = await Update.create({
      title,
      content,
      category,
      summary,
      tags: tags
        ? tags.split(',').map((tag) => tag.trim()).filter(Boolean)
        : [],
      priority,
      isPinned: isPinned === 'true' || isPinned === true,
      isPublished: isPublished === undefined ? true : isPublished === 'true' || isPublished === true,
      publishDate: publishDate ? new Date(publishDate) : new Date(),
      images,
      cloudinaryIds,
      author: req.user?._id
    });

    res.status(201).json({
      success: true,
      data: update
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/updates/:id
// @desc    Update an update
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), upload.array('images', 5), async (req, res) => {
  try {
    const {
      title,
      content,
      category,
      summary,
      tags,
      priority,
      isPinned,
      isPublished,
      publishDate
    } = req.body;
    let update = await Update.findById(req.params.id);

    if (!update) {
      return res.status(404).json({
        success: false,
        message: 'Update not found'
      });
    }

    const updateData = {
      title,
      content,
      category,
      summary,
      tags: tags
        ? tags.split(',').map((tag) => tag.trim()).filter(Boolean)
        : update.tags,
      priority,
      isPinned: isPinned === undefined ? update.isPinned : isPinned === 'true' || isPinned === true,
      isPublished: isPublished === undefined ? update.isPublished : isPublished === 'true' || isPublished === true,
      publishDate: publishDate ? new Date(publishDate) : (update.publishDate || new Date()),
      updatedAt: Date.now()
    };

    // Handle new images if any
    if (req.files && req.files.length > 0) {
      // Delete old images from cloudinary
      for (const cloudinaryId of update.cloudinaryIds) {
        await cloudinary.uploader.destroy(cloudinaryId);
      }

      // Upload new images
      const images = [];
      const cloudinaryIds = [];
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(toDataUri(file), {
          folder: 'updates',
          resource_type: 'auto',
          quality: 'auto',
          fetch_format: 'auto'
        });
        images.push(result.secure_url);
        cloudinaryIds.push(result.public_id);
      }

      updateData.images = images;
      updateData.cloudinaryIds = cloudinaryIds;
    }

    update = await Update.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: update
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/updates/:id
// @desc    Delete an update
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const update = await Update.findById(req.params.id);

    if (!update) {
      return res.status(404).json({
        success: false,
        message: 'Update not found'
      });
    }

    // Delete images from cloudinary
    for (const cloudinaryId of update.cloudinaryIds) {
      await cloudinary.uploader.destroy(cloudinaryId);
    }

    await update.remove();

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

module.exports = router; 
