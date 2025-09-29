const mongoose = require('mongoose');

const courseMaterialSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Instructor',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['pdf', 'video', 'document', 'image', 'link', 'other'],
    required: true
  },
  fileUrl: {
    type: String,
    required: function() {
      return this.type !== 'link';
    }
  },
  externalUrl: {
    type: String,
    required: function() {
      return this.type === 'link';
    }
  },
  fileName: {
    type: String
  },
  fileSize: {
    type: Number // in bytes
  },
  mimeType: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for performance
courseMaterialSchema.index({ course: 1, isActive: 1 });
courseMaterialSchema.index({ instructor: 1 });
courseMaterialSchema.index({ course: 1, order: 1 });

// Virtual for file URL with base path
courseMaterialSchema.virtual('fullFileUrl').get(function() {
  if (this.fileUrl) {
    return `${process.env.BASE_URL || 'http://localhost:3001'}/uploads/materials/${this.fileUrl}`;
  }
  return null;
});

// Method to increment download count
courseMaterialSchema.methods.incrementDownload = function() {
  this.downloadCount += 1;
  return this.save();
};

// Method to increment view count
courseMaterialSchema.methods.incrementView = function() {
  this.viewCount += 1;
  return this.save();
};

module.exports = mongoose.model('CourseMaterial', courseMaterialSchema);