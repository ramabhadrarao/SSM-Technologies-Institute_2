// server/controllers/instructorController.js - Complete Updated Version
const User = require('../models/User');
const Instructor = require('../models/Instructor');
const { getFileUrl, deleteFile } = require('../middleware/upload');

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
    if (education !== undefined) {
      // Parse education if it's a string
      instructor.education = typeof education === 'string' ? JSON.parse(education) : education;
    }
    if (certificates !== undefined) {
      // Parse certificates if it's a string
      instructor.certificates = typeof certificates === 'string' ? JSON.parse(certificates) : certificates;
    }
    if (socialLinks !== undefined) {
      // Parse socialLinks if it's a string
      instructor.socialLinks = typeof socialLinks === 'string' ? JSON.parse(socialLinks) : socialLinks;
    }
    
    // Handle file uploads if they exist in req.files
    if (req.files) {
      // Handle profile image
      if (req.files.profileImage) {
        // Delete old image if exists
        if (instructor.imageUrl) {
          deleteFile(instructor.imageUrl);
        }
        instructor.imageUrl = req.files.profileImage[0].path;
        console.log(`✅ Profile image uploaded: ${req.files.profileImage[0].path}`);
      }
      
      // Handle resume
      if (req.files.resume) {
        // Delete old resume if exists
        if (instructor.resumeUrl) {
          deleteFile(instructor.resumeUrl);
        }
        instructor.resumeUrl = req.files.resume[0].path;
        console.log(`✅ Resume uploaded: ${req.files.resume[0].path}`);
      }
      
      // Handle certificates
      if (req.files.certificates) {
        console.log(`📎 Processing ${req.files.certificates.length} certificate files`);
        
        // Map certificate files to the certificates array
        req.files.certificates.forEach((file, index) => {
          if (instructor.certificates[index]) {
            // Delete old certificate file if exists
            if (instructor.certificates[index].url) {
              deleteFile(instructor.certificates[index].url);
            }
            instructor.certificates[index].url = file.path;
            console.log(`✅ Certificate ${index} uploaded: ${file.path}`);
          }
        });
      }
    }
    
    // Handle single file uploads (backward compatibility)
    if (req.file) {
      // Determine file type based on field name
      if (req.body.fileType === 'profileImage') {
        if (instructor.imageUrl) {
          deleteFile(instructor.imageUrl);
        }
        instructor.imageUrl = req.file.path;
      } else if (req.body.fileType === 'resume') {
        if (instructor.resumeUrl) {
          deleteFile(instructor.resumeUrl);
        }
        instructor.resumeUrl = req.file.path;
      }
    }
    
    // Update skills - store only skill IDs as references
    if (skills !== undefined) {
      let skillArray = skills;
      
      // Parse if it's a JSON string
      if (typeof skills === 'string') {
        try {
          skillArray = JSON.parse(skills);
        } catch (e) {
          skillArray = skills.split(',').map(s => s.trim());
        }
      }
      
      if (Array.isArray(skillArray)) {
        // Validate that all items are valid ObjectIds
        const validSkills = skillArray.filter(skillId => {
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

    // Add file URLs to response
    const responseData = instructor.toObject();
    responseData.imageUrl = getFileUrl(responseData.imageUrl);
    responseData.resumeUrl = getFileUrl(responseData.resumeUrl);
    if (responseData.certificates) {
      responseData.certificates = responseData.certificates.map(cert => ({
        ...cert,
        url: getFileUrl(cert.url)
      }));
    }

    res.json({
      success: true,
      message: 'Instructor profile updated successfully',
      data: {
        instructorProfile: responseData
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

    // Add file URLs
    const responseData = instructor.toObject();
    responseData.imageUrl = getFileUrl(responseData.imageUrl);
    responseData.resumeUrl = getFileUrl(responseData.resumeUrl);
    if (responseData.certificates) {
      responseData.certificates = responseData.certificates.map(cert => ({
        ...cert,
        url: getFileUrl(cert.url)
      }));
    }

    res.json({
      success: true,
      data: {
        instructorProfile: responseData
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

// Upload instructor file (for single file uploads)
const uploadInstructorFile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { fileType } = req.body; // profileImage, resume, or certificate
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    const instructor = await Instructor.findOne({ user: userId });
    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Instructor profile not found'
      });
    }
    
    const fileUrl = getFileUrl(req.file.path);
    
    // Update the appropriate field based on file type
    if (fileType === 'profileImage') {
      if (instructor.imageUrl) {
        deleteFile(instructor.imageUrl);
      }
      instructor.imageUrl = req.file.path;
    } else if (fileType === 'resume') {
      if (instructor.resumeUrl) {
        deleteFile(instructor.resumeUrl);
      }
      instructor.resumeUrl = req.file.path;
    }
    
    await instructor.save();
    
    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        url: fileUrl,
        path: req.file.path,
        fileType
      }
    });
  } catch (error) {
    console.error('Upload instructor file error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file',
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

    // Add file URLs
    const responseData = instructor.toObject();
    responseData.imageUrl = getFileUrl(responseData.imageUrl);
    responseData.resumeUrl = getFileUrl(responseData.resumeUrl);
    if (responseData.certificates) {
      responseData.certificates = responseData.certificates.map(cert => ({
        ...cert,
        url: getFileUrl(cert.url)
      }));
    }

    res.json({
      success: true,
      data: responseData
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
  uploadInstructorFile,
  getPublicInstructorProfile,
  getInstructorStats
};