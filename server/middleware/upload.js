const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Ensure upload directories exist
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Initialize upload directories
const uploadPaths = {
  profiles: process.env.PROFILE_IMAGES_PATH || './uploads/profiles/',
  courses: process.env.COURSE_IMAGES_PATH || './uploads/courses/',
  certificates: process.env.CERTIFICATES_PATH || './uploads/certificates/',
  resumes: process.env.RESUMES_PATH || './uploads/resumes/',
  sliders: process.env.SLIDER_IMAGES_PATH || './uploads/sliders/',
  subjects: './uploads/subjects/',
  materials: './uploads/materials/',
  team: './uploads/team/'
};

Object.values(uploadPaths).forEach(ensureDirectoryExists);

// File filter function
const fileFilter = (allowedTypes) => {
  return (req, file, cb) => {
    const allowedExtensions = allowedTypes || process.env.ALLOWED_FILE_TYPES.split(',');
    const fileExtension = path.extname(file.originalname).toLowerCase().slice(1);
    
    if (allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed types: ${allowedExtensions.join(', ')}`), false);
    }
  };
};

// Storage configuration
const createStorage = (uploadPath) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      ensureDirectoryExists(uploadPath);
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    }
  });
};

// Upload configurations
const uploadConfigs = {
  profile: multer({
    storage: createStorage(uploadPaths.profiles),
    limits: {
      fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB
    },
    fileFilter: fileFilter(['jpg', 'jpeg', 'png'])
  }),

  course: multer({
    storage: createStorage(uploadPaths.courses),
    limits: {
      fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760,
    },
    fileFilter: fileFilter(['jpg', 'jpeg', 'png', 'mp4', 'avi', 'mov'])
  }),

  certificate: multer({
    storage: createStorage(uploadPaths.certificates),
    limits: {
      fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760,
    },
    fileFilter: fileFilter(['jpg', 'jpeg', 'png', 'pdf'])
  }),

  resume: multer({
    storage: createStorage(uploadPaths.resumes),
    limits: {
      fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760,
    },
    fileFilter: fileFilter(['pdf', 'doc', 'docx'])
  }),

  slider: multer({
    storage: createStorage(uploadPaths.sliders),
    limits: {
      fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760,
    },
    fileFilter: fileFilter(['jpg', 'jpeg', 'png'])
  }),

  subject: multer({
    storage: createStorage(uploadPaths.subjects),
    limits: {
      fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760,
    },
    fileFilter: fileFilter(['jpg', 'jpeg', 'png'])
  }),

  material: multer({
    storage: createStorage(uploadPaths.materials),
    limits: {
      fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760,
    },
    fileFilter: fileFilter()
  }),

  team: multer({
    storage: createStorage(uploadPaths.team),
    limits: {
      fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760,
    },
    fileFilter: fileFilter(['jpg', 'jpeg', 'png'])
  })
};

// Error handling middleware
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size allowed is 10MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files uploaded.'
      });
    }
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  next(error);
};

// Helper function to delete file
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Helper function to get file URL
const getFileUrl = (filePath) => {
  if (!filePath) return null;
  // Remove leading slash from filePath if it exists to avoid double slashes
  const cleanPath = filePath.replace('./uploads/', 'uploads/').replace(/^\//, '');
  return `${process.env.BACKEND_URL}/${cleanPath}`;
};

module.exports = {
  uploadConfigs,
  handleUploadError,
  deleteFile,
  getFileUrl,
  uploadPaths
};