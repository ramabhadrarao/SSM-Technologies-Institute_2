const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
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
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    default: null
  },
  syllabus: [{
    topic: {
      type: String,
      required: true
    },
    duration: String,
    description: String
  }],
  materials: [{
    title: String,
    type: {
      type: String,
      enum: ['pdf', 'video', 'link', 'document']
    },
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
subjectSchema.index({ name: 1 });
subjectSchema.index({ course: 1 });
subjectSchema.index({ isActive: 1 });

module.exports = mongoose.model('Subject', subjectSchema);