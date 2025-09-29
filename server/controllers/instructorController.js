// server/controllers/instructorController.js - Updated Version
const User = require('../models/User');
const Instructor = require('../models/Instructor');

// Update instructor profile
const updateInstructorProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      bio,
      designation,
      experience,
      specializations,
      education,
      certificates,
      socialLinks,
      imageUrl,
      resumeUrl,
      skills // Array of skill IDs
    } = req.body;

    // Find or create instructor profile
    let instructor = await Instructor.findOne({ user: userId });
    
    if (!instructor) {
      // Create new instructor profile if it doesn't exist
      instructor = new Instructor({
        user: userId,
        bio: '',
        designation: '',
        experience: 0,
        skills: [],
        specializations: [],
        education: [],
        certificates: [],
        socialLinks: {},
        isApproved: false,
        isActive: true,
        rating: 0,
        totalStudents: 0
      });
      console.log(`✅ Created new instructor profile for user: ${userId}`);
    }

    // Update fields
    if (bio !== undefined) instructor.bio = bio;
    if (designation !== undefined) instructor.designation = designation;
    if (experience !== undefined) instructor.experience = experience;
    if (specializations !== undefined) instructor.specializations = specializations;
    if (education !== undefined) instructor.education = education;
    if (certificates !== undefined) instructor.certificates = certificates;
    if (socialLinks !== undefined) instructor.socialLinks = socialLinks;
    if (imageUrl !== undefined) instructor.imageUrl = imageUrl;
    if (resumeUrl !== undefined) instructor.resumeUrl = resumeUrl;
    
    // Update skills - store only skill IDs as references
    if (skills !== undefined) {
      if (Array.isArray(skills)) {
        // Validate that all items are valid ObjectIds
        const validSkills = skills.filter(skillId => {
          return typeof skillId === 'string' && skillId.match(/^[0-9a-fA-F]{24}$/);
        });
        instructor.skills = validSkills;
        console.log(`✅ Updated skills for instructor: ${validSkills.length} skills`);
      } else {
        console.warn('⚠️ Skills is not an array, ignoring');
      }
    }

    await instructor.save();

    // Populate skills for response
    await instructor.populate('skills', 'name category description level');

    console.log(`✅ Instructor profile updated successfully: ${userId}`);

    res.json({
      success: true,
      message: 'Instructor profile updated successfully',
      data: {
        instructorProfile: instructor
      }
    });
  } catch (error) {
    console.error('Update instructor profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update instructor profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get instructor profile
const getInstructorProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const instructor = await Instructor.findOne({ user: userId })
      .populate('skills', 'name category description level');
    
    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Instructor profile not found'
      });
    }

    res.json({
      success: true,
      data: {
        instructorProfile: instructor
      }
    });
  } catch (error) {
    console.error('Get instructor profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get instructor profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get public instructor profile (for course pages, etc.)
const getPublicInstructorProfile = async (req, res) => {
  try {
    const { id } = req.params;
    
    const instructor = await Instructor.findById(id)
      .populate('user', 'firstName lastName email')
      .populate('skills', 'name category')
      .select('-isActive -__v');
    
    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Instructor not found'
      });
    }

    // Only show approved instructors publicly
    if (!instructor.isApproved) {
      return res.status(404).json({
        success: false,
        message: 'Instructor not found'
      });
    }

    res.json({
      success: true,
      data: instructor
    });
  } catch (error) {
    console.error('Get public instructor profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get instructor profile'
    });
  }
};

// Get instructor statistics (for dashboard)
const getInstructorStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const instructor = await Instructor.findOne({ user: userId });
    
    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Instructor profile not found'
      });
    }

    // Get courses count
    const Course = require('../models/Course');
    const coursesCount = await Course.countDocuments({ 
      instructor: instructor._id,
      isActive: true 
    });

    // Get batches count
    const Batch = require('../models/Batch');
    const batchesCount = await Batch.countDocuments({ 
      instructor: instructor._id,
      isActive: true 
    });

    // Get total students from all batches
    const batches = await Batch.find({ 
      instructor: instructor._id,
      isActive: true 
    });
    
    const totalStudents = batches.reduce((acc, batch) => {
      return acc + batch.enrolledStudents.filter(e => e.status === 'active').length;
    }, 0);

    // Calculate average course rating
    const courses = await Course.find({ 
      instructor: instructor._id,
      isActive: true 
    }).select('rating');
    
    const avgRating = courses.length > 0
      ? courses.reduce((acc, course) => acc + (course.rating || 0), 0) / courses.length
      : 0;

    res.json({
      success: true,
      data: {
        coursesCount,
        batchesCount,
        totalStudents,
        avgRating: Math.round(avgRating * 10) / 10,
        isApproved: instructor.isApproved,
        rating: instructor.rating,
        experience: instructor.experience,
        skillsCount: instructor.skills.length
      }
    });
  } catch (error) {
    console.error('Get instructor stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get instructor statistics'
    });
  }
};

module.exports = {
  updateInstructorProfile,
  getInstructorProfile,
  getPublicInstructorProfile,
  getInstructorStats
};