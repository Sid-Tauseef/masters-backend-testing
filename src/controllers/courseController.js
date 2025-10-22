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
    if (courseData.instructor && typeof courseData.instructor === 'string') {
      try {
        courseData.instructor = JSON.parse(courseData.instructor);
      } catch (error) {
        courseData.instructor = {};
      }
    }
    // Handle image upload with strict validation
    console.log('req.file exists?', !!req.file); // Always log presence
    if (req.file) {
      console.log('Full req.file object:', JSON.stringify(req.file, null, 2)); // Full debug log
      // Strict check for empty object or invalid path
      if (!req.file || Object.keys(req.file).length === 0) {
        console.error('Empty req.file object received');
        return res.status(400).json({
          success: false,
          message: 'Empty file uploaded - Cloudinary failure. Check env vars and redeploy.'
        });
      }
      if (!req.file.path || 
          typeof req.file.path !== 'string' || 
          req.file.path.length === 0 || 
          !req.file.path.includes('res.cloudinary.com')) { // Ensure Cloudinary URL
        console.error('Invalid uploaded file - no valid path:', req.file);
        return res.status(400).json({
          success: false,
          message: 'Image upload to Cloudinary failed. Check file size/format and env vars (max 5MB, JPG/PNG).'
        });
      }
      courseData.image = req.file.path;
      console.log('Valid image set:', courseData.image);
    } else {
      console.log('No req.file present - skipping image');
    }
    // If no image, Mongoose will validate required below
    const course = await Course.create(courseData);
    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course
    });
  } catch (error) {
    console.error('Create course error:', error.message, error.stack);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages
      });
    } else if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid data format (e.g., image URL). Please check your input.'
      });
    }
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
    console.log('🔍 Update course request received:', {
      params: req.params,
      body: req.body,
      file: req.file ? {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path
      } : 'No file'
    })

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

    const updateData = { ...req.body };
    
    console.log('📝 Initial update data:', updateData)
    
    // Handle empty image object from potential form data
    if (updateData.image && typeof updateData.image === 'object' && Object.keys(updateData.image).length === 0) {
      console.log('🔄 Removing empty image object')
      delete updateData.image;
    }
    
    // Parse JSON fields from FormData
    if (updateData.features && typeof updateData.features === 'string') {
      try {
        updateData.features = JSON.parse(updateData.features);
        console.log('✅ Parsed features:', updateData.features)
      } catch (error) {
        console.log('❌ Error parsing features:', error)
        updateData.features = [];
      }
    }

    if (updateData.instructor && typeof updateData.instructor === 'string') {
      try {
        updateData.instructor = JSON.parse(updateData.instructor);
        console.log('✅ Parsed instructor:', updateData.instructor)
      } catch (error) {
        console.log('❌ Error parsing instructor:', error)
        updateData.instructor = {};
      }
    }

    // Handle image upload with strict validation
    console.log('req.file exists for update?', !!req.file); // Always log presence
    if (req.file) {
      console.log('Full req.file object for update:', JSON.stringify(req.file, null, 2)); // Full debug log
      console.log('Old image URL:', course.image)
      console.log('New image path:', req.file.path)
      
      // Strict check for empty object or invalid path
      if (!req.file || Object.keys(req.file).length === 0) {
        console.error('Empty req.file object received for update');
        return res.status(400).json({
          success: false,
          message: 'Empty file uploaded - Cloudinary failure. Check env vars and redeploy.'
        });
      }
      if (!req.file.path || 
          typeof req.file.path !== 'string' || 
          req.file.path.length === 0 || 
          !req.file.path.includes('res.cloudinary.com')) {
        console.error('Invalid uploaded file for update - no valid path:', req.file);
        return res.status(400).json({
          success: false,
          message: 'Image upload to Cloudinary failed. Check file size/format and env vars (max 5MB, JPG/PNG).'
        });
      }
      
      // Delete old image from Cloudinary
      if (course.image) {
        try {
          const publicId = extractPublicId(course.image);
          console.log('🗑️ Deleting old image with publicId:', publicId)
          await deleteImage(publicId);
          console.log('✅ Old image deleted successfully')
        } catch (error) {
          console.error('❌ Error deleting old image:', error)
        }
      }
      updateData.image = req.file.path;
      console.log('✅ New image URL set:', updateData.image)
    } else {
      console.log('ℹ️ No new image file in request for update')
      // Preserve existing image if no new one and not explicitly removing
      if (!updateData.hasOwnProperty('image')) {
        updateData.image = course.image;
      }
    }

    console.log('📤 Final update data:', updateData)

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    console.log('✅ Course updated successfully:', updatedCourse._id)

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: updatedCourse
    });
  } catch (error) {
    console.error('Update course error:', error.message, error.stack);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages
      });
    } else if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid data format (e.g., image URL). Please check your input.'
      });
    }
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