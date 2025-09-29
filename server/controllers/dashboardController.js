// server/controllers/dashboardController.js
const User = require('../models/User');
const Student = require('../models/Student');
const Instructor = require('../models/Instructor');
const Course = require('../models/Course');
const Batch = require('../models/Batch');
const ContactMessage = require('../models/ContactMessage');

// Admin Dashboard Data
const getAdminDashboard = async (req, res) => {
  try {
    // Get various counts and statistics
    const [
      totalStudents,
      totalInstructors,
      totalCourses,
      activeBatches,
      pendingMessages,
      totalUsers
    ] = await Promise.all([
      User.countDocuments({ role: 'student', isActive: true }),
      User.countDocuments({ role: 'instructor', isActive: true }),
      Course.countDocuments({ isActive: true }),
      Batch.countDocuments({ isActive: true }),
      ContactMessage.countDocuments({ status: 'new' }),
      User.countDocuments({ isActive: true })
    ]);

    // Get total enrollments
    const students = await Student.find({}).populate('enrolledCourses.course');
    const totalEnrollments = students.reduce((acc, student) => acc + student.enrolledCourses.length, 0);

    // Calculate total revenue (approximate)
    let totalRevenue = 0;
    for (let student of students) {
      for (let enrollment of student.enrolledCourses) {
        if (enrollment.course && enrollment.course.fees) {
          totalRevenue += enrollment.course.fees;
        }
      }
    }

    // Get recent activities
    const recentStudents = await User.find({ role: 'student' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('firstName lastName createdAt');

    const recentMessages = await ContactMessage.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name subject createdAt status');

    // Get course statistics
    const courseStats = await Course.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalCourses: { $sum: 1 },
          avgRating: { $avg: '$rating' },
          totalEnrollments: { $sum: '$enrollmentCount' }
        }
      }
    ]);

    const dashboardData = {
      stats: {
        totalStudents,
        totalInstructors,
        totalCourses,
        activeBatches,
        totalEnrollments,
        pendingMessages,
        totalUsers,
        totalRevenue,
        avgCourseRating: courseStats.length > 0 ? courseStats[0].avgRating.toFixed(1) : 0
      },
      recentActivities: [
        ...recentStudents.map(student => ({
          id: student._id,
          user: `${student.firstName} ${student.lastName}`,
          action: 'registered as new student',
          time: student.createdAt,
          type: 'registration'
        })),
        ...recentMessages.map(message => ({
          id: message._id,
          user: message.name,
          action: `sent message: ${message.subject}`,
          time: message.createdAt,
          type: 'message'
        }))
      ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 10),
      monthlyGrowth: {
        students: 12, // This would need more complex date-based queries
        instructors: 5,
        courses: 2,
        revenue: 18
      }
    };

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get admin dashboard data'
    });
  }
};

// Student Dashboard Data
const getStudentDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get student profile with enrolled courses
    const student = await Student.findOne({ user: userId })
      .populate({
        path: 'enrolledCourses.course',
        select: 'name description fees instructor subjects'
      })
      .populate('batches');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    // Get upcoming classes from student's batches
    const upcomingClasses = [];
    for (let batch of student.batches) {
      const populatedBatch = await Batch.findById(batch)
        .populate('course', 'name')
        .populate('instructor', 'user designation')
        .populate('instructor.user', 'firstName lastName');

      if (populatedBatch && populatedBatch.isActive) {
        // Get next scheduled classes based on batch schedule
        populatedBatch.schedule.forEach(scheduleItem => {
          const nextClassDate = getNextClassDate(scheduleItem.dayOfWeek);
          upcomingClasses.push({
            id: `${populatedBatch._id}-${scheduleItem.dayOfWeek}`,
            course: populatedBatch.course.name,
            topic: `Scheduled Class`, // This could be more specific with subject data
            date: nextClassDate.toISOString().split('T')[0],
            time: scheduleItem.startTime,
            duration: calculateDuration(scheduleItem.startTime, scheduleItem.endTime),
            instructor: populatedBatch.instructor.user ? 
              `${populatedBatch.instructor.user.firstName} ${populatedBatch.instructor.user.lastName}` : 
              'Instructor',
            meetingLink: '#'
          });
        });
      }
    }

    // Sort upcoming classes by date
    upcomingClasses.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate progress statistics
    const totalCourses = student.enrolledCourses.length;
    const completedCourses = student.enrolledCourses.filter(
      enrollment => enrollment.status === 'completed'
    ).length;
    const inProgressCourses = student.enrolledCourses.filter(
      enrollment => enrollment.status === 'active'
    ).length;
    
    const overallProgress = totalCourses > 0 ? 
      student.enrolledCourses.reduce((acc, enrollment) => acc + (enrollment.progress || 0), 0) / totalCourses : 0;

    // Mock assignments data (would need separate Assignment model)
    const assignments = [
      {
        id: 1,
        title: 'Complete Project Setup',
        course: student.enrolledCourses[0]?.course?.name || 'Course',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'pending',
        submitted: false
      }
    ];

    const dashboardData = {
      enrolledCourses: student.enrolledCourses.map(enrollment => ({
        id: enrollment.course._id,
        name: enrollment.course.name,
        progress: enrollment.progress || 0,
        instructor: 'Expert Instructor', // Would need to populate instructor details
        nextClass: upcomingClasses.find(cls => cls.course === enrollment.course.name)?.date || null,
        status: enrollment.status
      })),
      upcomingClasses: upcomingClasses.slice(0, 5),
      assignments,
      progress: {
        overallProgress: Math.round(overallProgress),
        completedCourses,
        inProgressCourses,
        certificatesEarned: completedCourses // Assuming 1 certificate per completed course
      },
      stats: {
        totalCourses,
        completedCourses,
        inProgressCourses,
        attendanceRate: student.performance?.attendancePercentage || 0
      }
    };

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Student dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get student dashboard data'
    });
  }
};

// Instructor Dashboard Data
const getInstructorDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get instructor profile
    const instructor = await Instructor.findOne({ user: userId })
      .populate('user', 'firstName lastName email')
      .populate('skills', 'name');

    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Instructor profile not found'
      });
    }

    // Get courses taught by this instructor
    const courses = await Course.find({ instructor: instructor._id, isActive: true })
      .select('name enrollmentCount rating reviews');

    // Get batches taught by this instructor
    const batches = await Batch.find({ instructor: instructor._id, isActive: true })
      .populate('course', 'name')
      .select('name course enrolledStudents schedule');

    // Calculate upcoming classes
    const upcomingClasses = [];
    batches.forEach(batch => {
      batch.schedule.forEach(scheduleItem => {
        const nextClassDate = getNextClassDate(scheduleItem.dayOfWeek);
        upcomingClasses.push({
          id: `${batch._id}-${scheduleItem.dayOfWeek}`,
          course: batch.course.name,
          batch: batch.name,
          date: nextClassDate.toISOString().split('T')[0],
          time: scheduleItem.startTime,
          duration: calculateDuration(scheduleItem.startTime, scheduleItem.endTime),
          studentsCount: batch.enrolledStudents.length
        });
      });
    });

    upcomingClasses.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate statistics
    const totalStudents = batches.reduce((acc, batch) => acc + batch.enrolledStudents.length, 0);
    const totalCourses = courses.length;
    const totalBatches = batches.length;
    const avgRating = courses.reduce((acc, course) => acc + (course.rating || 0), 0) / (totalCourses || 1);

    const dashboardData = {
      instructor: {
        name: `${instructor.user.firstName} ${instructor.user.lastName}`,
        designation: instructor.designation,
        experience: instructor.experience,
        rating: instructor.rating || 0,
        totalStudents: instructor.totalStudents || totalStudents
      },
      stats: {
        totalCourses,
        totalBatches,
        totalStudents,
        avgRating: Math.round(avgRating * 10) / 10
      },
      courses: courses.map(course => ({
        id: course._id,
        name: course.name,
        enrollments: course.enrollmentCount || 0,
        rating: course.rating || 0,
        reviewsCount: course.reviews?.length || 0
      })),
      upcomingClasses: upcomingClasses.slice(0, 5),
      batches: batches.map(batch => ({
        id: batch._id,
        name: batch.name,
        course: batch.course.name,
        studentsCount: batch.enrolledStudents.length,
        scheduleCount: batch.schedule.length
      }))
    };

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Instructor dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get instructor dashboard data'
    });
  }
};

// Helper functions
const getNextClassDate = (dayOfWeek) => {
  const today = new Date();
  const todayDayOfWeek = today.getDay();
  const daysUntilClass = (dayOfWeek - todayDayOfWeek + 7) % 7;
  const classDate = new Date(today);
  classDate.setDate(today.getDate() + (daysUntilClass === 0 ? 7 : daysUntilClass));
  return classDate;
};

const calculateDuration = (startTime, endTime) => {
  const start = new Date(`2000-01-01 ${startTime}`);
  const end = new Date(`2000-01-01 ${endTime}`);
  const diffMs = end - start;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (diffHours === 0) return `${diffMinutes} minutes`;
  if (diffMinutes === 0) return `${diffHours} hours`;
  return `${diffHours}h ${diffMinutes}m`;
};

module.exports = {
  getAdminDashboard,
  getStudentDashboard,
  getInstructorDashboard
};