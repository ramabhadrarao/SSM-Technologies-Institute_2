// server/routes/contact.js
const express = require('express');
const router = express.Router();
const { validate, contactMessageSchema } = require('../middleware/validation');
const { 
  enhancedContactRateLimit,
  validateHoneypot,
  validateContent,
  validateCaptcha,
  checkIPReputation,
  generateRequestFingerprint,
  validateSubmissionTiming,
  enhancedSanitization,
  contactSecurityHeaders
} = require('../middleware/contactSecurity');
const { createContactMessage } = require('../controllers/contactController');

// Apply security headers to all contact routes
router.use(contactSecurityHeaders);

// Public route for submitting contact messages
router.post('/', 
  // Security middleware chain
  generateRequestFingerprint,
  checkIPReputation,
  enhancedSanitization,
  validateHoneypot,
  validateSubmissionTiming,
  enhancedContactRateLimit,
  validateCaptcha,
  validateContent,
  validate(contactMessageSchema),
  createContactMessage
);

module.exports = router;