// server/controllers/adminController.js
const User = require('../models/User');
const Student = require('../models/Student');
const Instructor = require('../models/Instructor');

// Get all users with filtering and pagination
const getUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      role, 
      status, 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;

    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role && role !== 'all') {
      query.role = role;
    }
    
    if (status && status !== 'all') {
      query.isActive = status === 'active';
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const users = await User.find(query)
      .select('-password -refreshToken')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Get total count for pagination
    const total = await User.countDocuments(query);

    // Get additional profile data for each user
    const enrichedUsers = await Promise.all(users.map(async (user) => {
      let profileData = {};
      
      if (user.role === 'student') {
        const student = await Student.findOne({ user: user._id })
          .select('enrolledCourses performance')
          .populate('enrolledCourses.course', 'name');
        profileData.studentProfile = student;
      } else if (user.role === 'instructor') {
        const instructor = await Instructor.findOne({ user: user._id })
          .select('designation experience isApproved rating totalStudents');
        profileData.instructorProfile = instructor;
      }
      
      return { ...user, ...profileData };
    }));

    res.json({
      success: true,
      data: {
        users: enrichedUsers,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users'
    });
  }
};

// Get single user details
const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).select('-password -refreshToken');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let profileData = { user };
    
    if (user.role === 'student') {
      const student = await Student.findOne({ user: id })
        .populate('enrolledCourses.course', 'name fees')
        .populate('batches', 'name course');
      profileData.studentProfile = student;
    } else if (user.role === 'instructor') {
      const instructor = await Instructor.findOne({ user: id })
        .populate('skills', 'name category');
      profileData.instructorProfile = instructor;
    }

    res.json({
      success: true,
      data: profileData
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user details'
    });
  }
};

// Create new user
const createUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, whatsapp, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      phone,
      whatsapp: whatsapp || phone,
      role
    });

    await user.save();

    // Create role-specific profile
    if (role === 'student') {
      const student = new Student({
        user: user._id,
        enrolledCourses: [],
        batches: []
      });
      await student.save();
    } else if (role === 'instructor') {
      const instructor = new Instructor({
        user: user._id,
        bio: '',
        designation: '',
        experience: 0,
        skills: [],
        certificates: [],
        isApproved: false
      });
      await instructor.save();
    }

    // Return user without sensitive data
    const userResponse = await User.findById(user._id).select('-password -refreshToken');

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: userResponse
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, whatsapp, role, isActive } = req.body;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent self-deactivation for admin
    if (req.user._id.toString() === id && isActive === false) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account'
      });
    }

    // Update basic fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (whatsapp) user.whatsapp = whatsapp;
    if (typeof isActive === 'boolean') user.isActive = isActive;

    // Handle role change
    if (role && role !== user.role) {
      const oldRole = user.role;
      user.role = role;

      // Remove old role-specific profile
      if (oldRole === 'student') {
        await Student.deleteOne({ user: id });
      } else if (oldRole === 'instructor') {
        await Instructor.deleteOne({ user: id });
      }

      // Create new role-specific profile
      if (role === 'student') {
        const student = new Student({
          user: id,
          enrolledCourses: [],
          batches: []
        });
        await student.save();
      } else if (role === 'instructor') {
        const instructor = new Instructor({
          user: id,
          bio: '',
          designation: '',
          experience: 0,
          skills: [],
          certificates: [],
          isApproved: false
        });
        await instructor.save();
      }
    }

    await user.save();

    // Return updated user without sensitive data
    const updatedUser = await User.findById(id).select('-password -refreshToken');

    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
};

// Delete user (soft delete - deactivate)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (req.user._id.toString() === id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Soft delete - just deactivate
    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
};

// Toggle user status
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (req.user._id.toString() === id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own account status'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        id: user._id,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status'
    });
  }
};

// Bulk operations
const bulkUpdateUsers = async (req, res) => {
  try {
    const { userIds, action, data } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User IDs are required'
      });
    }

    // Prevent self-modification in bulk operations
    if (userIds.includes(req.user._id.toString())) {
      return res.status(400).json({
        success: false,
        message: 'You cannot modify your own account in bulk operations'
      });
    }

    let updateQuery = {};
    let message = '';

    switch (action) {
      case 'activate':
        updateQuery = { isActive: true };
        message = 'Users activated successfully';
        break;
      case 'deactivate':
        updateQuery = { isActive: false };
        message = 'Users deactivated successfully';
        break;
      case 'delete':
        updateQuery = { isActive: false };
        message = 'Users deleted successfully';
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
    }

    const result = await User.updateMany(
      { _id: { $in: userIds } },
      updateQuery
    );

    res.json({
      success: true,
      message,
      data: {
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    console.error('Bulk update users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update users'
    });
  }
};

// Get user statistics
const getUserStats = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalStudents,
      totalInstructors,
      totalAdmins,
      recentUsers
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'instructor' }),
      User.countDocuments({ role: 'admin' }),
      User.find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .select('firstName lastName email role createdAt isActive')
    ]);

    // Get monthly growth
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: lastMonth }
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        totalStudents,
        totalInstructors,
        totalAdmins,
        newUsersThisMonth,
        recentUsers
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user statistics'
    });
  }
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  bulkUpdateUsers,
  getUserStats
};