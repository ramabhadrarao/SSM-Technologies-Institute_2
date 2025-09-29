const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const { rateLimiters } = require('../middleware/security');
const { uploadConfigs, handleUploadError, getFileUrl, deleteFile } = require('../middleware/upload');
const CourseMaterial = require('../models/CourseMaterial');
const Course = require('../models/Course');
const Instructor = require('../models/Instructor');
const Student = require('../models/Student');

// Get materials for a course (for enrolled students and course instructor)
router.get('/course/:courseId', auth, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // Check if user has access to course materials
    let hasAccess = false;

    if (req.user.role === 'student') {
      // Check if student is enrolled in the course
      const student = await Student.findOne({ user: userId });
      if (student) {
        const isEnrolled = student.enrolledCourses.some(
          enrollment => enrollment.course.toString() === courseId
        );
        hasAccess = isEnrolled;
      }
    } else if (req.user.role === 'instructor') {
      // Check if instructor is assigned to this course
      const instructor = await Instructor.findOne({ user: userId });
      if (instructor) {
        const course = await Course.findById(courseId);
        hasAccess = course && course.instructor && course.instructor.toString() === instructor._id.toString();
      }
    } else if (req.user.role === 'admin') {
      hasAccess = true;
    }

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You must be enrolled in this course or be the course instructor to view materials.'
      });
    }

    const materials = await CourseMaterial.find({
      course: courseId,
      isActive: true
    })
    .populate('instructor', 'user designation')
    .populate('instructor.user', 'firstName lastName')
    .sort({ order: 1, createdAt: -1 });

    // Add full file URLs
    const materialsWithUrls = materials.map(material => ({
      ...material.toObject(),
      fileUrl: material.fileUrl ? getFileUrl(material.fileUrl) : null
    }));

    res.json({
      success: true,
      data: materialsWithUrls
    });

  } catch (error) {
    console.error('Get course materials error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course materials'
    });
  }
});

// Upload material (instructor only)
router.post('/upload/:courseId', 
  auth, 
  authorize('instructor'),
  rateLimiters.upload,
  uploadConfigs.material.single('file'),
  handleUploadError,
  async (req, res) => {
    try {
      const { courseId } = req.params;
      const { title, description, type, externalUrl, order } = req.body;
      const userId = req.user.id;

      // Verify instructor owns this course
      const instructor = await Instructor.findOne({ user: userId });
      if (!instructor) {
        return res.status(404).json({
          success: false,
          message: 'Instructor profile not found'
        });
      }

      const course = await Course.findById(courseId);
      if (!course || course.instructor.toString() !== instructor._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only upload materials to your assigned courses.'
        });
      }

      const materialData = {
        course: courseId,
        instructor: instructor._id,
        title,
        description,
        type,
        order: order ? parseInt(order) : 0
      };

      if (type === 'link' || type === 'video') {
        if (!externalUrl) {
          return res.status(400).json({
            success: false,
            message: `External URL is required for ${type} type materials`
          });
        }
        materialData.externalUrl = externalUrl;
      } else {
        if (!req.file) {
          return res.status(400).json({
            success: false,
            message: 'File is required for non-link type materials'
          });
        }
        materialData.fileUrl = req.file.path;
        materialData.fileName = req.file.originalname;
        materialData.fileSize = req.file.size;
        materialData.mimeType = req.file.mimetype;
      }

      const material = new CourseMaterial(materialData);
      await material.save();

      await material.populate('instructor', 'user designation');
      await material.populate('instructor.user', 'firstName lastName');

      res.status(201).json({
        success: true,
        message: 'Material uploaded successfully',
        data: {
          ...material.toObject(),
          fileUrl: material.fileUrl ? getFileUrl(material.fileUrl) : null
        }
      });

    } catch (error) {
      console.error('Upload material error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload material'
      });
    }
  }
);

// Update material (instructor only)
router.put('/:materialId',
  auth,
  authorize('instructor'),
  async (req, res) => {
    try {
      const { materialId } = req.params;
      const { title, description, order, isActive } = req.body;
      const userId = req.user.id;

      const instructor = await Instructor.findOne({ user: userId });
      if (!instructor) {
        return res.status(404).json({
          success: false,
          message: 'Instructor profile not found'
        });
      }

      const material = await CourseMaterial.findById(materialId);
      if (!material) {
        return res.status(404).json({
          success: false,
          message: 'Material not found'
        });
      }

      if (material.instructor.toString() !== instructor._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only update your own materials.'
        });
      }

      // Update fields
      if (title !== undefined) material.title = title;
      if (description !== undefined) material.description = description;
      if (order !== undefined) material.order = parseInt(order);
      if (isActive !== undefined) material.isActive = isActive;

      await material.save();
      await material.populate('instructor', 'user designation');
      await material.populate('instructor.user', 'firstName lastName');

      res.json({
        success: true,
        message: 'Material updated successfully',
        data: {
          ...material.toObject(),
          fileUrl: material.fileUrl ? getFileUrl(material.fileUrl) : null
        }
      });

    } catch (error) {
      console.error('Update material error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update material'
      });
    }
  }
);

// Delete material (instructor only)
router.delete('/:materialId',
  auth,
  authorize('instructor'),
  async (req, res) => {
    try {
      const { materialId } = req.params;
      const userId = req.user.id;

      const instructor = await Instructor.findOne({ user: userId });
      if (!instructor) {
        return res.status(404).json({
          success: false,
          message: 'Instructor profile not found'
        });
      }

      const material = await CourseMaterial.findById(materialId);
      if (!material) {
        return res.status(404).json({
          success: false,
          message: 'Material not found'
        });
      }

      if (material.instructor.toString() !== instructor._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only delete your own materials.'
        });
      }

      // Delete file if exists
      if (material.fileUrl) {
        deleteFile(material.fileUrl);
      }

      await CourseMaterial.findByIdAndDelete(materialId);

      res.json({
        success: true,
        message: 'Material deleted successfully'
      });

    } catch (error) {
      console.error('Delete material error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete material'
      });
    }
  }
);

// Download material (for enrolled students and course instructor)
router.get('/download/:materialId',
  auth,
  async (req, res) => {
    try {
      const { materialId } = req.params;
      const userId = req.user.id;

      const material = await CourseMaterial.findById(materialId).populate('course');
      if (!material || !material.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Material not found'
        });
      }

      // Check access permissions
      let hasAccess = false;

      if (req.user.role === 'student') {
        const student = await Student.findOne({ user: userId });
        if (student) {
          const isEnrolled = student.enrolledCourses.some(
            enrollment => enrollment.course.toString() === material.course._id.toString()
          );
          hasAccess = isEnrolled;
        }
      } else if (req.user.role === 'instructor') {
        const instructor = await Instructor.findOne({ user: userId });
        hasAccess = instructor && material.instructor.toString() === instructor._id.toString();
      } else if (req.user.role === 'admin') {
        hasAccess = true;
      }

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      // Increment download count
      await material.incrementDownload();

      if (material.type === 'link') {
        return res.json({
          success: true,
          data: {
            type: 'link',
            url: material.externalUrl
          }
        });
      }

      // For file downloads, return the file URL
      res.json({
        success: true,
        data: {
          type: 'file',
          url: getFileUrl(material.fileUrl),
          fileName: material.fileName
        }
      });

    } catch (error) {
      console.error('Download material error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to download material'
      });
    }
  }
);

module.exports = router;