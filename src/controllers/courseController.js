const { validationResult } = require('express-validator');
const Course = require('../models/Course');
const { deleteImage, extractPublicId, uploadToCloudinary } = require('../config/cloudinary');

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
    console.log('🔄 CREATE COURSE STARTED');
    console.log('📦 Request file:', req.file);
    console.log('📝 Request body:', req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const courseData = { ...req.body };
    
    // Parse JSON fields from FormData
    if (courseData.features && typeof courseData.features === 'string') {
      try {
        courseData.features = JSON.parse(courseData.features);
        console.log('✅ Parsed features:', courseData.features);
      } catch (error) {
        console.log('❌ Error parsing features:', error);
        courseData.features = [];
      }
    }
    
    if (courseData.instructor && typeof courseData.instructor === 'string') {
      try {
        courseData.instructor = JSON.parse(courseData.instructor);
        console.log('✅ Parsed instructor:', courseData.instructor);
      } catch (error) {
        console.log('❌ Error parsing instructor:', error);
        courseData.instructor = {};
      }
    }

    // FIXED: Handle image upload with memory storage
    console.log('🖼️ Image upload check - req.file exists:', !!req.file);
    
    if (req.file) {
      console.log('📸 File details:', {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        buffer: req.file.buffer ? `Buffer of ${req.file.buffer.length} bytes` : 'No buffer'
      });

      try {
        // Upload to Cloudinary manually
        console.log('☁️ Uploading to Cloudinary...');
        const uploadResult = await uploadToCloudinary(req.file.buffer);
        console.log('✅ Cloudinary upload result:', uploadResult);
        
        if (uploadResult && uploadResult.secure_url) {
          courseData.image = uploadResult.secure_url;
          console.log('✅ Image URL set successfully:', courseData.image);
        } else {
          throw new Error('Cloudinary upload failed - no URL returned');
        }
      } catch (uploadError) {
        console.error('❌ Cloudinary upload error:', uploadError);
        return res.status(400).json({
          success: false,
          message: `Image upload failed: ${uploadError.message}`
        });
      }
    } else {
      console.log('❌ No image file provided in req.file');
      return res.status(400).json({
        success: false,
        message: 'Course image is required'
      });
    }

    // Create course with image validation
    console.log('📝 Final course data:', courseData);
    const course = await Course.create(courseData);
    
    console.log('✅ Course created successfully:', course._id);

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course
    });
  } catch (error) {
    console.error('❌ Create course error:', error.message);
    console.error('❌ Error stack:', error.stack);
    
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
        message: 'Invalid data format. Please check your input fields.'
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
        buffer: req.file.buffer ? `Buffer of ${req.file.buffer.length} bytes` : 'No buffer'
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

    // FIXED: Handle image upload with memory storage
    console.log('🖼️ Image upload check for update - req.file exists:', !!req.file);
    
    if (req.file) {
      console.log('📸 File details for update:', {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      });

      try {
        // Upload to Cloudinary manually
        console.log('☁️ Uploading to Cloudinary...');
        const uploadResult = await uploadToCloudinary(req.file.buffer);
        console.log('✅ Cloudinary upload result:', uploadResult);
        
        if (uploadResult && uploadResult.secure_url) {
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
          
          updateData.image = uploadResult.secure_url;
          console.log('✅ New image URL set:', updateData.image)
        } else {
          throw new Error('Cloudinary upload failed - no URL returned');
        }
      } catch (uploadError) {
        console.error('❌ Cloudinary upload error:', uploadError);
        return res.status(400).json({
          success: false,
          message: `Image upload failed: ${uploadError.message}`
        });
      }
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
    console.error('❌ Update course error:', error.message, error.stack);
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