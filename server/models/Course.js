const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    default: null
  },
  videoUrl: {
    type: String,
    default: null
  },
  fees: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: String,
    required: true
  },
  structure: [{
    type: String,
    trim: true
  }],
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  }],
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Instructor'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  enrollmentCount: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for performance
courseSchema.index({ name: 1 });
courseSchema.index({ isActive: 1 });
courseSchema.index({ fees: 1 });
courseSchema.index({ rating: -1 });

module.exports = mongoose.model('Course', courseSchema);