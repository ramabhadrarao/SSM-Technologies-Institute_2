const express = require('express');
const router = express.Router();
const { auth, authorize, optionalAuth } = require('../middleware/auth');
const { validate, courseSchema } = require('../middleware/validation');
const { rateLimiters } = require('../middleware/security');
const { uploadConfigs, handleUploadError } = require('../middleware/upload');
const courseController = require('../controllers/courseController');

// Public routes
router.get('/',
  rateLimiters.general,
  optionalAuth,
  courseController.getCourses
);

router.get('/:id',
  rateLimiters.general,
  optionalAuth,
  courseController.getCourse
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