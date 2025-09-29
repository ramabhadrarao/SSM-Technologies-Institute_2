const mongoose = require('mongoose');

const instructorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  bio: {
    type: String,
    required: true
  },
  designation: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    default: null
  },
  resumeUrl: {
    type: String,
    default: null
  },
  certificates: [{
    name: String,
    url: String,
    issuedBy: String,
    issuedDate: Date,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  skills: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill'
  }],
  experience: {
    type: Number,
    required: true,
    min: 0
  },
  specializations: [{
    type: String,
    trim: true
  }],
  education: [{
    degree: String,
    institution: String,
    year: Number,
    grade: String
  }],
  socialLinks: {
    linkedin: String,
    github: String,
    website: String,
    twitter: String
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalStudents: {
    type: Number,
    default: 0
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
instructorSchema.index({ user: 1 });
instructorSchema.index({ isApproved: 1 });
instructorSchema.index({ isActive: 1 });
instructorSchema.index({ rating: -1 });

module.exports = mongoose.model('Instructor', instructorSchema);