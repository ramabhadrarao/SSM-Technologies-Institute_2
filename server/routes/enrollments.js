// server/routes/enrollments.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Student = require('../models/Student');
const Course = require('../models/Course');

// Enroll in a course
router.post('/:courseId', auth, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // Check if user is a student
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can enroll in courses'
      });
    }

    // Find the student
    const student = await Student.findOne({ user: userId });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if already enrolled
    const alreadyEnrolled = student.enrolledCourses.some(
      enrollment => enrollment.course.toString() === courseId
    );

    if (alreadyEnrolled) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course'
      });
    }

    // Add enrollment
    student.enrolledCourses.push({
      course: courseId,
      enrolledAt: new Date(),
      status: 'active',
      progress: 0
    });

    await student.save();

    // Update course enrollment count
    await Course.findByIdAndUpdate(courseId, {
      $inc: { enrollmentCount: 1 }
    });

    res.status(200).json({
      success: true,
      message: 'Successfully enrolled in course',
      data: {
        courseId,
        enrolledAt: new Date()
      }
    });

  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enroll in course'
    });
  }
});

// Get user's enrollments
router.get('/my', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user is a student
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can view enrollments'
      });
    }

    const student = await Student.findOne({ user: userId })
      .populate({
        path: 'enrolledCourses.course',
        select: 'name description fees duration level category image'
      });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        enrollments: student.enrolledCourses
      }
    });

  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enrollments'
    });
  }
});

// Update enrollment progress
router.put('/:enrollmentId/progress', auth, async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { progress } = req.body;
    const userId = req.user.id;

    // Validate progress
    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
      return res.status(400).json({
        success: false,
        message: 'Progress must be a number between 0 and 100'
      });
    }

    const student = await Student.findOne({ user: userId });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    const enrollment = student.enrolledCourses.id(enrollmentId);
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    enrollment.progress = progress;
    if (progress === 100) {
      enrollment.status = 'completed';
      enrollment.completedAt = new Date();
    }

    await student.save();

    res.status(200).json({
      success: true,
      message: 'Progress updated successfully',
      data: {
        enrollmentId,
        progress,
        status: enrollment.status
      }
    });

  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update progress'
    });
  }
});

module.exports = router;