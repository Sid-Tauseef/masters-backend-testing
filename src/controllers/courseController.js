const { validationResult } = require('express-validator');
const Course = require('../models/Course');
const { deleteImage, extractPublicId } = require('../config/cloudinary');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
const getCourses = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      level, 
      search,
      isActive = true 
    } = req.query;

    const query = { isActive };
    
    if (category) query.category = category;
    if (level) query.level = level;
    if (search) {
      query.$text = { $search: search };
    }

    const courses = await Course.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    const total = await Course.countDocuments(query);

    res.json({
      success: true,
      data: {
        courses,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching courses'
    });
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
const getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching course'
    });
  }
};

// @desc    Create course
// @route   POST /api/courses
// @access  Private
const createCourse = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const courseData = req.body;
    
    // Parse JSON fields from FormData
    if (courseData.features && typeof courseData.features === 'string') {
      try {
        courseData.features = JSON.parse(courseData.features);
      } catch (error) {
        courseData.features = [];
      }
    }
    
    if (courseData.syllabus && typeof courseData.syllabus === 'string') {
      try {
        courseData.syllabus = JSON.parse(courseData.syllabus);
      } catch (error) {
        courseData.syllabus = [];
      }
    }
    
    if (courseData.instructor && typeof courseData.instructor === 'string') {
      try {
        courseData.instructor = JSON.parse(courseData.instructor);
      } catch (error) {
        courseData.instructor = {};
      }
    }
    
    // Handle image upload
    if (req.file) {
      courseData.image = req.file.path;
    }

    const course = await Course.create(courseData);

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating course'
    });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private
const updateCourse = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const updateData = req.body;

    // Parse JSON fields from FormData
    if (updateData.features && typeof updateData.features === 'string') {
      try {
        updateData.features = JSON.parse(updateData.features);
      } catch (error) {
        updateData.features = [];
      }
    }
    
    if (updateData.syllabus && typeof updateData.syllabus === 'string') {
      try {
        updateData.syllabus = JSON.parse(updateData.syllabus);
      } catch (error) {
        updateData.syllabus = [];
      }
    }
    
    if (updateData.instructor && typeof updateData.instructor === 'string') {
      try {
        updateData.instructor = JSON.parse(updateData.instructor);
      } catch (error) {
        updateData.instructor = {};
      }
    }

    // Handle image upload
    if (req.file) {
      // Delete old image from Cloudinary
      if (course.image) {
        try {
          const publicId = extractPublicId(course.image);
          await deleteImage(publicId);
        } catch (error) {
          console.error('Error deleting old image:', error);
        }
      }
      updateData.image = req.file.path;
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: updatedCourse
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating course'
    });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Delete image from Cloudinary
    if (course.image) {
      try {
        const publicId = extractPublicId(course.image);
        await deleteImage(publicId);
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }

    await Course.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting course'
    });
  }
};

module.exports = {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse
};