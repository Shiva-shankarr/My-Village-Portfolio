const mongoose = require('mongoose');

const errorLogSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  error: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  ip: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 604800 // Automatically delete logs after 7 days
  }
});

// Index for efficient querying
errorLogSchema.index({ timestamp: -1 });
errorLogSchema.index({ type: 1 });
errorLogSchema.index({ url: 1 });

const ErrorLog = mongoose.model('ErrorLog', errorLogSchema);

module.exports = ErrorLog; 