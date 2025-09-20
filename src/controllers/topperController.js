const { validationResult } = require('express-validator');
const Topper = require('../models/Topper');
const { deleteImage, extractPublicId } = require('../config/cloudinary');

// @desc    Get all toppers
// @route   GET /api/toppers
// @access  Public
const getToppers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      year, 
      exam,
      featured,
      isActive = true 
    } = req.query;

    const query = { isActive };
    
    if (year) query.year = year;
    if (exam) query.exam = new RegExp(exam, 'i');
    if (featured !== undefined) query.featured = featured === 'true';

    const toppers = await Topper.find(query)
      .sort({ year: -1, featured: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    const total = await Topper.countDocuments(query);

    res.json({
      success: true,
      data: {
        toppers,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get toppers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching toppers'
    });
  }
};

// @desc    Get single topper
// @route   GET /api/toppers/:id
// @access  Public
const getTopper = async (req, res) => {
  try {
    const topper = await Topper.findById(req.params.id);
    
    if (!topper) {
      return res.status(404).json({
        success: false,
        message: 'Topper not found'
      });
    }

    res.json({
      success: true,
      data: topper
    });
  } catch (error) {
    console.error('Get topper error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching topper'
    });
  }
};

// @desc    Create topper
// @route   POST /api/toppers
// @access  Private
const createTopper = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const topperData = req.body;
    
    // Handle image upload
    if (req.file) {
      topperData.photo = req.file.path;
    }

    const topper = await Topper.create(topperData);

    res.status(201).json({
      success: true,
      message: 'Topper created successfully',
      data: topper
    });
  } catch (error) {
    console.error('Create topper error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating topper'
    });
  }
};

// @desc    Update topper
// @route   PUT /api/toppers/:id
// @access  Private
const updateTopper = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const topper = await Topper.findById(req.params.id);
    if (!topper) {
      return res.status(404).json({
        success: false,
        message: 'Topper not found'
      });
    }

    const updateData = req.body;

    // Handle image upload
    if (req.file) {
      // Delete old image from Cloudinary
      if (topper.photo) {
        try {
          const publicId = extractPublicId(topper.photo);
          await deleteImage(publicId);
        } catch (error) {
          console.error('Error deleting old image:', error);
        }
      }
      updateData.photo = req.file.path;
    }

    const updatedTopper = await Topper.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Topper updated successfully',
      data: updatedTopper
    });
  } catch (error) {
    console.error('Update topper error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating topper'
    });
  }
};

// @desc    Delete topper
// @route   DELETE /api/toppers/:id
// @access  Private
const deleteTopper = async (req, res) => {
  try {
    const topper = await Topper.findById(req.params.id);
    if (!topper) {
      return res.status(404).json({
        success: false,
        message: 'Topper not found'
      });
    }

    // Delete image from Cloudinary
    if (topper.photo) {
      try {
        const publicId = extractPublicId(topper.photo);
        await deleteImage(publicId);
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }

    await Topper.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Topper deleted successfully'
    });
  } catch (error) {
    console.error('Delete topper error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting topper'
    });
  }
};

module.exports = {
  getToppers,
  getTopper,
  createTopper,
  updateTopper,
  deleteTopper
};