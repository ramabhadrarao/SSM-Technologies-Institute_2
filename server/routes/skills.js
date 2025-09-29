// server/routes/skills.js
const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const { rateLimiters } = require('../middleware/security');
const Skill = require('../models/Skill');

// Get all skills (public - for instructors to choose from)
router.get('/', rateLimiters.general, async (req, res) => {
  try {
    const { category, search } = req.query;
    
    const query = { isActive: true };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    const skills = await Skill.find(query)
      .sort({ category: 1, name: 1 })
      .lean();
    
    res.json({
      success: true,
      data: skills
    });
  } catch (error) {
    console.error('Get skills error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get skills'
    });
  }
});

// Get skills by category (public)
router.get('/by-category', rateLimiters.general, async (req, res) => {
  try {
    const skills = await Skill.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          skills: {
            $push: {
              _id: '$_id',
              name: '$name',
              description: '$description',
              level: '$level'
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      success: true,
      data: skills
    });
  } catch (error) {
    console.error('Get skills by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get skills by category'
    });
  }
});

// Admin: Create skill
router.post('/',
  auth,
  authorize('admin'),
  rateLimiters.general,
  async (req, res) => {
    try {
      const { name, description, category, level } = req.body;
      
      // Check if skill already exists
      const existingSkill = await Skill.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') } 
      });
      
      if (existingSkill) {
        return res.status(400).json({
          success: false,
          message: 'Skill already exists'
        });
      }
      
      const skill = new Skill({
        name,
        description,
        category,
        level
      });
      
      await skill.save();
      
      res.status(201).json({
        success: true,
        message: 'Skill created successfully',
        data: skill
      });
    } catch (error) {
      console.error('Create skill error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create skill'
      });
    }
  }
);

// Admin: Update skill
router.put('/:id',
  auth,
  authorize('admin'),
  rateLimiters.general,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, category, level, isActive } = req.body;
      
      const skill = await Skill.findById(id);
      
      if (!skill) {
        return res.status(404).json({
          success: false,
          message: 'Skill not found'
        });
      }
      
      if (name) skill.name = name;
      if (description !== undefined) skill.description = description;
      if (category) skill.category = category;
      if (level) skill.level = level;
      if (typeof isActive === 'boolean') skill.isActive = isActive;
      
      await skill.save();
      
      res.json({
        success: true,
        message: 'Skill updated successfully',
        data: skill
      });
    } catch (error) {
      console.error('Update skill error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update skill'
      });
    }
  }
);

// Admin: Delete skill
router.delete('/:id',
  auth,
  authorize('admin'),
  rateLimiters.general,
  async (req, res) => {
    try {
      const { id } = req.params;
      
      const skill = await Skill.findById(id);
      
      if (!skill) {
        return res.status(404).json({
          success: false,
          message: 'Skill not found'
        });
      }
      
      // Soft delete
      skill.isActive = false;
      await skill.save();
      
      res.json({
        success: true,
        message: 'Skill deleted successfully'
      });
    } catch (error) {
      console.error('Delete skill error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete skill'
      });
    }
  }
);

module.exports = router;

// ========================================
// Add to server/app.js:
// ========================================
// const skillRoutes = require('./routes/skills');
// app.use('/api/skills', skillRoutes);