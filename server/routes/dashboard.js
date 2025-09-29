// server/routes/dashboard.js
const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const { rateLimiters } = require('../middleware/security');
const {
  getAdminDashboard,
  getStudentDashboard,
  getInstructorDashboard
} = require('../controllers/dashboardController');

// Admin Dashboard
router.get('/admin',
  auth,
  authorize('admin'),
  rateLimiters.general,
  getAdminDashboard
);

// Student Dashboard
router.get('/student',
  auth,
  authorize('student'),
  rateLimiters.general,
  getStudentDashboard
);

// Instructor Dashboard
router.get('/instructor',
  auth,
  authorize('instructor'),
  rateLimiters.general,
  getInstructorDashboard
);

module.exports = router;