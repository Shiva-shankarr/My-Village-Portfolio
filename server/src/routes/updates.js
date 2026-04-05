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
const VALID_CATEGORIES = ['development', 'education', 'health', 'culture', 'general'];

const parseBoolean = (value, fallback) => {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  return String(value).toLowerCase() === 'true';
};

const parseTags = (tags) => {
  if (!tags) return [];
  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag).trim()).filter(Boolean);
  }
  return String(tags)
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
};

const validateUpdatePayload = ({ title, content, category }) => {
  if (!title || !String(title).trim()) {
    return 'Title is required';
  }
  if (!content || !String(content).trim()) {
    return 'Content is required';
  }
  if (!category || !VALID_CATEGORIES.includes(String(category).toLowerCase())) {
    return `Category must be one of: ${VALID_CATEGORIES.join(', ')}`;
  }
  return null;
};

const isCloudinaryConfigured = () => {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME
      && process.env.CLOUDINARY_API_KEY
      && process.env.CLOUDINARY_API_SECRET
  );
};

const uploadFilesToCloudinary = async (files, folder) => {
  const images = [];
  const cloudinaryIds = [];

  for (const [index, file] of files.entries()) {
    if (!file?.buffer || !file?.mimetype) {
      throw new Error(`Invalid image payload at index ${index}`);
    }

    const result = await cloudinary.uploader.upload(toDataUri(file), {
      folder,
      resource_type: 'auto',
      quality: 'auto',
      fetch_format: 'auto'
    });

    images.push(result.secure_url);
    cloudinaryIds.push(result.public_id);
  }

  return { images, cloudinaryIds };
};

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
    console.log('POST /api/updates hit', {
      bodyKeys: Object.keys(req.body || {}),
      filesCount: req.files?.length || 0,
      userId: req.user?._id
    });

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

    const normalizedCategory = String(category || '').toLowerCase();
    const validationError = validateUpdatePayload({
      title,
      content,
      category: normalizedCategory
    });
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError
      });
    }

    const files = Array.isArray(req.files) ? req.files : [];
    let images = [];
    let cloudinaryIds = [];

    // Upload images to cloudinary if any
    if (files.length > 0) {
      if (!isCloudinaryConfigured()) {
        return res.status(500).json({
          success: false,
          message: 'Cloudinary is not configured on server'
        });
      }

      ({ images, cloudinaryIds } = await uploadFilesToCloudinary(files, 'updates'));
      console.log('POST /api/updates uploaded images', { uploadedCount: images.length });
    }

    console.log('POST /api/updates saving record', {
      title,
      category: normalizedCategory,
      hasImages: images.length > 0,
      publishDate: publishDate || null
    });

    const update = await Update.create({
      title,
      content,
      category: normalizedCategory,
      summary,
      tags: parseTags(tags),
      priority,
      isPinned: parseBoolean(isPinned, false),
      isPublished: parseBoolean(isPublished, true),
      publishDate: publishDate ? new Date(publishDate) : new Date(),
      images,
      cloudinaryIds,
      author: req.user?._id
    });

    console.log('POST /api/updates created', { id: update._id });

    res.status(201).json({
      success: true,
      data: update
    });
  } catch (error) {
    console.error('Error in POST /api/updates:', {
      message: error.message,
      stack: error.stack,
      bodyKeys: Object.keys(req.body || {}),
      filesCount: req.files?.length || 0
    });
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

// @route   PUT /api/updates/:id
// @desc    Update an update
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), upload.array('images', 5), async (req, res) => {
  try {
    console.log('PUT /api/updates/:id hit', {
      id: req.params.id,
      bodyKeys: Object.keys(req.body || {}),
      filesCount: req.files?.length || 0,
      userId: req.user?._id
    });

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

    const normalizedCategory = String(category || '').toLowerCase();
    const validationError = validateUpdatePayload({
      title,
      content,
      category: normalizedCategory
    });
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError
      });
    }

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
      category: normalizedCategory,
      summary,
      tags: tags === undefined ? update.tags : parseTags(tags),
      priority,
      isPinned: parseBoolean(isPinned, update.isPinned),
      isPublished: parseBoolean(isPublished, update.isPublished),
      publishDate: publishDate ? new Date(publishDate) : (update.publishDate || new Date()),
      updatedAt: Date.now()
    };

    const files = Array.isArray(req.files) ? req.files : [];

    // Handle new images if any
    if (files.length > 0) {
      if (!isCloudinaryConfigured()) {
        return res.status(500).json({
          success: false,
          message: 'Cloudinary is not configured on server'
        });
      }

      // Delete old images from cloudinary
      const previousCloudinaryIds = Array.isArray(update.cloudinaryIds)
        ? update.cloudinaryIds.filter(Boolean)
        : [];

      for (const cloudinaryId of previousCloudinaryIds) {
        await cloudinary.uploader.destroy(cloudinaryId);
      }

      // Upload new images
      const { images, cloudinaryIds } = await uploadFilesToCloudinary(files, 'updates');

      updateData.images = images;
      updateData.cloudinaryIds = cloudinaryIds;

      console.log('PUT /api/updates/:id uploaded images', {
        id: req.params.id,
        uploadedCount: images.length
      });
    }

    console.log('PUT /api/updates/:id saving record', {
      id: req.params.id,
      category: normalizedCategory,
      hasImages: Boolean(updateData.images?.length)
    });

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
    console.error('Error in PUT /api/updates/:id:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
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
    const cloudinaryIds = Array.isArray(update.cloudinaryIds)
      ? update.cloudinaryIds.filter(Boolean)
      : [];

    for (const cloudinaryId of cloudinaryIds) {
      await cloudinary.uploader.destroy(cloudinaryId);
    }

    await update.remove();

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error in DELETE /api/updates/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router; 
