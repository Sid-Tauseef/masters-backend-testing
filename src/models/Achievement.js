const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Achievement title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Achievement description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  image: {
    type: String,
    required: [true, 'Achievement image is required']
  },
  date: {
    type: Date,
    required: [true, 'Achievement date is required']
  },
  category: {
    type: String,
    required: [true, 'Achievement category is required'],
    enum: ['Academic Excellence', 'Student Achievement', 'Institute Recognition', 'Awards', 'Certifications', 'Other']
  },
  details: {
    type: String,
    maxlength: [1000, 'Details cannot exceed 1000 characters']
  },
  relatedStudents: [{
    name: String,
    class: {
      type: String,
      default: ''
    },
    achievement: {
      type: String,
      default: ''
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  priority: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient querying
achievementSchema.index({ date: -1, featured: -1, category: 1 });

module.exports = mongoose.model('Achievement', achievementSchema);