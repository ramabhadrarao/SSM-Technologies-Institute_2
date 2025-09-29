const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  designation: {
    type: String,
    required: true,
    trim: true
  },
  bio: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    default: null
  },
  socialLinks: {
    linkedin: String,
    twitter: String,
    facebook: String,
    instagram: String,
    website: String
  },
  order: {
    type: Number,
    required: true,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  department: {
    type: String,
    enum: ['Leadership', 'Academic', 'Technical', 'Administration', 'Marketing'],
    default: 'Leadership'
  },
  experience: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes
teamSchema.index({ order: 1 });
teamSchema.index({ isActive: 1 });
teamSchema.index({ department: 1 });

module.exports = mongoose.model('Team', teamSchema);