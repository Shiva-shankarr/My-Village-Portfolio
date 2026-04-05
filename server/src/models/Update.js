const mongoose = require('mongoose');

const updateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Please provide content'],
    trim: true
  },
  summary: {
    type: String,
    trim: true,
    maxlength: 200
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: ['development', 'education', 'health', 'culture', 'general'],
    default: 'general'
  },
  images: [{
    type: String
  }],
  cloudinaryIds: [{
    type: String
  }],
  tags: [{
    type: String,
    trim: true
  }],
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  viewCount: {
    type: Number,
    default: 0
  },
  author: {
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
updateSchema.index({ title: 'text', content: 'text' });
updateSchema.index({ category: 1, publishDate: -1, isPinned: -1 });

const Update = mongoose.model('Update', updateSchema);

module.exports = Update; 
