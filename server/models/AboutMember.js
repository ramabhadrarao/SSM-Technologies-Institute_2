const mongoose = require('mongoose');

const aboutMemberSchema = new mongoose.Schema({
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
    instagram: String
  },
  order: {
    type: Number,
    required: true,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
aboutMemberSchema.index({ order: 1 });
aboutMemberSchema.index({ isActive: 1 });

module.exports = mongoose.model('AboutMember', aboutMemberSchema);