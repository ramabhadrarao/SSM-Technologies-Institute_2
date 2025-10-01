const Course = require('../models/Course');
const Subject = require('../models/Subject');
const { getFileUrl, deleteFile } = require('../middleware/upload');

// Get all courses (public)
const getCourses = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, minFees, maxFees, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build query
    const query = { isActive: true };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (minFees || maxFees) {
      query.fees = {};
      if (minFees) query.fees.$gte = parseFloat(minFees);
      if (maxFees) query.fees.$lte = parseFloat(maxFees);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const courses = await Course.find(query)
      .populate('subjects', 'name description')
      .populate('instructor', 'user bio designation')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Get total count for pagination
    const total = await Course.countDocuments(query);

    // Add file URLs and enrollment count
    const Student = require('../models/Student');
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
        isDiscountValid: course.isDiscountValid ? course.isDiscountValid() : false,
        discountedPrice: course.getDiscountedPrice ? course.getDiscountedPrice() : course.fees,
        effectivePrice: course.getEffectivePrice ? course.getEffectivePrice() : course.fees,
        discountAmount: course.getDiscountAmount ? course.getDiscountAmount() : 0
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
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get courses'
    });
  }
};

// Get single course (public)
const getCourse = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get course instance first to access methods for discount calculations
    const courseInstance = await Course.findOne({ _id: id, isActive: true })
      .populate('subjects', 'name description imageUrl')
      .populate('instructor', 'user bio designation imageUrl')
      .populate('reviews.student', 'user');

    if (!courseInstance) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Convert to plain object and add file URLs
    const course = courseInstance.toObject();
    
    // Calculate discount values using the instance methods
    const isDiscountValid = courseInstance.isDiscountValid();
    const discountedPrice = courseInstance.getDiscountedPrice();
    const effectivePrice = courseInstance.getEffectivePrice();
    const discountAmount = courseInstance.getDiscountAmount();
    
    const courseWithUrls = {
      ...course,
      imageUrl: getFileUrl(course.imageUrl),
      videoUrl: getFileUrl(course.videoUrl),
      subjects: course.subjects.map(subject => ({
        ...subject,
        imageUrl: getFileUrl(subject.imageUrl)
      }))
    };

    // Explicitly add discount calculation results to ensure they're included
    courseWithUrls.isDiscountValid = isDiscountValid;
    courseWithUrls.discountedPrice = discountedPrice;
    courseWithUrls.effectivePrice = effectivePrice;
    courseWithUrls.discountAmount = discountAmount;

    console.log('DEBUG: Before sending response');
    console.log('isDiscountValid:', courseWithUrls.isDiscountValid);
    console.log('discountedPrice:', courseWithUrls.discountedPrice);
    console.log('effectivePrice:', courseWithUrls.effectivePrice);
    console.log('discountAmount:', courseWithUrls.discountAmount);

    res.json({
      success: true,
      data: courseWithUrls
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get course'
    });
  }
};

// Create course (admin/instructor)
const createCourse = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      fees, 
      duration, 
      structure, 
      subjects,
      discountPercentage,
      isDiscountActive,
      discountStartDate,
      discountEndDate
    } = req.body;
    
    const courseData = {
      name,
      description,
      fees,
      duration,
      structure: structure || [],
      subjects: subjects || []
    };

    // Add discount fields if provided
    if (discountPercentage !== undefined) {
      courseData.discountPercentage = parseFloat(discountPercentage);
    }
    if (isDiscountActive !== undefined) {
      courseData.isDiscountActive = Boolean(isDiscountActive);
    }
    if (discountStartDate) {
      courseData.discountStartDate = new Date(discountStartDate);
    }
    if (discountEndDate) {
      courseData.discountEndDate = new Date(discountEndDate);
    }

    // Add file URLs if uploaded
    if (req.files) {
      if (req.files.image) {
        courseData.imageUrl = req.files.image[0].path;
      }
      if (req.files.video) {
        courseData.videoUrl = req.files.video[0].path;
      }
    }

    // Set instructor if user is instructor
    if (req.user.role === 'instructor') {
      const Instructor = require('../models/Instructor');
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
          message: 'Access denied. Your instructor account is pending approval. Please wait for admin approval to create courses.'
        });
      }

      courseData.instructor = instructor._id;
    }

    const course = new Course(courseData);
    await course.save();

    // Populate the response
    await course.populate('subjects', 'name description');
    await course.populate('instructor', 'user bio designation');

    // Add pricing information to response
    const courseResponse = {
      ...course.toObject(),
      imageUrl: getFileUrl(course.imageUrl),
      videoUrl: getFileUrl(course.videoUrl),
      isDiscountValid: course.isDiscountValid(),
      discountedPrice: course.getDiscountedPrice(),
      effectivePrice: course.getEffectivePrice(),
      discountAmount: course.getDiscountAmount()
    };

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: courseResponse
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create course'
    });
  }
};

// Update course (admin/instructor)
const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      fees, 
      duration, 
      structure, 
      subjects,
      discountPercentage,
      isDiscountActive,
      discountStartDate,
      discountEndDate
    } = req.body;
    
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check permissions
    if (req.user.role === 'instructor') {
      const Instructor = require('../models/Instructor');
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
          message: 'Access denied. Your instructor account is pending approval. Please wait for admin approval to update courses.'
        });
      }

      if (course.instructor.toString() !== instructor._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    // Update fields
    if (name) course.name = name;
    if (description) course.description = description;
    if (fees !== undefined) course.fees = fees;
    if (duration) course.duration = duration;
    if (structure) course.structure = structure;
    if (subjects) course.subjects = subjects;

    // Update discount fields
    if (discountPercentage !== undefined) {
      course.discountPercentage = parseFloat(discountPercentage);
    }
    if (isDiscountActive !== undefined) {
      course.isDiscountActive = Boolean(isDiscountActive);
    }
    if (discountStartDate !== undefined) {
      course.discountStartDate = discountStartDate ? new Date(discountStartDate) : null;
    }
    if (discountEndDate !== undefined) {
      course.discountEndDate = discountEndDate ? new Date(discountEndDate) : null;
    }

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
    await course.populate('subjects', 'name description');
    await course.populate('instructor', 'user bio designation');

    // Add pricing information to response
    const courseResponse = {
      ...course.toObject(),
      imageUrl: getFileUrl(course.imageUrl),
      videoUrl: getFileUrl(course.videoUrl),
      isDiscountValid: course.isDiscountValid(),
      discountedPrice: course.getDiscountedPrice(),
      effectivePrice: course.getEffectivePrice(),
      discountAmount: course.getDiscountAmount()
    };

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: courseResponse
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update course'
    });
  }
};

// Delete course (admin only)
const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Soft delete
    course.isActive = false;
    await course.save();

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete course'
    });
  }
};

// Add course review (student only)
const addReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if student is enrolled
    const Student = require('../models/Student');
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(403).json({
        success: false,
        message: 'Only students can add reviews'
      });
    }

    const isEnrolled = student.enrolledCourses.some(
      enrollment => enrollment.course.toString() === id
    );
    
    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled in this course to add a review'
      });
    }

    // Check if already reviewed
    const existingReview = course.reviews.find(
      review => review.student.toString() === student._id.toString()
    );
    
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this course'
      });
    }

    // Add review
    course.reviews.push({
      student: student._id,
      rating,
      comment
    });

    // Update course rating
    const totalRating = course.reviews.reduce((sum, review) => sum + review.rating, 0);
    course.rating = totalRating / course.reviews.length;

    await course.save();

    res.json({
      success: true,
      message: 'Review added successfully'
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add review'
    });
  }
};

module.exports = {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  addReview
};