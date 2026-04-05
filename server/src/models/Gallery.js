const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
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
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: ['nature', 'youth', 'festivals', 'marriages', 'unity', 'general'],
    trim: true
  },
  imageUrl: {
    type: String,
    required: [true, 'Please provide an image URL']
  },
  cloudinaryId: {
    type: String,
    required: [true, 'Cloudinary ID is required']
  },
  tags: [{
    type: String,
    trim: true
  }],
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
gallerySchema.index({ title: 'text', description: 'text' });
gallerySchema.index({ isPublished: 1, category: 1, createdAt: -1 });

const Gallery = mongoose.model('Gallery', gallerySchema);

module.exports = Gallery; 
