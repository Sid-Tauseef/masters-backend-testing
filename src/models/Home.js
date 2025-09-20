const mongoose = require('mongoose');

const homeSchema = new mongoose.Schema({
  section: {
    type: String,
    required: [true, 'Section name is required'],
    unique: true,
    enum: ['hero', 'about', 'vision', 'mission', 'stats', 'testimonials', 'announcements']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  subtitle: {
    type: String,
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  image: {
    type: String
  },
  buttonText: {
    type: String,
    trim: true
  },
  buttonLink: {
    type: String,
    trim: true
  },
  stats: [{
    label: String,
    value: String,
    icon: String
  }],
  testimonials: [{
    name: String,
    designation: String,
    content: String,
    image: String,
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5
    }
  }],
  announcements: [{
    title: String,
    content: String,
    date: Date,
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient querying
homeSchema.index({ section: 1, isActive: 1, order: 1 });

module.exports = mongoose.model('Home', homeSchema);