const mongoose = require('mongoose');

const topperSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  photo: {
    type: String,
    required: [true, 'Student photo is required']
  },
  achievement: {
    type: String,
    required: [true, 'Achievement description is required'],
    maxlength: [200, 'Achievement cannot exceed 200 characters']
  },
  exam: {
    type: String,
    required: [true, 'Exam name is required'],
    maxlength: [100, 'Exam name cannot exceed 100 characters']
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [2000, 'Year must be after 2000'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
  },
  score: {
    type: String,
    required: [true, 'Score is required'],
    maxlength: [50, 'Score cannot exceed 50 characters']
  },
  rank: {
    type: String,
    maxlength: [50, 'Rank cannot exceed 50 characters']
  },
  course: {
    type: String,
    required: [true, 'Course is required'],
    maxlength: [100, 'Course name cannot exceed 100 characters']
  },
  testimonial: {
    type: String,
    maxlength: [500, 'Testimonial cannot exceed 500 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient querying
topperSchema.index({ year: -1, featured: -1 });

module.exports = mongoose.model('Topper', topperSchema);