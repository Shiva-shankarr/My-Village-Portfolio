const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, authorize } = require('../middleware/auth');
const Gallery = require('../models/Gallery');
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

// @route   GET /api/gallery
// @desc    Get all gallery items
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

    const gallery = await Gallery.find(query)
      .skip((options.page - 1) * options.limit)
      .limit(options.limit)
      .sort(options.sort)
      .lean();

    const total = await Gallery.countDocuments(query);

    res.json({
      success: true,
      data: gallery,
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
      Gallery.countDocuments(),
      Gallery.countDocuments({ isPublished: { $ne: false } }),
      Gallery.aggregate([{ $group: { _id: null, total: { $sum: '$viewCount' } } }]),
      Gallery.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Gallery.countDocuments({ createdAt: { $gte: weekStart, $lte: now } }),
      Gallery.countDocuments({ createdAt: { $gte: previousWeekStart, $lt: weekStart } }),
      Gallery.countDocuments({ createdAt: { $gte: monthStart, $lte: now } }),
      Gallery.countDocuments({ createdAt: { $gte: previousMonthStart, $lt: monthStart } })
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

    const item = await Gallery.findOneAndUpdate(
      query,
      { $inc: { viewCount: 1 } },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/gallery
// @desc    Create a gallery item
// @access  Private/Admin
router.post('/', protect, authorize('admin'), upload.single('image'), async (req, res) => {
  try {
    const { title, description, category, tags, isPublished } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }

    // Upload to cloudinary
    const result = await cloudinary.uploader.upload(toDataUri(req.file), {
      folder: 'gallery',
      resource_type: 'auto',
      quality: 'auto',
      fetch_format: 'auto'
    });

    const gallery = await Gallery.create({
      title,
      description,
      category,
      imageUrl: result.secure_url,
      cloudinaryId: result.public_id,
      tags: tags
        ? tags.split(',').map((tag) => tag.trim()).filter(Boolean)
        : [],
      isPublished: isPublished === undefined ? true : isPublished === 'true' || isPublished === true,
      uploadedBy: req.user?._id
    });

    res.status(201).json({
      success: true,
      data: gallery
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/gallery/:id
// @desc    Delete a gallery item
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);

    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    // Delete from cloudinary
    await cloudinary.uploader.destroy(gallery.cloudinaryId);

    await gallery.remove();

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

// @route   PUT /api/gallery/:id
// @desc    Update a gallery item
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), upload.single('image'), async (req, res) => {
  try {
    let gallery = await Gallery.findById(req.params.id);

    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    const { title, description, category, tags, isPublished } = req.body;
    const updateData = {
      title,
      description,
      category,
      tags: tags
        ? tags.split(',').map((tag) => tag.trim()).filter(Boolean)
        : gallery.tags,
      isPublished: isPublished === undefined ? gallery.isPublished : isPublished === 'true' || isPublished === true,
      updatedAt: Date.now()
    };

    if (req.file) {
      // Delete old image from cloudinary
      await cloudinary.uploader.destroy(gallery.cloudinaryId);

      // Upload new image
      const result = await cloudinary.uploader.upload(toDataUri(req.file), {
        folder: 'gallery',
        resource_type: 'auto',
        quality: 'auto',
        fetch_format: 'auto'
      });

      updateData.imageUrl = result.secure_url;
      updateData.cloudinaryId = result.public_id;
    }

    gallery = await Gallery.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: gallery
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router; 
