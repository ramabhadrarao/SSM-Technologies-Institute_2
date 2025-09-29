const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
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
  schedule: [{
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 6
    },
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject'
    }
  }],
  classes: [{
    date: {
      type: Date,
      required: true
    },
    startTime: String,
    endTime: String,
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject'
    },
    meetingLink: String,
    recordingUrl: String,
    status: {
      type: String,
      enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
      default: 'scheduled'
    },
    attendance: [{
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
      },
      status: {
        type: String,
        enum: ['present', 'absent', 'late'],
        default: 'absent'
      },
      joinTime: Date,
      leaveTime: Date
    }]
  }],
  maxStudents: {
    type: Number,
    required: true,
    min: 1
  },
  enrolledStudents: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'completed'],
      default: 'active'
    }
  }],
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
batchSchema.index({ course: 1 });
batchSchema.index({ instructor: 1 });
batchSchema.index({ startDate: 1 });
batchSchema.index({ isActive: 1 });

module.exports = mongoose.model('Batch', batchSchema);