// server/controllers/instructorController.js
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
      resumeUrl
    } = req.body;

    // Find the instructor profile
    let instructor = await Instructor.findOne({ user: userId });
    
    if (!instructor) {
      // Create instructor profile if it doesn't exist
      instructor = new Instructor({
        user: userId,
        bio: '',
        designation: '',
        experience: 0,
        specializations: [],
        education: [],
        certificates: [],
        socialLinks: {},
        isApproved: false
      });
    }

    // Update instructor profile fields
    if (bio !== undefined) instructor.bio = bio;
    if (designation !== undefined) instructor.designation = designation;
    if (experience !== undefined) instructor.experience = experience;
    if (specializations !== undefined) instructor.specializations = specializations;
    if (education !== undefined) instructor.education = education;
    if (certificates !== undefined) instructor.certificates = certificates;
    if (socialLinks !== undefined) instructor.socialLinks = socialLinks;
    if (imageUrl !== undefined) instructor.imageUrl = imageUrl;
    if (resumeUrl !== undefined) instructor.resumeUrl = resumeUrl;

    await instructor.save();

    console.log(`✅ Instructor profile updated: ${req.user.email}`);

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
      message: 'Failed to update instructor profile'
    });
  }
};

// Get instructor profile
const getInstructorProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const instructor = await Instructor.findOne({ user: userId })
      .populate('skills', 'name category');
    
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
      message: 'Failed to get instructor profile'
    });
  }
};

module.exports = {
  updateInstructorProfile,
  getInstructorProfile
};