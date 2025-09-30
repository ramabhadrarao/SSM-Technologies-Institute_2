// server/controllers/adminController.js
const User = require('../models/User');
const Student = require('../models/Student');
const Instructor = require('../models/Instructor');
const Course = require('../models/Course');
const emailService = require('../utils/emailService');

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
          bio: 'Instructor profile to be updated',
          designation: 'Instructor',
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

// Approve or reject instructor
const approveInstructor = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    // Find the user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role !== 'instructor') {
      return res.status(400).json({
        success: false,
        message: 'User is not an instructor'
      });
    }

    // Find and update instructor profile
    const instructor = await Instructor.findOne({ user: id });
    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Instructor profile not found'
      });
    }

    // Update approval status
    instructor.isApproved = isApproved;
    await instructor.save();

    // Send email notification
    try {
      await emailService.sendInstructorApprovalEmail(
        user.email,
        `${user.firstName} ${user.lastName}`,
        isApproved
      );
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError);
      // Don't fail the request if email fails
    }

    res.json({
      success: true,
      message: `Instructor ${isApproved ? 'approved' : 'rejected'} successfully`,
      data: {
        userId: user._id,
        isApproved: instructor.isApproved
      }
    });
  } catch (error) {
    console.error('Approve instructor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update instructor approval status'
    });
  }
};

// ========== ENROLLMENT MANAGEMENT FUNCTIONS ==========

// Get all enrollments across all courses
const getAllEnrollments = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      status, 
      courseId,
      sortBy = 'enrolledAt', 
      sortOrder = 'desc' 
    } = req.query;

    // Build aggregation pipeline
    const pipeline = [
      { $unwind: '$enrolledCourses' },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      {
        $lookup: {
          from: 'courses',
          localField: 'enrolledCourses.course',
          foreignField: '_id',
          as: 'courseInfo'
        }
      },
      { $unwind: '$userInfo' },
      { $unwind: '$courseInfo' }
    ];

    // Add filters
    const matchConditions = {};
    
    if (search) {
      matchConditions.$or = [
        { 'userInfo.firstName': { $regex: search, $options: 'i' } },
        { 'userInfo.lastName': { $regex: search, $options: 'i' } },
        { 'userInfo.email': { $regex: search, $options: 'i' } },
        { 'courseInfo.name': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status && status !== 'all') {
      matchConditions['enrolledCourses.status'] = status;
    }
    
    if (courseId) {
      matchConditions['enrolledCourses.course'] = courseId;
    }

    if (Object.keys(matchConditions).length > 0) {
      pipeline.push({ $match: matchConditions });
    }

    // Add projection
    pipeline.push({
      $project: {
        _id: '$enrolledCourses._id',
        student: {
          _id: '$_id',
          user: {
            _id: '$userInfo._id',
            firstName: '$userInfo.firstName',
            lastName: '$userInfo.lastName',
            email: '$userInfo.email',
            phone: '$userInfo.phone'
          }
        },
        course: {
          _id: '$courseInfo._id',
          name: '$courseInfo.name',
          description: '$courseInfo.description',
          fees: '$courseInfo.fees'
        },
        enrolledAt: '$enrolledCourses.enrolledAt',
        status: '$enrolledCourses.status',
        progress: '$enrolledCourses.progress',
        completedSubjects: '$enrolledCourses.completedSubjects'
      }
    });

    // Add sorting
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    pipeline.push({ $sort: sort });

    // Execute aggregation with pagination
    const enrollments = await Student.aggregate([
      ...pipeline,
      { $skip: (page - 1) * limit },
      { $limit: parseInt(limit) }
    ]);

    // Get total count
    const totalPipeline = [
      ...pipeline.slice(0, -1), // Remove sort and pagination
      { $count: 'total' }
    ];
    const totalResult = await Student.aggregate(totalPipeline);
    const total = totalResult[0]?.total || 0;

    res.json({
      success: true,
      data: {
        enrollments,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all enrollments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get enrollments'
    });
  }
};

// Get enrollments for a specific course
const getCourseEnrollments = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { page = 1, limit = 10, status, search } = req.query;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Build query
    const query = { 'enrolledCourses.course': courseId };
    
    if (status && status !== 'all') {
      query['enrolledCourses.status'] = status;
    }

    // Build aggregation pipeline
    const pipeline = [
      { $match: query },
      { $unwind: '$enrolledCourses' },
      { $match: { 'enrolledCourses.course': courseId } },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' }
    ];

    // Add search filter
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'userInfo.firstName': { $regex: search, $options: 'i' } },
            { 'userInfo.lastName': { $regex: search, $options: 'i' } },
            { 'userInfo.email': { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    // Add status filter after unwind
    if (status && status !== 'all') {
      pipeline.push({ $match: { 'enrolledCourses.status': status } });
    }

    // Add projection
    pipeline.push({
      $project: {
        _id: '$enrolledCourses._id',
        student: {
          _id: '$_id',
          user: {
            _id: '$userInfo._id',
            firstName: '$userInfo.firstName',
            lastName: '$userInfo.lastName',
            email: '$userInfo.email',
            phone: '$userInfo.phone'
          }
        },
        enrolledAt: '$enrolledCourses.enrolledAt',
        status: '$enrolledCourses.status',
        progress: '$enrolledCourses.progress',
        completedSubjects: '$enrolledCourses.completedSubjects'
      }
    });

    // Execute with pagination
    const enrollments = await Student.aggregate([
      ...pipeline,
      { $sort: { enrolledAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: parseInt(limit) }
    ]);

    // Get total count
    const totalResult = await Student.aggregate([
      ...pipeline,
      { $count: 'total' }
    ]);
    const total = totalResult[0]?.total || 0;

    res.json({
      success: true,
      data: {
        course: {
          _id: course._id,
          name: course.name,
          description: course.description
        },
        enrollments,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get course enrollments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get course enrollments'
    });
  }
};

// Update enrollment status
const updateEnrollmentStatus = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { status, reason } = req.body;

    // Validate status
    const validStatuses = ['active', 'completed', 'suspended', 'dropped'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: active, completed, suspended, dropped'
      });
    }

    // Find the student with this enrollment
    const student = await Student.findOne({
      'enrolledCourses._id': enrollmentId
    }).populate('user', 'firstName lastName email');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Find the specific enrollment
    const enrollment = student.enrolledCourses.id(enrollmentId);
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    const oldStatus = enrollment.status;

    // Business logic validation
    if (oldStatus === 'completed' && status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot change status of completed enrollment'
      });
    }

    if (oldStatus === 'dropped' && status === 'active') {
      return res.status(400).json({
        success: false,
        message: 'Cannot reactivate dropped enrollment. Student must re-enroll.'
      });
    }

    // Update the enrollment status
    enrollment.status = status;
    
    // Set completion date if status is completed
    if (status === 'completed' && oldStatus !== 'completed') {
      enrollment.completedAt = new Date();
      enrollment.progress = 100;
    }

    // Add status change log
    if (!enrollment.statusHistory) {
      enrollment.statusHistory = [];
    }
    
    enrollment.statusHistory.push({
      status: status,
      changedAt: new Date(),
      changedBy: req.user._id,
      reason: reason || 'Status changed by admin'
    });

    await student.save();

    // Get course info for notification
    const course = await Course.findById(enrollment.course);

    // Send notification email to student
    try {
      const statusMessages = {
        active: 'Your enrollment has been activated',
        completed: 'Congratulations! You have completed the course',
        suspended: 'Your enrollment has been temporarily suspended',
        dropped: 'Your enrollment has been withdrawn'
      };

      await emailService.sendEmail({
        to: student.user.email,
        subject: `Enrollment Status Update - ${course?.name || 'Course'}`,
        html: `
          <h2>Enrollment Status Update</h2>
          <p>Dear ${student.user.firstName} ${student.user.lastName},</p>
          <p>${statusMessages[status]} for the course: <strong>${course?.name || 'Course'}</strong></p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
          <p>If you have any questions, please contact our support team.</p>
          <p>Best regards,<br>SSM Technologies Institute</p>
        `
      });
    } catch (emailError) {
      console.error('Failed to send enrollment status email:', emailError);
      // Don't fail the request if email fails
    }

    res.json({
      success: true,
      message: 'Enrollment status updated successfully',
      data: {
        enrollmentId,
        oldStatus,
        newStatus: status,
        student: {
          name: `${student.user.firstName} ${student.user.lastName}`,
          email: student.user.email
        },
        course: course ? { name: course.name } : null
      }
    });
  } catch (error) {
    console.error('Update enrollment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update enrollment status'
    });
  }
};

// Get enrollments for a specific student
const getStudentEnrollments = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId)
      .populate('user', 'firstName lastName email phone')
      .populate('enrolledCourses.course', 'name description fees duration')
      .lean();

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Format the response
    const enrollments = student.enrolledCourses.map(enrollment => ({
      _id: enrollment._id,
      course: enrollment.course,
      enrolledAt: enrollment.enrolledAt,
      status: enrollment.status,
      progress: enrollment.progress,
      completedSubjects: enrollment.completedSubjects,
      completedAt: enrollment.completedAt,
      statusHistory: enrollment.statusHistory || []
    }));

    res.json({
      success: true,
      data: {
        student: {
          _id: student._id,
          user: student.user
        },
        enrollments
      }
    });
  } catch (error) {
    console.error('Get student enrollments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get student enrollments'
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
  getUserStats,
  approveInstructor,
  // Enrollment management functions
  getAllEnrollments,
  getCourseEnrollments,
  updateEnrollmentStatus,
  getStudentEnrollments
};