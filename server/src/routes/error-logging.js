const express = require('express');
const router = express.Router();
const ErrorLog = require('../models/ErrorLog');

// @route   POST /api/log-error
// @desc    Log client-side errors
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { type, timestamp, url, userAgent, error } = req.body;

    // Create error log
    await ErrorLog.create({
      type,
      timestamp,
      url,
      userAgent,
      error,
      ip: req.ip
    });

    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Error logging client error:', err);
    res.status(500).json({ success: false });
  }
});

// @route   GET /api/log-error
// @desc    Get error logs (admin only)
// @access  Private/Admin
router.get('/', async (req, res) => {
  try {
    const logs = await ErrorLog.find()
      .sort({ timestamp: -1 })
      .limit(100);

    res.json({
      success: true,
      data: logs
    });
  } catch (err) {
    console.error('Error fetching error logs:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router; 