// server/routes/settings.js
const express = require('express');
const router = express.Router();
const { rateLimiters } = require('../middleware/security');
const {
  getPublicSettings,
  getPublicSettingCategory
} = require('../controllers/settingsController');

// ========== PUBLIC SETTINGS ROUTES ==========
// These routes provide basic settings without authentication
router.get('/public', rateLimiters.general, getPublicSettings);
router.get('/public/:category', rateLimiters.general, getPublicSettingCategory);

module.exports = router;