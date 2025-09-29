const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { validate, registerSchema, loginSchema, updateProfileSchema } = require('../middleware/validation');
const { rateLimiters } = require('../middleware/security');
const { uploadConfigs, handleUploadError } = require('../middleware/upload');
const authController = require('../controllers/authController');
const instructorController = require('../controllers/instructorController');

// Public routes
router.post('/register', 
  rateLimiters.auth,
  validate(registerSchema),
  authController.register
);

router.post('/login',
  rateLimiters.auth,
  validate(loginSchema),
  authController.login
);

router.post('/refresh-token',
  rateLimiters.auth,
  authController.refreshToken
);

router.post('/forgot-password',
  rateLimiters.auth,
  authController.forgotPassword
);

router.post('/reset-password',
  rateLimiters.auth,
  authController.resetPassword
);

router.get('/validate-reset-token/:token', authController.validateResetToken);

// Protected routes
router.post('/logout',
  auth,
  authController.logout
);

router.get('/profile',
  auth,
  authController.getProfile
);

router.put('/profile',
  auth,
  validate(updateProfileSchema),
  authController.updateProfile
);

router.post('/change-password',
  auth,
  rateLimiters.auth,
  authController.changePassword
);

router.put('/instructor-profile',
  auth,
  instructorController.updateInstructorProfile
);

router.get('/instructor-profile',
  auth,
  instructorController.getInstructorProfile
);

router.post('/upload-profile-image',
  auth,
  rateLimiters.upload,
  uploadConfigs.profile.single('image'),
  handleUploadError,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file provided'
        });
      }

      const User = require('../models/User');
      const { getFileUrl, deleteFile } = require('../middleware/upload');
      
      const user = await User.findById(req.user._id);
      
      // Delete old profile image
      if (user.profileImageUrl) {
        deleteFile(user.profileImageUrl);
      }
      
      // Update profile image URL
      user.profileImageUrl = req.file.path;
      await user.save();

      res.json({
        success: true,
        message: 'Profile image uploaded successfully',
        data: {
          profileImageUrl: getFileUrl(req.file.path)
        }
      });
    } catch (error) {
      console.error('Upload profile image error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload profile image'
      });
    }
  }
);

module.exports = router;