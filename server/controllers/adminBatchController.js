// server/controllers/adminBatchController.js
const Batch = require('../models/Batch');
const Course = require('../models/Course');
const Instructor = require('../models/Instructor');
const Student = require('../models/Student');

// Get all batches for admin
const getAdminBatches = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      course, 
      instructor, 
      status, 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;

    // Build query
    const query = {};
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    if (course) {
      query.course = course;
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
    const batches = await Batch.find(query)
      .populate('course', 'name fees duration')
      .populate('instructor', 'user designation experience')
      .populate('instructor.user', 'firstName lastName email')
      .populate('enrolledStudents.student', 'user')
      .populate('enrolledStudents.student.user', 'firstName lastName')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Get total count for pagination
    const total = await Batch.countDocuments(query);

    // Add calculated fields
    const batchesWithDetails = batches.map(batch => ({
      ...batch,
      currentEnrollment: batch.enrolledStudents.filter(e => e.status === 'active').length,
      completionRate: batch.enrolledStudents.filter(e => e.status === 'completed').length / batch.enrolledStudents.length * 100 || 0,
      upcomingClasses: batch.classes ? batch.classes.filter(c => 
        new Date(c.date) > new Date() && c.status === 'scheduled'
      ).length : 0
    }));

    res.json({
      success: true,
      data: {
        batches: batchesWithDetails,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get admin batches error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get batches'
    });
  }
};

// Get single batch details for admin
const getAdminBatch = async (req, res) => {
  try {
    const { id } = req.params;
    
    const batch = await Batch.findById(id)
      .populate('course', 'name description fees duration structure')
      .populate('instructor', 'user designation experience bio')
      .populate('instructor.user', 'firstName lastName email phone')
      .populate('enrolledStudents.student', 'user performance')
      .populate('enrolledStudents.student.user', 'firstName lastName email phone')
      .populate('classes.subject', 'name description')
      .lean();

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    // Calculate statistics
    const activeStudents = batch.enrolledStudents.filter(e => e.status === 'active');
    const completedStudents = batch.enrolledStudents.filter(e => e.status === 'completed');
    const totalClasses = batch.classes ? batch.classes.length : 0;
    const completedClasses = batch.classes ? batch.classes.filter(c => c.status === 'completed').length : 0;
    
    // Calculate attendance statistics
    const attendanceStats = batch.classes ? batch.classes.reduce((acc, classItem) => {
      if (classItem.attendance && classItem.attendance.length > 0) {
        const presentCount = classItem.attendance.filter(a => a.status === 'present').length;
        const totalAttendees = classItem.attendance.length;
        acc.totalClasses++;
        acc.totalAttendance += (presentCount / totalAttendees) * 100;
      }
      return acc;
    }, { totalClasses: 0, totalAttendance: 0 }) : { totalClasses: 0, totalAttendance: 0 };

    const avgAttendance = attendanceStats.totalClasses > 0 
      ? attendanceStats.totalAttendance / attendanceStats.totalClasses 
      : 0;

    const batchWithStats = {
      ...batch,
      statistics: {
        totalStudents: batch.enrolledStudents.length,
        activeStudents: activeStudents.length,
        completedStudents: completedStudents.length,
        dropoutRate: ((batch.enrolledStudents.length - activeStudents.length - completedStudents.length) / batch.enrolledStudents.length * 100) || 0,
        totalClasses,
        completedClasses,
        progressPercentage: totalClasses > 0 ? (completedClasses / totalClasses * 100) : 0,
        avgAttendance: Math.round(avgAttendance * 100) / 100
      }
    };

    res.json({
      success: true,
      data: batchWithStats
    });
  } catch (error) {
    console.error('Get admin batch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get batch details'
    });
  }
};

// Create batch
const createAdminBatch = async (req, res) => {
  try {
    const { 
      name, 
      course, 
      instructor, 
      maxStudents, 
      startDate, 
      endDate, 
      schedule,
      isActive = true 
    } = req.body;

    // Validate course exists
    const courseExists = await Course.findById(course);
    if (!courseExists) {
      return res.status(400).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Validate instructor exists and is approved
    const instructorExists = await Instructor.findById(instructor);
    if (!instructorExists || !instructorExists.isApproved) {
      return res.status(400).json({
        success: false,
        message: 'Instructor not found or not approved'
      });
    }

    // Parse schedule if it's a string
    let parsedSchedule = schedule;
    if (typeof schedule === 'string') {
      try {
        parsedSchedule = JSON.parse(schedule);
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: 'Invalid schedule format'
        });
      }
    }

    const batchData = {
      name,
      course,
      instructor,
      maxStudents: parseInt(maxStudents),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      schedule: parsedSchedule || [],
      isActive,
      enrolledStudents: [],
      classes: []
    };

    const batch = new Batch(batchData);
    await batch.save();

    // Populate the response
    const populatedBatch = await Batch.findById(batch._id)
      .populate('course', 'name fees duration')
      .populate('instructor', 'user designation')
      .populate('instructor.user', 'firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Batch created successfully',
      data: populatedBatch
    });
  } catch (error) {
    console.error('Create admin batch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create batch',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update batch
const updateAdminBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      course, 
      instructor, 
      maxStudents, 
      startDate, 
      endDate, 
      schedule,
      isActive 
    } = req.body;
    
    const batch = await Batch.findById(id);
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    // Update fields
    if (name) batch.name = name;
    if (course) batch.course = course;
    if (instructor) batch.instructor = instructor;
    if (maxStudents) batch.maxStudents = parseInt(maxStudents);
    if (startDate) batch.startDate = new Date(startDate);
    if (endDate) batch.endDate = new Date(endDate);
    if (schedule) {
      batch.schedule = typeof schedule === 'string' ? JSON.parse(schedule) : schedule;
    }
    if (typeof isActive === 'boolean') batch.isActive = isActive;

    await batch.save();

    // Populate the response
    const updatedBatch = await Batch.findById(id)
      .populate('course', 'name fees duration')
      .populate('instructor', 'user designation')
      .populate('instructor.user', 'firstName lastName');

    res.json({
      success: true,
      message: 'Batch updated successfully',
      data: updatedBatch
    });
  } catch (error) {
    console.error('Update admin batch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update batch'
    });
  }
};

// Delete batch
const deleteAdminBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { hard = false } = req.query;
    
    const batch = await Batch.findById(id);
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    // Check if batch has active students
    const activeStudents = batch.enrolledStudents.filter(e => e.status === 'active').length;
    
    if (activeStudents > 0 && hard === 'true') {
      return res.status(400).json({
        success: false,
        message: `Cannot delete batch with ${activeStudents} active students. Please transfer students first.`
      });
    }

    if (hard === 'true') {
      // Hard delete
      await Batch.findByIdAndDelete(id);
    } else {
      // Soft delete
      batch.isActive = false;
      await batch.save();
    }

    res.json({
      success: true,
      message: `Batch ${hard === 'true' ? 'deleted' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Delete admin batch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete batch'
    });
  }
};

// Add students to batch
const addStudentsToBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentIds } = req.body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Student IDs are required'
      });
    }

    const batch = await Batch.findById(id);
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    // Check capacity
    const currentEnrollment = batch.enrolledStudents.filter(e => e.status === 'active').length;
    if (currentEnrollment + studentIds.length > batch.maxStudents) {
      return res.status(400).json({
        success: false,
        message: `Batch capacity exceeded. Can only add ${batch.maxStudents - currentEnrollment} more students.`
      });
    }

    // Check if students exist and are not already enrolled
    const students = await Student.find({ _id: { $in: studentIds } });
    if (students.length !== studentIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Some students not found'
      });
    }

    // Add students to batch
    const newEnrollments = studentIds
      .filter(studentId => !batch.enrolledStudents.some(e => e.student.toString() === studentId))
      .map(studentId => ({
        student: studentId,
        enrolledAt: new Date(),
        status: 'active'
      }));

    batch.enrolledStudents.push(...newEnrollments);
    await batch.save();

    // Update student records
    await Student.updateMany(
      { _id: { $in: studentIds } },
      { $addToSet: { batches: id } }
    );

    res.json({
      success: true,
      message: `${newEnrollments.length} students added to batch successfully`,
      data: {
        addedCount: newEnrollments.length,
        currentEnrollment: batch.enrolledStudents.filter(e => e.status === 'active').length
      }
    });
  } catch (error) {
    console.error('Add students to batch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add students to batch'
    });
  }
};

// Remove student from batch
const removeStudentFromBatch = async (req, res) => {
  try {
    const { id, studentId } = req.params;

    const batch = await Batch.findById(id);
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    // Find and update student enrollment status
    const enrollment = batch.enrolledStudents.find(e => e.student.toString() === studentId);
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Student not found in batch'
      });
    }

    enrollment.status = 'inactive';
    await batch.save();

    // Remove batch from student record
    await Student.updateOne(
      { _id: studentId },
      { $pull: { batches: id } }
    );

    res.json({
      success: true,
      message: 'Student removed from batch successfully'
    });
  } catch (error) {
    console.error('Remove student from batch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove student from batch'
    });
  }
};

// Get batch statistics
const getBatchStats = async (req, res) => {
  try {
    const [
      totalBatches,
      activeBatches,
      totalStudentsInBatches,
      avgClassAttendance,
      upcomingClasses,
      recentBatches
    ] = await Promise.all([
      Batch.countDocuments({}),
      Batch.countDocuments({ isActive: true }),
      Batch.aggregate([
        { $unwind: '$enrolledStudents' },
        { $match: { 'enrolledStudents.status': 'active' } },
        { $count: 'total' }
      ]),
      Batch.aggregate([
        { $unwind: '$classes' },
        { $unwind: '$classes.attendance' },
        { $match: { 'classes.attendance.status': 'present' } },
        {
          $group: {
            _id: '$classes._id',
            presentCount: { $sum: 1 },
            totalCount: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: null,
            avgAttendance: { $avg: { $divide: ['$presentCount', '$totalCount'] } }
          }
        }
      ]),
      Batch.aggregate([
        { $unwind: '$classes' },
        { $match: { 
          'classes.date': { $gte: new Date() },
          'classes.status': 'scheduled'
        }},
        { $count: 'total' }
      ]),
      Batch.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('course', 'name')
        .populate('instructor', 'user')
        .populate('instructor.user', 'firstName lastName')
        .select('name course instructor enrolledStudents createdAt')
    ]);

    res.json({
      success: true,
      data: {
        totalBatches,
        activeBatches,
        inactiveBatches: totalBatches - activeBatches,
        totalStudentsInBatches: totalStudentsInBatches[0]?.total || 0,
        avgClassAttendance: (avgClassAttendance[0]?.avgAttendance || 0) * 100,
        upcomingClasses: upcomingClasses[0]?.total || 0,
        recentBatches
      }
    });
  } catch (error) {
    console.error('Get batch stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get batch statistics'
    });
  }
};

// Schedule class for batch
const scheduleClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, startTime, endTime, subject, meetingLink } = req.body;

    const batch = await Batch.findById(id);
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    // Check if class already exists for the date
    const existingClass = batch.classes.find(c => 
      new Date(c.date).toDateString() === new Date(date).toDateString()
    );

    if (existingClass) {
      return res.status(400).json({
        success: false,
        message: 'Class already scheduled for this date'
      });
    }

    const newClass = {
      date: new Date(date),
      startTime,
      endTime,
      subject: subject || null,
      meetingLink: meetingLink || '',
      status: 'scheduled',
      attendance: batch.enrolledStudents
        .filter(e => e.status === 'active')
        .map(e => ({
          student: e.student,
          status: 'absent'
        }))
    };

    batch.classes.push(newClass);
    await batch.save();

    res.json({
      success: true,
      message: 'Class scheduled successfully',
      data: newClass
    });
  } catch (error) {
    console.error('Schedule class error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule class'
    });
  }
};

// Update class attendance
const updateClassAttendance = async (req, res) => {
  try {
    const { id, classId } = req.params;
    const { attendance } = req.body;

    const batch = await Batch.findById(id);
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    const classItem = batch.classes.id(classId);
    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    // Update attendance
    attendance.forEach(attendanceItem => {
      const existingAttendance = classItem.attendance.find(a => 
        a.student.toString() === attendanceItem.student
      );
      
      if (existingAttendance) {
        existingAttendance.status = attendanceItem.status;
        if (attendanceItem.joinTime) existingAttendance.joinTime = new Date(attendanceItem.joinTime);
        if (attendanceItem.leaveTime) existingAttendance.leaveTime = new Date(attendanceItem.leaveTime);
      }
    });

    await batch.save();

    res.json({
      success: true,
      message: 'Attendance updated successfully'
    });
  } catch (error) {
    console.error('Update class attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update attendance'
    });
  }
};

module.exports = {
  getAdminBatches,
  getAdminBatch,
  createAdminBatch,
  updateAdminBatch,
  deleteAdminBatch,
  addStudentsToBatch,
  removeStudentFromBatch,
  getBatchStats,
  scheduleClass,
  updateClassAttendance
};