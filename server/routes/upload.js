const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { rateLimiters } = require('../middleware/security');
const { uploadConfigs, handleUploadError, getFileUrl } = require('../middleware/upload');

// Helper function to get upload config based on type
const getUploadConfig = (type) => {
  switch (type) {
    case 'profile':
      return uploadConfigs.profile.single('file');
    case 'resume':
      return uploadConfigs.resume.single('file');
    case 'certificate':
      return uploadConfigs.certificate.single('file');
    case 'course':
      return uploadConfigs.course.single('file');
    case 'material':
      return uploadConfigs.material.single('file');
    default:
      return uploadConfigs.profile.single('file'); // Default to profile config
  }
};

// General file upload endpoint
router.post('/', 
  auth,
  rateLimiters.upload,
  (req, res, next) => {
    // First, we need to parse the form data to get the type
    // Use a temporary multer instance to parse form data
    const multer = require('multer');
    const tempUpload = multer().none();
    
    tempUpload(req, res, (err) => {
      if (err) return next(err);
      
      // Now we can access req.body.type
      const uploadType = req.body.type || req.query.type || 'profile';
      
      console.log('Upload request received:', {
        uploadType,
        bodyType: req.body.type,
        queryType: req.query.type,
        bodyKeys: Object.keys(req.body || {}),
        queryKeys: Object.keys(req.query || {})
      });
      
      // Get the appropriate upload config
      const uploadConfig = getUploadConfig(uploadType);
      
      // Now process the file upload with the correct config
      uploadConfig(req, res, next);
    });
  },
  handleUploadError,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file provided'
        });
      }

      const fileUrl = getFileUrl(req.file.path);

      res.json({
        success: true,
        message: 'File uploaded successfully',
        data: {
          url: fileUrl,
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype
        }
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload file'
      });
    }
  }
);

module.exports = router;