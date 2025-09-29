// server/routes/admin.js
const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const { validate, registerSchema, courseSchema, batchSchema } = require('../middleware/validation');
const { rateLimiters } = require('../middleware/security');
const { uploadConfigs, handleUploadError } = require('../middleware/upload');

// Import all admin controllers
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  bulkUpdateUsers,
  getUserStats
} = require('../controllers/adminController');

const {
  getAdminCourses,
  getAdminCourse,
  createAdminCourse,
  updateAdminCourse,
  deleteAdminCourse,
  bulkUpdateCourses,
  getCourseStats,
  getAvailableInstructors
} = require('../controllers/adminCourseController');

const {
  getAdminBatches,
  getAdminBatch,
  createAdminBatch,
  updateAdminBatch,
  deleteAdminBatch,
  addStudentsToBatch,
  removeStudentFromBatch,
  getBatchStats,
  scheduleClass,
  updateClassAttendance
} = require('../controllers/adminBatchController');

const {
  getContactMessages,
  getContactMessage,
  updateMessageStatus,
  updateMessagePriority,
  replyToMessage,
  deleteContactMessage,
  bulkUpdateMessages,
  getContactStats
} = require('../controllers/contactController');

const {
  getDashboardAnalytics,
  getUserAnalytics,
  getCourseAnalytics,
  getFinancialAnalytics,
  getInstructorAnalytics,
  getStudentAnalytics,
  generateCustomReport
} = require('../controllers/analyticsController');

const {
  getSystemSettings,
  getSettingCategory,
  updateSystemSettings,
  resetSettings,
  getSystemInfo,
  backupSystem,
  testEmailConfig,
  getMaintenanceMode,
  toggleMaintenanceMode
} = require('../controllers/settingsController');

const {
  getAdminSubjects,
  getAdminSubject,
  createAdminSubject,
  updateAdminSubject,
  deleteAdminSubject,
  bulkUpdateSubjects,
  getSubjectStats,
  addSubjectMaterial,
  removeSubjectMaterial
} = require('../controllers/adminSubjectController');

const {
  getAllTeamMembers,
  getTeamMember,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  bulkDeleteTeamMembers
} = require('../controllers/adminTeamController');

// All routes require admin authentication
router.use(auth);
router.use(authorize('admin'));

// ========== USER MANAGEMENT ROUTES ==========
router.get('/users/stats', rateLimiters.general, getUserStats);
router.get('/users', rateLimiters.general, getUsers);
router.get('/users/:id', rateLimiters.general, getUser);
router.post('/users', rateLimiters.general, validate(registerSchema), createUser);
router.put('/users/:id', rateLimiters.general, updateUser);
router.delete('/users/:id', rateLimiters.general, deleteUser);
router.patch('/users/:id/toggle-status', rateLimiters.general, toggleUserStatus);
router.patch('/users/bulk-update', rateLimiters.general, bulkUpdateUsers);

// ========== COURSE MANAGEMENT ROUTES ==========
router.get('/courses/stats', rateLimiters.general, getCourseStats);
router.get('/courses/instructors', rateLimiters.general, getAvailableInstructors);
router.get('/courses', rateLimiters.general, getAdminCourses);
router.get('/courses/:id', rateLimiters.general, getAdminCourse);
router.post('/courses', 
  rateLimiters.upload,
  uploadConfigs.course.fields([
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 }
  ]),
  handleUploadError,
  createAdminCourse
);
router.put('/courses/:id',
  rateLimiters.upload,
  uploadConfigs.course.fields([
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 }
  ]),
  handleUploadError,
  updateAdminCourse
);
router.delete('/courses/:id', rateLimiters.general, deleteAdminCourse);
router.patch('/courses/bulk-update', rateLimiters.general, bulkUpdateCourses);

// ========== SUBJECT MANAGEMENT ROUTES ==========
router.get('/subjects/stats', rateLimiters.general, getSubjectStats);
router.get('/subjects', rateLimiters.general, getAdminSubjects);
router.get('/subjects/:id', rateLimiters.general, getAdminSubject);
router.post('/subjects', 
  rateLimiters.upload,
  uploadConfigs.subject.single('image'),
  handleUploadError,
  createAdminSubject
);
router.put('/subjects/:id',
  rateLimiters.upload,
  uploadConfigs.subject.single('image'),
  handleUploadError,
  updateAdminSubject
);
router.delete('/subjects/:id', rateLimiters.general, deleteAdminSubject);
router.patch('/subjects/bulk-update', rateLimiters.general, bulkUpdateSubjects);
router.post('/subjects/:id/materials',
  rateLimiters.upload,
  uploadConfigs.material.single('file'),
  handleUploadError,
  addSubjectMaterial
);
router.delete('/subjects/:id/materials/:materialId', rateLimiters.general, removeSubjectMaterial);

// ========== TEAM MANAGEMENT ROUTES ==========
router.get('/team', rateLimiters.general, getAllTeamMembers);
router.get('/team/:id', rateLimiters.general, getTeamMember);
router.post('/team', 
  rateLimiters.upload,
  uploadConfigs.team.single('image'),
  handleUploadError,
  createTeamMember
);
router.put('/team/:id',
  rateLimiters.upload,
  uploadConfigs.team.single('image'),
  handleUploadError,
  updateTeamMember
);
router.delete('/team/:id', rateLimiters.general, deleteTeamMember);
router.delete('/team', rateLimiters.general, bulkDeleteTeamMembers);

// ========== BATCH MANAGEMENT ROUTES ==========
router.get('/batches/stats', rateLimiters.general, getBatchStats);
router.get('/batches', rateLimiters.general, getAdminBatches);
router.get('/batches/:id', rateLimiters.general, getAdminBatch);
router.post('/batches', rateLimiters.general, createAdminBatch);
router.put('/batches/:id', rateLimiters.general, updateAdminBatch);
router.delete('/batches/:id', rateLimiters.general, deleteAdminBatch);
router.post('/batches/:id/students', rateLimiters.general, addStudentsToBatch);
router.delete('/batches/:id/students/:studentId', rateLimiters.general, removeStudentFromBatch);
router.post('/batches/:id/classes', rateLimiters.general, scheduleClass);
router.put('/batches/:id/classes/:classId/attendance', rateLimiters.general, updateClassAttendance);

// ========== MESSAGES & SUPPORT ROUTES ==========
router.get('/messages/stats', rateLimiters.general, getContactStats);
router.get('/messages', rateLimiters.general, getContactMessages);
router.get('/messages/:id', rateLimiters.general, getContactMessage);
router.patch('/messages/:id/status', rateLimiters.general, updateMessageStatus);
router.patch('/messages/:id/priority', rateLimiters.general, updateMessagePriority);
router.post('/messages/:id/reply', rateLimiters.general, replyToMessage);
router.delete('/messages/:id', rateLimiters.general, deleteContactMessage);
router.patch('/messages/bulk-update', rateLimiters.general, bulkUpdateMessages);

// ========== ANALYTICS & REPORTS ROUTES ==========
router.get('/analytics/dashboard', rateLimiters.general, getDashboardAnalytics);
router.get('/analytics/users', rateLimiters.general, getUserAnalytics);
router.get('/analytics/courses', rateLimiters.general, getCourseAnalytics);
router.get('/analytics/financial', rateLimiters.general, getFinancialAnalytics);
router.get('/analytics/instructors', rateLimiters.general, getInstructorAnalytics);
router.get('/analytics/students', rateLimiters.general, getStudentAnalytics);
router.post('/reports/generate', rateLimiters.general, generateCustomReport);

// ========== SYSTEM SETTINGS ROUTES ==========
router.get('/settings', rateLimiters.general, getSystemSettings);
router.get('/settings/:category', rateLimiters.general, getSettingCategory);
router.put('/settings', rateLimiters.general, updateSystemSettings);
router.post('/settings/reset', rateLimiters.general, resetSettings);
router.get('/system/info', rateLimiters.general, getSystemInfo);
router.post('/system/backup', rateLimiters.general, backupSystem);
router.post('/system/test-email', rateLimiters.general, testEmailConfig);
router.get('/system/maintenance', rateLimiters.general, getMaintenanceMode);
router.post('/system/maintenance', rateLimiters.general, toggleMaintenanceMode);

module.exports = router;