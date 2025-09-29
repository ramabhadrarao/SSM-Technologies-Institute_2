const express = require('express');
const router = express.Router();
const { auth, authorize, optionalAuth } = require('../middleware/auth');
const { validate, courseSchema } = require('../middleware/validation');
const { rateLimiters } = require('../middleware/security');
const { uploadConfigs, handleUploadError } = require('../middleware/upload');
const courseController = require('../controllers/courseController');

// Public routes
router.get('/',
  rateLimiters.public,
  optionalAuth,
  courseController.getCourses
);

// Get single course (public)
router.get('/:id',
  rateLimiters.public,
  optionalAuth,
  async (req, res) => {
    try {
      const { id } = req.params;
      
      const course = await Course.findOne({ _id: id, isActive: true })
        .populate('subjects', 'name description imageUrl')
        .populate({
          path: 'instructor',
          select: 'user bio designation experience rating totalStudents imageUrl isApproved',
          populate: {
            path: 'user',
            select: 'firstName lastName email phone'
          }
        })
        .populate({
          path: 'reviews.student',
          populate: {
            path: 'user',
            select: 'firstName lastName'
          }
        })
        .lean();

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      // Add file URLs
      const { getFileUrl } = require('../middleware/upload');
      const courseWithUrls = {
        ...course,
        imageUrl: getFileUrl(course.imageUrl),
        videoUrl: course.videoUrl, // YouTube URL as is
        subjects: course.subjects?.map(subject => ({
          ...subject,
          imageUrl: getFileUrl(subject.imageUrl)
        })),
        instructor: course.instructor ? {
          ...course.instructor,
          imageUrl: getFileUrl(course.instructor.imageUrl)
        } : null
      };

      res.json({
        success: true,
        data: courseWithUrls
      });
    } catch (error) {
      console.error('Get course error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get course'
      });
    }
  }
);

// Protected routes - Admin and Instructor
router.post('/',
  auth,
  authorize('admin', 'instructor'),
  rateLimiters.upload,
  uploadConfigs.course.fields([
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 }
  ]),
  handleUploadError,
  validate(courseSchema),
  courseController.createCourse
);

router.put('/:id',
  auth,
  authorize('admin', 'instructor'),
  rateLimiters.upload,
  uploadConfigs.course.fields([
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 }
  ]),
  handleUploadError,
  validate(courseSchema),
  courseController.updateCourse
);

router.delete('/:id',
  auth,
  authorize('admin'),
  courseController.deleteCourse
);

// Student routes
router.post('/:id/review',
  auth,
  authorize('student'),
  rateLimiters.general,
  courseController.addReview
);

module.exports = router;