const mongoose = require('mongoose');

const sliderSchema = new mongoose.Schema({
  title: {
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
    required: true
  },
  buttonText: {
    type: String,
    default: 'Learn More'
  },
  buttonLink: {
    type: String,
    default: '#'
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
sliderSchema.index({ order: 1 });
sliderSchema.index({ isActive: 1 });

module.exports = mongoose.model('Slider', sliderSchema);