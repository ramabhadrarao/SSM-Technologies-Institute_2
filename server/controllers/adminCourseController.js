// server/controllers/adminCourseController.js
const Course = require('../models/Course');
const Subject = require('../models/Subject');
const Instructor = require('../models/Instructor');
const Student = require('../models/Student');
const { getFileUrl, deleteFile } = require('../middleware/upload');

// Get all courses for admin with detailed info
const getAdminCourses = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      instructor, 
      status, 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;

    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (instructor) {
      query.instructor = instructor;
    }
    
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const courses = await Course.find(query)
      .populate('subjects', 'name description')
      .populate('instructor', 'user designation experience')
      .populate('instructor.user', 'firstName lastName email')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Get total count for pagination
    const total = await Course.countDocuments(query);

    // Add file URLs and additional stats
    const coursesWithDetails = await Promise.all(courses.map(async (course) => {
      // Get enrollment count from students
      const enrollmentCount = await Student.countDocuments({
        'enrolledCourses.course': course._id
      });

      return {
        ...course,
        imageUrl: getFileUrl(course.imageUrl),
        videoUrl: getFileUrl(course.videoUrl),
        enrollmentCount,
        subjects: course.subjects.map(subject => ({
          ...subject,
          imageUrl: getFileUrl(subject.imageUrl)
        }))
      };
    }));

    res.json({
      success: true,
      data: {
        courses: coursesWithDetails,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get admin courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get courses'
    });
  }
};

// Get single course details for admin
const getAdminCourse = async (req, res) => {
  try {
    const { id } = req.params;
    
    const course = await Course.findById(id)
      .populate('subjects', 'name description syllabus')
      .populate('instructor', 'user designation experience bio')
      .populate('instructor.user', 'firstName lastName email')
      .populate('reviews.student', 'user')
      .populate('reviews.student.user', 'firstName lastName')
      .lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Get enrollment statistics
    const enrollmentStats = await Student.aggregate([
      { $match: { 'enrolledCourses.course': course._id } },
      {
        $group: {
          _id: '$enrolledCourses.status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get revenue
    const revenue = course.fees * course.enrollmentCount;

    const courseWithDetails = {
      ...course,
      imageUrl: getFileUrl(course.imageUrl),
      videoUrl: getFileUrl(course.videoUrl),
      enrollmentStats,
      revenue,
      subjects: course.subjects.map(subject => ({
        ...subject,
        imageUrl: getFileUrl(subject.imageUrl)
      }))
    };

    res.json({
      success: true,
      data: courseWithDetails
    });
  } catch (error) {
    console.error('Get admin course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get course details'
    });
  }
};

// Create course (enhanced for admin)
const createAdminCourse = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      fees, 
      duration, 
      structure, 
      subjects, 
      instructor,
      isActive = true 
    } = req.body;
    
    const courseData = {
      name,
      description,
      fees: parseFloat(fees),
      duration,
      structure: structure ? JSON.parse(structure) : [],
      subjects: subjects ? JSON.parse(subjects) : [],
      instructor: instructor || null,
      isActive
    };

    // Add file URLs if uploaded
    if (req.files) {
      if (req.files.image) {
        courseData.imageUrl = req.files.image[0].path;
      }
      if (req.files.video) {
        courseData.videoUrl = req.files.video[0].path;
      }
    }

    const course = new Course(courseData);
    await course.save();

    // Populate the response
    const populatedCourse = await Course.findById(course._id)
      .populate('subjects', 'name description')
      .populate('instructor', 'user designation')
      .populate('instructor.user', 'firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: {
        ...populatedCourse.toObject(),
        imageUrl: getFileUrl(populatedCourse.imageUrl),
        videoUrl: getFileUrl(populatedCourse.videoUrl)
      }
    });
  } catch (error) {
    console.error('Create admin course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create course',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update course (enhanced for admin)
const updateAdminCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      fees, 
      duration, 
      structure, 
      subjects, 
      instructor,
      isActive 
    } = req.body;
    
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Update fields
    if (name) course.name = name;
    if (description) course.description = description;
    if (fees !== undefined) course.fees = parseFloat(fees);
    if (duration) course.duration = duration;
    if (structure) course.structure = JSON.parse(structure);
    if (subjects) course.subjects = JSON.parse(subjects);
    if (instructor) course.instructor = instructor;
    if (typeof isActive === 'boolean') course.isActive = isActive;

    // Handle file uploads
    if (req.files) {
      if (req.files.image) {
        // Delete old image
        if (course.imageUrl) {
          deleteFile(course.imageUrl);
        }
        course.imageUrl = req.files.image[0].path;
      }
      if (req.files.video) {
        // Delete old video
        if (course.videoUrl) {
          deleteFile(course.videoUrl);
        }
        course.videoUrl = req.files.video[0].path;
      }
    }

    await course.save();

    // Populate the response
    const updatedCourse = await Course.findById(id)
      .populate('subjects', 'name description')
      .populate('instructor', 'user designation')
      .populate('instructor.user', 'firstName lastName');

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: {
        ...updatedCourse.toObject(),
        imageUrl: getFileUrl(updatedCourse.imageUrl),
        videoUrl: getFileUrl(updatedCourse.videoUrl)
      }
    });
  } catch (error) {
    console.error('Update admin course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update course'
    });
  }
};

// Delete course (enhanced for admin)
const deleteAdminCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { hard = false } = req.query;
    
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if course has enrollments
    const enrollmentCount = await Student.countDocuments({
      'enrolledCourses.course': id
    });

    if (enrollmentCount > 0 && hard === 'true') {
      return res.status(400).json({
        success: false,
        message: `Cannot delete course with ${enrollmentCount} active enrollments. Please transfer students first.`
      });
    }

    if (hard === 'true') {
      // Hard delete
      if (course.imageUrl) deleteFile(course.imageUrl);
      if (course.videoUrl) deleteFile(course.videoUrl);
      await Course.findByIdAndDelete(id);
    } else {
      // Soft delete
      course.isActive = false;
      await course.save();
    }

    res.json({
      success: true,
      message: `Course ${hard === 'true' ? 'deleted' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Delete admin course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete course'
    });
  }
};

// Bulk operations on courses
const bulkUpdateCourses = async (req, res) => {
  try {
    const { courseIds, action, data } = req.body;
    
    if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Course IDs are required'
      });
    }

    let updateQuery = {};
    let message = '';

    switch (action) {
      case 'activate':
        updateQuery = { isActive: true };
        message = 'Courses activated successfully';
        break;
      case 'deactivate':
        updateQuery = { isActive: false };
        message = 'Courses deactivated successfully';
        break;
      case 'delete':
        updateQuery = { isActive: false };
        message = 'Courses deleted successfully';
        break;
      case 'update-instructor':
        if (!data?.instructor) {
          return res.status(400).json({
            success: false,
            message: 'Instructor ID is required'
          });
        }
        updateQuery = { instructor: data.instructor };
        message = 'Instructor updated for courses';
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
    }

    const result = await Course.updateMany(
      { _id: { $in: courseIds } },
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
    console.error('Bulk update courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update courses'
    });
  }
};

// Get course statistics
const getCourseStats = async (req, res) => {
  try {
    const [
      totalCourses,
      activeCourses,
      totalEnrollments,
      avgRating,
      totalRevenue,
      topCourses
    ] = await Promise.all([
      Course.countDocuments({}),
      Course.countDocuments({ isActive: true }),
      Student.aggregate([
        { $unwind: '$enrolledCourses' },
        { $count: 'total' }
      ]),
      Course.aggregate([
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ]),
      Course.aggregate([
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
            fees: 1,
            enrollmentCount: { $size: '$enrollments' },
            revenue: { $multiply: ['$fees', { $size: '$enrollments' }] }
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$revenue' }
          }
        }
      ]),
      Course.find({ isActive: true })
        .sort({ enrollmentCount: -1, rating: -1 })
        .limit(5)
        .populate('instructor', 'user designation')
        .populate('instructor.user', 'firstName lastName')
        .select('name enrollmentCount rating fees')
    ]);

    res.json({
      success: true,
      data: {
        totalCourses,
        activeCourses,
        inactiveCourses: totalCourses - activeCourses,
        totalEnrollments: totalEnrollments[0]?.total || 0,
        avgRating: avgRating[0]?.avgRating || 0,
        totalRevenue: totalRevenue[0]?.totalRevenue || 0,
        topCourses
      }
    });
  } catch (error) {
    console.error('Get course stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get course statistics'
    });
  }
};

// Get available instructors for course assignment
const getAvailableInstructors = async (req, res) => {
  try {
    const instructors = await Instructor.find({ 
      isActive: true, 
      isApproved: true 
    })
    .populate('user', 'firstName lastName email')
    .select('user designation experience skills totalStudents rating')
    .sort({ rating: -1, experience: -1 });

    res.json({
      success: true,
      data: instructors
    });
  } catch (error) {
    console.error('Get available instructors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get instructors'
    });
  }
};

module.exports = {
  getAdminCourses,
  getAdminCourse,
  createAdminCourse,
  updateAdminCourse,
  deleteAdminCourse,
  bulkUpdateCourses,
  getCourseStats,
  getAvailableInstructors
};