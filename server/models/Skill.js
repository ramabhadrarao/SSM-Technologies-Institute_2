const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: true,
    enum: ['programming', 'design', 'marketing', 'business', 'data-science', 'other'],
    default: 'other'
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
skillSchema.index({ name: 1 });
skillSchema.index({ category: 1 });
skillSchema.index({ isActive: 1 });

module.exports = mongoose.model('Skill', skillSchema);