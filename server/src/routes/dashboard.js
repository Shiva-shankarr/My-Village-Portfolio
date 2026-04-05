const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Gallery = require('../models/Gallery');
const Video = require('../models/Video');
const Update = require('../models/Update');

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private/Admin
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const [galleryCount, videoCount, updateCount, galleryViews, videoViews, updateViews] = await Promise.all([
      Gallery.countDocuments(),
      Video.countDocuments(),
      Update.countDocuments(),
      Gallery.aggregate([{ $group: { _id: null, total: { $sum: '$viewCount' } } }]),
      Video.aggregate([{ $group: { _id: null, total: { $sum: '$viewCount' } } }]),
      Update.aggregate([{ $group: { _id: null, total: { $sum: '$viewCount' } } }])
    ]);

    const galleryViewTotal = galleryViews[0]?.total || 0;
    const videoViewTotal = videoViews[0]?.total || 0;
    const updateViewTotal = updateViews[0]?.total || 0;
    const totalViews = galleryViewTotal + videoViewTotal + updateViewTotal;

    const stats = {
      totalGalleryItems: galleryCount,
      totalVideos: videoCount,
      totalUpdates: updateCount,
      gallery: {
        total: galleryCount,
        views: galleryViewTotal,
        growth: 0
      },
      videos: {
        total: videoCount,
        views: videoViewTotal,
        growth: 0
      },
      updates: {
        total: updateCount,
        views: updateViewTotal,
        growth: 0
      },
      views: {
        total: totalViews,
        growth: 0
      },
      users: {
        active: 0,
        growth: 0
      },
      engagement: {
        rate: 0,
        growth: 0
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
  }
});

// @route   GET /api/dashboard/activity
// @desc    Get recent activity
// @access  Private/Admin
router.get('/activity', protect, authorize('admin'), async (req, res) => {
  try {
    const [galleryItems, videoItems, updateItems] = await Promise.all([
      Gallery.find().sort({ createdAt: -1 }).limit(5),
      Video.find().sort({ createdAt: -1 }).limit(5),
      Update.find().sort({ createdAt: -1 }).limit(5)
    ]);

    const timeAgo = (date) => {
      const diffMs = Date.now() - new Date(date).getTime();
      const minutes = Math.floor(diffMs / 60000);
      if (minutes < 60) return `${minutes} minutes ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours} hours ago`;
      const days = Math.floor(hours / 24);
      return `${days} days ago`;
    };

    const activity = [
      ...galleryItems.map((item) => ({
        type: 'gallery',
        action: 'Added new image',
        title: item.title,
        time: timeAgo(item.createdAt),
        createdAt: item.createdAt
      })),
      ...videoItems.map((item) => ({
        type: 'video',
        action: 'Added new video',
        title: item.title,
        time: timeAgo(item.createdAt),
        createdAt: item.createdAt
      })),
      ...updateItems.map((item) => ({
        type: 'update',
        action: 'Posted update',
        title: item.title,
        time: timeAgo(item.createdAt),
        createdAt: item.createdAt
      }))
    ]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .map(({ createdAt, ...rest }) => rest);

    res.json(activity);
  } catch (error) {
    console.error('Dashboard activity error:', error);
    res.status(500).json({ message: 'Error fetching recent activity' });
  }
});

// @route   GET /api/dashboard/analytics
// @desc    Get analytics data
// @access  Private/Admin
router.get('/analytics', protect, authorize('admin'), async (req, res) => {
  try {
    const { period = 'week' } = req.query;

    // Mock data for demonstration
    // In a real application, this would come from analytics tracking
    const analytics = {
      timeline: [
        { date: '2024-01-01', gallery: 10, videos: 5, updates: 3 },
        { date: '2024-01-02', gallery: 12, videos: 6, updates: 4 },
        { date: '2024-01-03', gallery: 15, videos: 7, updates: 5 },
        { date: '2024-01-04', gallery: 18, videos: 8, updates: 6 },
        { date: '2024-01-05', gallery: 20, videos: 10, updates: 7 }
      ],
      categories: {
        Nature: 15,
        Culture: 12,
        Events: 8,
        Development: 10,
        Education: 5
      }
    };

    res.json(analytics);
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ message: 'Error fetching analytics data' });
  }
});

module.exports = router; 
