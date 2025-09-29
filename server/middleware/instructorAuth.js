// server/middleware/instructorAuth.js
const Instructor = require('../models/Instructor');

// Middleware to check if instructor is approved
const requireApprovedInstructor = async (req, res, next) => {
  try {
    // Check if user is an instructor
    if (req.user.role !== 'instructor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Instructor role required.'
      });
    }

    // Get instructor profile
    const instructor = await Instructor.findOne({ user: req.user._id });
    
    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Instructor profile not found'
      });
    }

    // Check if instructor is approved
    if (!instructor.isApproved) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Your instructor account is pending approval. Please wait for admin approval to access this resource.'
      });
    }

    // Add instructor to request object for use in controllers
    req.instructor = instructor;
    next();
  } catch (error) {
    console.error('Instructor approval check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify instructor approval status'
    });
  }
};

module.exports = {
  requireApprovedInstructor
};