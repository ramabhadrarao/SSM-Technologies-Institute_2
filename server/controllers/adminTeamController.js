const Team = require('../models/Team');
const path = require('path');
const fs = require('fs').promises;
const { getFileUrl } = require('../middleware/upload');

// Get all team members
const getAllTeamMembers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', department = 'all', status = 'all' } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (department !== 'all') {
      filter.department = department;
    }
    
    if (status !== 'all') {
      filter.isActive = status === 'active';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [teamMembers, total] = await Promise.all([
      Team.find(filter)
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Team.countDocuments(filter)
    ]);

    // Add full URLs for images
    const teamMembersWithUrls = teamMembers.map(member => ({
      ...member.toObject(),
      imageUrl: getFileUrl(member.imageUrl)
    }));

    // Get stats
    const stats = await Team.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: ['$isActive', 1, 0] } },
          inactive: { $sum: { $cond: ['$isActive', 0, 1] } }
        }
      }
    ]);

    const departmentStats = await Team.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        teamMembers: teamMembersWithUrls,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        },
        stats: stats[0] || { total: 0, active: 0, inactive: 0 },
        departmentStats
      }
    });
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch team members',
      error: error.message
    });
  }
};

// Get single team member
const getTeamMember = async (req, res) => {
  try {
    const teamMember = await Team.findById(req.params.id);
    
    if (!teamMember) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    res.json({
      success: true,
      data: {
        ...teamMember.toObject(),
        imageUrl: getFileUrl(teamMember.imageUrl)
      }
    });
  } catch (error) {
    console.error('Error fetching team member:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch team member',
      error: error.message
    });
  }
};

// Create new team member
const createTeamMember = async (req, res) => {
  try {
    const {
      name,
      designation,
      bio,
      department,
      experience,
      email,
      phone,
      socialLinks,
      order,
      isActive
    } = req.body;

    // Handle image upload
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/team/${req.file.filename}`;
    }

    const teamMember = new Team({
      name,
      designation,
      bio,
      department,
      experience,
      email,
      phone,
      socialLinks: socialLinks ? JSON.parse(socialLinks) : {},
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
      imageUrl
    });

    await teamMember.save();

    res.status(201).json({
      success: true,
      message: 'Team member created successfully',
      data: teamMember
    });
  } catch (error) {
    console.error('Error creating team member:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create team member',
      error: error.message
    });
  }
};

// Update team member
const updateTeamMember = async (req, res) => {
  try {
    const {
      name,
      designation,
      bio,
      department,
      experience,
      email,
      phone,
      socialLinks,
      order,
      isActive
    } = req.body;

    const teamMember = await Team.findById(req.params.id);
    
    if (!teamMember) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    // Handle image upload
    if (req.file) {
      // Delete old image if exists
      if (teamMember.imageUrl) {
        const oldImagePath = path.join(__dirname, '..', teamMember.imageUrl);
        try {
          await fs.unlink(oldImagePath);
        } catch (err) {
          console.log('Old image not found or already deleted');
        }
      }
      teamMember.imageUrl = `/uploads/team/${req.file.filename}`;
    }

    // Update fields
    teamMember.name = name || teamMember.name;
    teamMember.designation = designation || teamMember.designation;
    teamMember.bio = bio || teamMember.bio;
    teamMember.department = department || teamMember.department;
    teamMember.experience = experience || teamMember.experience;
    teamMember.email = email || teamMember.email;
    teamMember.phone = phone || teamMember.phone;
    teamMember.order = order !== undefined ? order : teamMember.order;
    teamMember.isActive = isActive !== undefined ? isActive : teamMember.isActive;
    
    if (socialLinks) {
      teamMember.socialLinks = JSON.parse(socialLinks);
    }

    await teamMember.save();

    res.json({
      success: true,
      message: 'Team member updated successfully',
      data: teamMember
    });
  } catch (error) {
    console.error('Error updating team member:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update team member',
      error: error.message
    });
  }
};

// Delete team member
const deleteTeamMember = async (req, res) => {
  try {
    const teamMember = await Team.findById(req.params.id);
    
    if (!teamMember) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    // Delete image file if exists
    if (teamMember.imageUrl) {
      const imagePath = path.join(__dirname, '..', teamMember.imageUrl);
      try {
        await fs.unlink(imagePath);
      } catch (err) {
        console.log('Image file not found or already deleted');
      }
    }

    await Team.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Team member deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting team member:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete team member',
      error: error.message
    });
  }
};

// Bulk delete team members
const bulkDeleteTeamMembers = async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid team member IDs'
      });
    }

    // Get team members to delete their images
    const teamMembers = await Team.find({ _id: { $in: ids } });
    
    // Delete image files
    for (const member of teamMembers) {
      if (member.imageUrl) {
        const imagePath = path.join(__dirname, '..', member.imageUrl);
        try {
          await fs.unlink(imagePath);
        } catch (err) {
          console.log(`Image file not found: ${member.imageUrl}`);
        }
      }
    }

    const result = await Team.deleteMany({ _id: { $in: ids } });

    res.json({
      success: true,
      message: `${result.deletedCount} team members deleted successfully`
    });
  } catch (error) {
    console.error('Error bulk deleting team members:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete team members',
      error: error.message
    });
  }
};

// Get public team members (for About page)
const getPublicTeamMembers = async (req, res) => {
  try {
    const teamMembers = await Team.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .select('-createdAt -updatedAt');

    // Add full URLs for images
    const teamMembersWithUrls = teamMembers.map(member => ({
      ...member.toObject(),
      imageUrl: getFileUrl(member.imageUrl)
    }));

    res.json({
      success: true,
      data: teamMembersWithUrls
    });
  } catch (error) {
    console.error('Error fetching public team members:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch team members',
      error: error.message
    });
  }
};

module.exports = {
  getAllTeamMembers,
  getTeamMember,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  bulkDeleteTeamMembers,
  getPublicTeamMembers
};