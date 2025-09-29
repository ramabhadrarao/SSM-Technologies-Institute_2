// server/routes/subjects.js
const express = require('express');
const router = express.Router();
const { auth, authorize, optionalAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { rateLimiters } = require('../middleware/security');
const { uploadConfigs, handleUploadError } = require('../middleware/upload');
const Subject = require('../models/Subject');

// Get all subjects (public)
router.get('/',
  rateLimiters.public,
  optionalAuth,
  async (req, res) => {
    try {
      const { page = 1, limit = 20, search, course, sortBy = 'name', sortOrder = 'asc' } = req.query;
      
      // Build query
      const query = { isActive: true };
      
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
      
      if (course) {
        query.course = course;
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Execute query with pagination
      const subjects = await Subject.find(query)
        .populate('course', 'name')
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean();

      // Get total count for pagination
      const total = await Subject.countDocuments(query);

      res.json({
        success: true,
        data: {
          subjects: subjects,
          pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / limit),
            total,
            limit: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Get subjects error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get subjects'
      });
    }
  }
);

// Get single subject (public)
router.get('/:id',
  rateLimiters.general,
  optionalAuth,
  async (req, res) => {
    try {
      const { id } = req.params;
      
      const subject = await Subject.findOne({ _id: id, isActive: true })
        .populate('course', 'name description')
        .lean();

      if (!subject) {
        return res.status(404).json({
          success: false,
          message: 'Subject not found'
        });
      }

      res.json({
        success: true,
        data: subject
      });
    } catch (error) {
      console.error('Get subject error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get subject'
      });
    }
  }
);

// Create subject (admin/instructor)
router.post('/',
  auth,
  authorize('admin', 'instructor'),
  rateLimiters.upload,
  uploadConfigs.subject.single('image'),
  handleUploadError,
  async (req, res) => {
    try {
      const { name, description, course, syllabus } = req.body;
      
      // Check if instructor is approved (if user is instructor)
      if (req.user.role === 'instructor') {
        const Instructor = require('../models/Instructor');
        const instructor = await Instructor.findOne({ user: req.user._id });
        
        if (!instructor) {
          return res.status(404).json({
            success: false,
            message: 'Instructor profile not found'
          });
        }

        if (!instructor.isApproved) {
          return res.status(403).json({
            success: false,
            message: 'Access denied. Your instructor account is pending approval. Please wait for admin approval to create subjects.'
          });
        }
      }
      
      const subjectData = {
        name,
        description,
        course: course || null,
        syllabus: syllabus ? JSON.parse(syllabus) : []
      };

      // Add image URL if uploaded
      if (req.file) {
        subjectData.imageUrl = req.file.path;
      }

      const subject = new Subject(subjectData);
      await subject.save();

      // Populate the response
      await subject.populate('course', 'name description');

      res.status(201).json({
        success: true,
        message: 'Subject created successfully',
        data: subject
      });
    } catch (error) {
      console.error('Create subject error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create subject'
      });
    }
  }
);

// Update subject (admin/instructor)
router.put('/:id',
  auth,
  authorize('admin', 'instructor'),
  rateLimiters.upload,
  uploadConfigs.subject.single('image'),
  handleUploadError,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, course, syllabus } = req.body;
      
      const subject = await Subject.findById(id);
      if (!subject) {
        return res.status(404).json({
          success: false,
          message: 'Subject not found'
        });
      }

      // Check if instructor is approved (if user is instructor)
      if (req.user.role === 'instructor') {
        const Instructor = require('../models/Instructor');
        const instructor = await Instructor.findOne({ user: req.user._id });
        
        if (!instructor) {
          return res.status(404).json({
            success: false,
            message: 'Instructor profile not found'
          });
        }

        if (!instructor.isApproved) {
          return res.status(403).json({
            success: false,
            message: 'Access denied. Your instructor account is pending approval. Please wait for admin approval to update subjects.'
          });
        }
      }

      // Update fields
      if (name) subject.name = name;
      if (description) subject.description = description;
      if (course !== undefined) subject.course = course || null;
      if (syllabus) subject.syllabus = JSON.parse(syllabus);

      // Handle image upload
      if (req.file) {
        const { deleteFile } = require('../middleware/upload');
        // Delete old image
        if (subject.imageUrl) {
          deleteFile(subject.imageUrl);
        }
        subject.imageUrl = req.file.path;
      }

      await subject.save();

      // Populate the response
      await subject.populate('course', 'name description');

      res.json({
        success: true,
        message: 'Subject updated successfully',
        data: subject
      });
    } catch (error) {
      console.error('Update subject error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update subject'
      });
    }
  }
);

// Delete subject (admin only)
router.delete('/:id',
  auth,
  authorize('admin'),
  async (req, res) => {
    try {
      const { id } = req.params;
      
      const subject = await Subject.findById(id);
      if (!subject) {
        return res.status(404).json({
          success: false,
          message: 'Subject not found'
        });
      }

      // Soft delete
      subject.isActive = false;
      await subject.save();

      res.json({
        success: true,
        message: 'Subject deleted successfully'
      });
    } catch (error) {
      console.error('Delete subject error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete subject'
      });
    }
  }
);

module.exports = router;