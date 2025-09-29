// server/controllers/analyticsController.js
const User = require('../models/User');
const Student = require('../models/Student');
const Instructor = require('../models/Instructor');
const Course = require('../models/Course');
const Batch = require('../models/Batch');
const ContactMessage = require('../models/ContactMessage');

// Get comprehensive dashboard analytics
const getDashboardAnalytics = async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      period = 'monthly' // daily, weekly, monthly, yearly
    } = req.query;

    // Build date range
    let dateRange = {};
    if (startDate || endDate) {
      dateRange.createdAt = {};
      if (startDate) dateRange.createdAt.$gte = new Date(startDate);
      if (endDate) dateRange.createdAt.$lte = new Date(endDate);
    }

    // Get overview statistics
    const [
      totalUsers,
      totalStudents,
      totalInstructors,
      totalCourses,
      totalBatches,
      totalRevenue,
      userGrowth,
      enrollmentGrowth,
      revenueGrowth
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'student', isActive: true }),
      User.countDocuments({ role: 'instructor', isActive: true }),
      Course.countDocuments({ isActive: true }),
      Batch.countDocuments({ isActive: true }),
      calculateTotalRevenue(),
      getUserGrowthData(period, dateRange),
      getEnrollmentGrowthData(period, dateRange),
      getRevenueGrowthData(period, dateRange)
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalStudents,
          totalInstructors,
          totalCourses,
          totalBatches,
          totalRevenue
        },
        growth: {
          users: userGrowth,
          enrollments: enrollmentGrowth,
          revenue: revenueGrowth
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard analytics'
    });
  }
};

// Get user analytics
const getUserAnalytics = async (req, res) => {
  try {
    const { period = 'monthly', startDate, endDate } = req.query;

    // User registration trends
    const userTrends = await User.aggregate([
      {
        $match: {
          ...(startDate && endDate ? {
            createdAt: {
              $gte: new Date(startDate),
              $lte: new Date(endDate)
            }
          } : {})
        }
      },
      {
        $group: {
          _id: {
            period: getDateGrouping(period),
            role: '$role'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.period',
          roles: {
            $push: {
              role: '$_id.role',
              count: '$count'
            }
          },
          total: { $sum: '$count' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // User activity statistics
    const userActivity = await User.aggregate([
      {
        $group: {
          _id: '$isActive',
          count: { $sum: 1 }
        }
      }
    ]);

    // Recent user activities
    const recentLogins = await User.find({
      lastLogin: { $exists: true, $ne: null }
    })
    .sort({ lastLogin: -1 })
    .limit(100)
    .select('firstName lastName email role lastLogin')
    .lean();

    res.json({
      success: true,
      data: {
        userTrends,
        userActivity,
        recentLogins
      }
    });
  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user analytics'
    });
  }
};

// Get course analytics
const getCourseAnalytics = async (req, res) => {
  try {
    const { period = 'monthly', startDate, endDate } = req.query;

    // Course enrollment trends
    const enrollmentTrends = await Student.aggregate([
      { $unwind: '$enrolledCourses' },
      {
        $match: {
          ...(startDate && endDate ? {
            'enrolledCourses.enrolledAt': {
              $gte: new Date(startDate),
              $lte: new Date(endDate)
            }
          } : {})
        }
      },
      {
        $lookup: {
          from: 'courses',
          localField: 'enrolledCourses.course',
          foreignField: '_id',
          as: 'course'
        }
      },
      { $unwind: '$course' },
      {
        $group: {
          _id: {
            period: getDateGrouping(period, '$enrolledCourses.enrolledAt'),
            course: '$course.name'
          },
          enrollments: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.period',
          courses: {
            $push: {
              course: '$_id.course',
              enrollments: '$enrollments'
            }
          },
          totalEnrollments: { $sum: '$enrollments' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Course performance metrics
    const coursePerformance = await Course.aggregate([
      {
        $lookup: {
          from: 'students',
          localField: '_id',
          foreignField: 'enrolledCourses.course',
          as: 'enrollments'
        }
      },
      {
        $project: {
          name: 1,
          fees: 1,
          rating: 1,
          enrollmentCount: { $size: '$enrollments' },
          revenue: { $multiply: ['$fees', { $size: '$enrollments' }] },
          reviewCount: { $size: '$reviews' }
        }
      },
      { $sort: { enrollmentCount: -1 } }
    ]);

    // Completion rates by course
    const completionRates = await Student.aggregate([
      { $unwind: '$enrolledCourses' },
      {
        $lookup: {
          from: 'courses',
          localField: 'enrolledCourses.course',
          foreignField: '_id',
          as: 'course'
        }
      },
      { $unwind: '$course' },
      {
        $group: {
          _id: {
            course: '$course.name',
            status: '$enrolledCourses.status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.course',
          statuses: {
            $push: {
              status: '$_id.status',
              count: '$count'
            }
          },
          total: { $sum: '$count' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        enrollmentTrends,
        coursePerformance,
        completionRates
      }
    });
  } catch (error) {
    console.error('Get course analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get course analytics'
    });
  }
};

// Get financial analytics
const getFinancialAnalytics = async (req, res) => {
  try {
    const { period = 'monthly', startDate, endDate } = req.query;

    // Revenue trends
    const revenueTrends = await Student.aggregate([
      { $unwind: '$enrolledCourses' },
      {
        $match: {
          ...(startDate && endDate ? {
            'enrolledCourses.enrolledAt': {
              $gte: new Date(startDate),
              $lte: new Date(endDate)
            }
          } : {})
        }
      },
      {
        $lookup: {
          from: 'courses',
          localField: 'enrolledCourses.course',
          foreignField: '_id',
          as: 'course'
        }
      },
      { $unwind: '$course' },
      {
        $group: {
          _id: getDateGrouping(period, '$enrolledCourses.enrolledAt'),
          revenue: { $sum: '$course.fees' },
          enrollments: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Revenue by course
    const revenueByCourse = await Student.aggregate([
      { $unwind: '$enrolledCourses' },
      {
        $lookup: {
          from: 'courses',
          localField: 'enrolledCourses.course',
          foreignField: '_id',
          as: 'course'
        }
      },
      { $unwind: '$course' },
      {
        $group: {
          _id: '$course.name',
          revenue: { $sum: '$course.fees' },
        // Continue from Financial Analytics
          enrollments: { $sum: 1 },
          avgFee: { $avg: '$course.fees' }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    // Payment trends and projections
    const paymentTrends = await Student.aggregate([
      { $unwind: '$enrolledCourses' },
      {
        $lookup: {
          from: 'courses',
          localField: 'enrolledCourses.course',
          foreignField: '_id',
          as: 'course'
        }
      },
      { $unwind: '$course' },
      {
        $group: {
          _id: {
            month: { $month: '$enrolledCourses.enrolledAt' },
            year: { $year: '$enrolledCourses.enrolledAt' }
          },
          revenue: { $sum: '$course.fees' },
          studentCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        revenueTrends,
        revenueByCourse,
        paymentTrends
      }
    });
  } catch (error) {
    console.error('Get financial analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get financial analytics'
    });
  }
};

// Get instructor analytics
const getInstructorAnalytics = async (req, res) => {
  try {
    // Instructor performance metrics
    const instructorPerformance = await Instructor.aggregate([
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: 'instructor',
          as: 'courses'
        }
      },
      {
        $lookup: {
          from: 'batches',
          localField: '_id',
          foreignField: 'instructor',
          as: 'batches'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          name: { $concat: ['$user.firstName', ' ', '$user.lastName'] },
          email: '$user.email',
          designation: 1,
          experience: 1,
          rating: 1,
          totalStudents: 1,
          courseCount: { $size: '$courses' },
          batchCount: { $size: '$batches' },
          avgCourseRating: { $avg: '$courses.rating' },
          totalRevenue: {
            $sum: {
              $map: {
                input: '$courses',
                as: 'course',
                in: { $multiply: ['$$course.fees', '$$course.enrollmentCount'] }
              }
            }
          }
        }
      },
      { $sort: { rating: -1, totalStudents: -1 } }
    ]);

    // Instructor workload analysis
    const workloadAnalysis = await Batch.aggregate([
      {
        $lookup: {
          from: 'instructors',
          localField: 'instructor',
          foreignField: '_id',
          as: 'instructor'
        }
      },
      { $unwind: '$instructor' },
      {
        $lookup: {
          from: 'users',
          localField: 'instructor.user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $group: {
          _id: {
            instructor: '$instructor._id',
            name: { $concat: ['$user.firstName', ' ', '$user.lastName'] }
          },
          activeBatches: { $sum: { $cond: ['$isActive', 1, 0] } },
          totalStudents: { $sum: { $size: '$enrolledStudents' } },
          weeklyHours: {
            $sum: {
              $size: '$schedule'
            }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        instructorPerformance,
        workloadAnalysis
      }
    });
  } catch (error) {
    console.error('Get instructor analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get instructor analytics'
    });
  }
};

// Get student analytics
const getStudentAnalytics = async (req, res) => {
  try {
    // Student progress analytics
    const progressAnalytics = await Student.aggregate([
      { $unwind: '$enrolledCourses' },
      {
        $group: {
          _id: '$enrolledCourses.status',
          count: { $sum: 1 },
          avgProgress: { $avg: '$enrolledCourses.progress' }
        }
      }
    ]);

    // Student performance by course
    const performanceByCourse = await Student.aggregate([
      { $unwind: '$enrolledCourses' },
      {
        $lookup: {
          from: 'courses',
          localField: 'enrolledCourses.course',
          foreignField: '_id',
          as: 'course'
        }
      },
      { $unwind: '$course' },
      {
        $group: {
          _id: '$course.name',
          totalStudents: { $sum: 1 },
          avgProgress: { $avg: '$enrolledCourses.progress' },
          completedStudents: {
            $sum: { $cond: [{ $eq: ['$enrolledCourses.status', 'completed'] }, 1, 0] }
          },
          droppedStudents: {
            $sum: { $cond: [{ $eq: ['$enrolledCourses.status', 'dropped'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          totalStudents: 1,
          avgProgress: 1,
          completedStudents: 1,
          droppedStudents: 1,
          completionRate: {
            $multiply: [
              { $divide: ['$completedStudents', '$totalStudents'] },
              100
            ]
          },
          dropoutRate: {
            $multiply: [
              { $divide: ['$droppedStudents', '$totalStudents'] },
              100
            ]
          }
        }
      }
    ]);

    // Attendance patterns
    const attendancePatterns = await Student.aggregate([
      { $unwind: '$attendance' },
      {
        $group: {
          _id: '$attendance.status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        progressAnalytics,
        performanceByCourse,
        attendancePatterns
      }
    });
  } catch (error) {
    console.error('Get student analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get student analytics'
    });
  }
};

// Generate custom reports
const generateCustomReport = async (req, res) => {
  try {
    const {
      reportType,
      startDate,
      endDate,
      filters = {},
      groupBy = 'month',
      metrics = []
    } = req.body;

    let reportData = {};

    switch (reportType) {
      case 'enrollment':
        reportData = await generateEnrollmentReport(startDate, endDate, filters, groupBy);
        break;
      case 'revenue':
        reportData = await generateRevenueReport(startDate, endDate, filters, groupBy);
        break;
      case 'performance':
        reportData = await generatePerformanceReport(startDate, endDate, filters, groupBy);
        break;
      case 'attendance':
        reportData = await generateAttendanceReport(startDate, endDate, filters, groupBy);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type'
        });
    }

    res.json({
      success: true,
      data: {
        reportType,
        period: { startDate, endDate },
        filters,
        data: reportData
      }
    });
  } catch (error) {
    console.error('Generate custom report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate report'
    });
  }
};

// Helper functions
const calculateTotalRevenue = async () => {
  const result = await Student.aggregate([
    { $unwind: '$enrolledCourses' },
    {
      $lookup: {
        from: 'courses',
        localField: 'enrolledCourses.course',
        foreignField: '_id',
        as: 'course'
      }
    },
    { $unwind: '$course' },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$course.fees' }
      }
    }
  ]);
  return result[0]?.totalRevenue || 0;
};

const getUserGrowthData = async (period, dateRange) => {
  return await User.aggregate([
    { $match: dateRange },
    {
      $group: {
        _id: getDateGrouping(period),
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

const getEnrollmentGrowthData = async (period, dateRange) => {
  return await Student.aggregate([
    { $unwind: '$enrolledCourses' },
    {
      $match: {
        'enrolledCourses.enrolledAt': dateRange.createdAt || {}
      }
    },
    {
      $group: {
        _id: getDateGrouping(period, '$enrolledCourses.enrolledAt'),
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

const getRevenueGrowthData = async (period, dateRange) => {
  return await Student.aggregate([
    { $unwind: '$enrolledCourses' },
    {
      $match: {
        'enrolledCourses.enrolledAt': dateRange.createdAt || {}
      }
    },
    {
      $lookup: {
        from: 'courses',
        localField: 'enrolledCourses.course',
        foreignField: '_id',
        as: 'course'
      }
    },
    { $unwind: '$course' },
    {
      $group: {
        _id: getDateGrouping(period, '$enrolledCourses.enrolledAt'),
        revenue: { $sum: '$course.fees' }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

const getDateGrouping = (period, dateField = '$createdAt') => {
  switch (period) {
    case 'daily':
      return {
        year: { $year: dateField },
        month: { $month: dateField },
        day: { $dayOfMonth: dateField }
      };
    case 'weekly':
      return {
        year: { $year: dateField },
        week: { $week: dateField }
      };
    case 'yearly':
      return {
        year: { $year: dateField }
      };
    case 'monthly':
    default:
      return {
        year: { $year: dateField },
        month: { $month: dateField }
      };
  }
};

const generateEnrollmentReport = async (startDate, endDate, filters, groupBy) => {
  // Implementation for enrollment report
  return await Student.aggregate([
    { $unwind: '$enrolledCourses' },
    {
      $match: {
        'enrolledCourses.enrolledAt': {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    },
    {
      $lookup: {
        from: 'courses',
        localField: 'enrolledCourses.course',
        foreignField: '_id',
        as: 'course'
      }
    },
    { $unwind: '$course' },
    {
      $group: {
        _id: getDateGrouping(groupBy, '$enrolledCourses.enrolledAt'),
        enrollments: { $sum: 1 },
        courses: { $addToSet: '$course.name' },
        revenue: { $sum: '$course.fees' }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

const generateRevenueReport = async (startDate, endDate, filters, groupBy) => {
  return await Student.aggregate([
    { $unwind: '$enrolledCourses' },
    {
      $match: {
        'enrolledCourses.enrolledAt': {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    },
    {
      $lookup: {
        from: 'courses',
        localField: 'enrolledCourses.course',
        foreignField: '_id',
        as: 'course'
      }
    },
    { $unwind: '$course' },
    {
      $group: {
        _id: getDateGrouping(groupBy, '$enrolledCourses.enrolledAt'),
        totalRevenue: { $sum: '$course.fees' },
        enrollmentCount: { $sum: 1 },
        avgRevenuePerStudent: { $avg: '$course.fees' }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

const generatePerformanceReport = async (startDate, endDate, filters, groupBy) => {
  return await Student.aggregate([
    { $unwind: '$enrolledCourses' },
    {
      $lookup: {
        from: 'courses',
        localField: 'enrolledCourses.course',
        foreignField: '_id',
        as: 'course'
      }
    },
    { $unwind: '$course' },
    {
      $group: {
        _id: '$course.name',
        totalStudents: { $sum: 1 },
        avgProgress: { $avg: '$enrolledCourses.progress' },
        completedCount: {
          $sum: { $cond: [{ $eq: ['$enrolledCourses.status', 'completed'] }, 1, 0] }
        }
      }
    },
    {
      $project: {
        totalStudents: 1,
        avgProgress: 1,
        completedCount: 1,
        completionRate: {
          $multiply: [
            { $divide: ['$completedCount', '$totalStudents'] },
            100
          ]
        }
      }
    }
  ]);
};

const generateAttendanceReport = async (startDate, endDate, filters, groupBy) => {
  return await Batch.aggregate([
    { $unwind: '$classes' },
    {
      $match: {
        'classes.date': {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    },
    { $unwind: '$classes.attendance' },
    {
      $group: {
        _id: getDateGrouping(groupBy, '$classes.date'),
        totalAttendance: { $sum: 1 },
        presentCount: {
          $sum: { $cond: [{ $eq: ['$classes.attendance.status', 'present'] }, 1, 0] }
        },
        absentCount: {
          $sum: { $cond: [{ $eq: ['$classes.attendance.status', 'absent'] }, 1, 0] }
        }
      }
    },
    {
      $project: {
        totalAttendance: 1,
        presentCount: 1,
        absentCount: 1,
        attendanceRate: {
          $multiply: [
            { $divide: ['$presentCount', '$totalAttendance'] },
            100
          ]
        }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

module.exports = {
  getDashboardAnalytics,
  getUserAnalytics,
  getCourseAnalytics,
  getFinancialAnalytics,
  getInstructorAnalytics,
  getStudentAnalytics,
  generateCustomReport
};