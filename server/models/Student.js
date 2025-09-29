const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  enrolledCourses: [{
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    completedSubjects: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject'
    }],
    status: {
      type: String,
      enum: ['active', 'completed', 'suspended', 'dropped'],
      default: 'active'
    }
  }],
  batches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch'
  }],
  attendance: [{
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch'
    },
    date: Date,
    status: {
      type: String,
      enum: ['present', 'absent', 'late'],
      required: true
    },
    classId: String
  }],
  assignments: [{
    title: String,
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject'
    },
    submittedAt: Date,
    fileUrl: String,
    grade: {
      type: Number,
      min: 0,
      max: 100
    },
    feedback: String
  }],
  performance: {
    overallGrade: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    attendancePercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    assignmentCompletion: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  }
}, {
  timestamps: true
});

// Indexes
studentSchema.index({ user: 1 });
studentSchema.index({ 'enrolledCourses.course': 1 });
studentSchema.index({ 'enrolledCourses.status': 1 });

module.exports = mongoose.model('Student', studentSchema);