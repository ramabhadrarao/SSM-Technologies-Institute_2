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
    default: null,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow null/empty values
        // YouTube URL validation regex
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]+(&[\w=]*)?$/;
        return youtubeRegex.test(v);
      },
      message: 'Please provide a valid YouTube URL'
    }
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

// Helper method to extract YouTube video ID from URL
courseSchema.methods.getYouTubeVideoId = function() {
  if (!this.videoUrl) return null;
  
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = this.videoUrl.match(regex);
  return match ? match[1] : null;
};

// Helper method to get YouTube embed URL
courseSchema.methods.getYouTubeEmbedUrl = function() {
  const videoId = this.getYouTubeVideoId();
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
};

// Helper method to get YouTube thumbnail URL
courseSchema.methods.getYouTubeThumbnail = function(quality = 'maxresdefault') {
  const videoId = this.getYouTubeVideoId();
  return videoId ? `https://img.youtube.com/vi/${videoId}/${quality}.jpg` : null;
};

module.exports = mongoose.model('Course', courseSchema);