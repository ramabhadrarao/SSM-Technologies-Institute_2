// server/controllers/adminSubjectController.js
const Subject = require('../models/Subject');
const Course = require('../models/Course');
const { getFileUrl, deleteFile } = require('../middleware/upload');

// Get all subjects for admin with detailed info
const getAdminSubjects = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      course, 
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
    
    if (course) {
      query.course = course;
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
    const subjects = await Subject.find(query)
      .populate('course', 'name fees duration')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Get total count for pagination
    const total = await Subject.countDocuments(query);

    // Add file URLs
    const subjectsWithDetails = subjects.map(subject => ({
      ...subject,
      imageUrl: getFileUrl(subject.imageUrl),
      syllabusCount: subject.syllabus?.length || 0,
      materialsCount: subject.materials?.length || 0
    }));

    res.json({
      success: true,
      data: {
        subjects: subjectsWithDetails,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get admin subjects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subjects'
    });
  }
};

// Get single subject details for admin
const getAdminSubject = async (req, res) => {
  try {
    const { id } = req.params;
    
    const subject = await Subject.findById(id)
      .populate('course', 'name description fees duration')
      .lean();

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    const subjectWithDetails = {
      ...subject,
      imageUrl: getFileUrl(subject.imageUrl),
      materials: subject.materials?.map(material => ({
        ...material,
        url: getFileUrl(material.url)
      })) || []
    };

    res.json({
      success: true,
      data: subjectWithDetails
    });
  } catch (error) {
    console.error('Get admin subject error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subject details'
    });
  }
};

// Create subject (enhanced for admin)
const createAdminSubject = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      course, 
      syllabus,
      isActive = true 
    } = req.body;
    
    const subjectData = {
      name,
      description,
      course: course || null,
      syllabus: syllabus ? JSON.parse(syllabus) : [],
      isActive,
      materials: []
    };

    // Add image URL if uploaded
    if (req.file) {
      subjectData.imageUrl = req.file.path;
    }

    const subject = new Subject(subjectData);
    await subject.save();

    // Populate the response
    const populatedSubject = await Subject.findById(subject._id)
      .populate('course', 'name description');

    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: {
        ...populatedSubject.toObject(),
        imageUrl: getFileUrl(populatedSubject.imageUrl)
      }
    });
  } catch (error) {
    console.error('Create admin subject error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create subject',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update subject (enhanced for admin)
const updateAdminSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      course, 
      syllabus,
      isActive 
    } = req.body;
    
    const subject = await Subject.findById(id);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    // Update fields
    if (name) subject.name = name;
    if (description) subject.description = description;
    if (course !== undefined) subject.course = course || null;
    if (syllabus) subject.syllabus = JSON.parse(syllabus);
    if (typeof isActive === 'boolean') subject.isActive = isActive;

    // Handle image upload
    if (req.file) {
      // Delete old image
      if (subject.imageUrl) {
        deleteFile(subject.imageUrl);
      }
      subject.imageUrl = req.file.path;
    }

    await subject.save();

    // Populate the response
    const updatedSubject = await Subject.findById(id)
      .populate('course', 'name description');

    res.json({
      success: true,
      message: 'Subject updated successfully',
      data: {
        ...updatedSubject.toObject(),
        imageUrl: getFileUrl(updatedSubject.imageUrl)
      }
    });
  } catch (error) {
    console.error('Update admin subject error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update subject'
    });
  }
};

// Delete subject (enhanced for admin)
const deleteAdminSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { hard = false } = req.query;
    
    const subject = await Subject.findById(id);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    if (hard === 'true') {
      // Hard delete
      if (subject.imageUrl) deleteFile(subject.imageUrl);
      // Delete associated materials
      if (subject.materials) {
        subject.materials.forEach(material => {
          if (material.url) deleteFile(material.url);
        });
      }
      await Subject.findByIdAndDelete(id);
    } else {
      // Soft delete
      subject.isActive = false;
      await subject.save();
    }

    res.json({
      success: true,
      message: `Subject ${hard === 'true' ? 'deleted' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Delete admin subject error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete subject'
    });
  }
};

// Bulk operations on subjects
const bulkUpdateSubjects = async (req, res) => {
  try {
    const { subjectIds, action, data } = req.body;
    
    if (!subjectIds || !Array.isArray(subjectIds) || subjectIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Subject IDs are required'
      });
    }

    let updateQuery = {};
    let message = '';

    switch (action) {
      case 'activate':
        updateQuery = { isActive: true };
        message = 'Subjects activated successfully';
        break;
      case 'deactivate':
        updateQuery = { isActive: false };
        message = 'Subjects deactivated successfully';
        break;
      case 'delete':
        updateQuery = { isActive: false };
        message = 'Subjects deleted successfully';
        break;
      case 'assign-course':
        if (!data?.course) {
          return res.status(400).json({
            success: false,
            message: 'Course ID is required'
          });
        }
        updateQuery = { course: data.course };
        message = 'Course assigned to subjects';
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
    }

    const result = await Subject.updateMany(
      { _id: { $in: subjectIds } },
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
    console.error('Bulk update subjects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update subjects'
    });
  }
};

// Get subject statistics
const getSubjectStats = async (req, res) => {
  try {
    const [
      totalSubjects,
      activeSubjects,
      subjectsWithCourse,
      subjectsWithoutCourse,
      avgSyllabusLength,
      recentSubjects
    ] = await Promise.all([
      Subject.countDocuments({}),
      Subject.countDocuments({ isActive: true }),
      Subject.countDocuments({ course: { $ne: null }, isActive: true }),
      Subject.countDocuments({ course: null, isActive: true }),
      Subject.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, avgLength: { $avg: { $size: '$syllabus' } } } }
      ]),
      Subject.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('course', 'name')
        .select('name course syllabus materials createdAt')
    ]);

    res.json({
      success: true,
      data: {
        totalSubjects,
        activeSubjects,
        inactiveSubjects: totalSubjects - activeSubjects,
        subjectsWithCourse,
        subjectsWithoutCourse,
        avgSyllabusLength: avgSyllabusLength[0]?.avgLength || 0,
        recentSubjects
      }
    });
  } catch (error) {
    console.error('Get subject stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subject statistics'
    });
  }
};

// Add material to subject
const addSubjectMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, type, description } = req.body;

    const subject = await Subject.findById(id);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    const materialData = {
      title,
      type,
      description: description || '',
      uploadedAt: new Date()
    };

    // Add file URL if uploaded
    if (req.file) {
      materialData.url = req.file.path;
    }

    subject.materials.push(materialData);
    await subject.save();

    res.json({
      success: true,
      message: 'Material added successfully',
      data: {
        ...materialData,
        url: getFileUrl(materialData.url)
      }
    });
  } catch (error) {
    console.error('Add subject material error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add material'
    });
  }
};

// Remove material from subject
const removeSubjectMaterial = async (req, res) => {
  try {
    const { id, materialId } = req.params;

    const subject = await Subject.findById(id);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    const material = subject.materials.id(materialId);
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    // Delete file if exists
    if (material.url) {
      deleteFile(material.url);
    }

    subject.materials.pull(materialId);
    await subject.save();

    res.json({
      success: true,
      message: 'Material removed successfully'
    });
  } catch (error) {
    console.error('Remove subject material error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove material'
    });
  }
};

module.exports = {
  getAdminSubjects,
  getAdminSubject,
  createAdminSubject,
  updateAdminSubject,
  deleteAdminSubject,
  bulkUpdateSubjects,
  getSubjectStats,
  addSubjectMaterial,
  removeSubjectMaterial
};