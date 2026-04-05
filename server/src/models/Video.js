const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true
  },
  embedUrl: {
    type: String,
    required: [true, 'Please provide a video embed URL']
  },
  thumbnailUrl: {
    type: String
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    trim: true
  },
  videoSource: {
    type: String,
    enum: ['youtube', 'vimeo', 'cloudinary'],
    default: 'youtube'
  },
  duration: {
    type: Number
  },
  viewCount: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add text index for search functionality
videoSchema.index({ title: 'text', description: 'text' });
videoSchema.index({ isPublished: 1, category: 1, createdAt: -1 });

const Video = mongoose.model('Video', videoSchema);

module.exports = Video; 
