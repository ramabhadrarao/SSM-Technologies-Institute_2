// server/routes/team.js
const express = require('express');
const router = express.Router();
const { rateLimiters } = require('../middleware/security');
const { getPublicTeamMembers } = require('../controllers/adminTeamController');

// Public route to get active team members for About page
router.get('/',
  rateLimiters.general,
  getPublicTeamMembers
);

module.exports = router;