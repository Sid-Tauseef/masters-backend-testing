const { validationResult } = require('express-validator');
const Achievement = require('../models/Achievement');
const { deleteImage, extractPublicId } = require('../config/cloudinary');

// @desc    Get all achievements
// @route   GET /api/achievements
// @access  Public
const getAchievements = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      featured,
      isActive = true 
    } = req.query;

    const query = { isActive };
    
    if (category) query.category = category;
    if (featured !== undefined) query.featured = featured === 'true';

    const achievements = await Achievement.find(query)
      .sort({ priority: -1, date: -1, featured: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    const total = await Achievement.countDocuments(query);

    res.json({
      success: true,
      data: {
        achievements,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching achievements'
    });
  }
};

// @desc    Get single achievement
// @route   GET /api/achievements/:id
// @access  Public
const getAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);
    
    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found'
      });
    }

    res.json({
      success: true,
      data: achievement
    });
  } catch (error) {
    console.error('Get achievement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching achievement'
    });
  }
};

// @desc    Create achievement
// @route   POST /api/achievements
// @access  Private
const createAchievement = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const achievementData = req.body;
    
    // Parse JSON fields from FormData
    if (achievementData.relatedStudents && typeof achievementData.relatedStudents === 'string') {
      try {
        achievementData.relatedStudents = JSON.parse(achievementData.relatedStudents);
      } catch (error) {
        achievementData.relatedStudents = [];
      }
    }
    
    // Handle image upload
    if (req.file) {
      achievementData.image = req.file.path;
    }

    const achievement = await Achievement.create(achievementData);

    res.status(201).json({
      success: true,
      message: 'Achievement created successfully',
      data: achievement
    });
  } catch (error) {
    console.error('Create achievement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating achievement'
    });
  }
};

// @desc    Update achievement
// @route   PUT /api/achievements/:id
// @access  Private
const updateAchievement = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const achievement = await Achievement.findById(req.params.id);
    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found'
      });
    }

    const updateData = req.body;

    // Parse JSON fields from FormData
    if (updateData.relatedStudents && typeof updateData.relatedStudents === 'string') {
      try {
        updateData.relatedStudents = JSON.parse(updateData.relatedStudents);
      } catch (error) {
        updateData.relatedStudents = [];
      }
    }

    // Handle image upload
    if (req.file) {
      // Delete old image from Cloudinary
      if (achievement.image) {
        try {
          const publicId = extractPublicId(achievement.image);
          await deleteImage(publicId);
        } catch (error) {
          console.error('Error deleting old image:', error);
        }
      }
      updateData.image = req.file.path;
    }

    const updatedAchievement = await Achievement.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Achievement updated successfully',
      data: updatedAchievement
    });
  } catch (error) {
    console.error('Update achievement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating achievement'
    });
  }
};

// @desc    Delete achievement
// @route   DELETE /api/achievements/:id
// @access  Private
const deleteAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);
    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found'
      });
    }

    // Delete image from Cloudinary
    if (achievement.image) {
      try {
        const publicId = extractPublicId(achievement.image);
        await deleteImage(publicId);
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }

    await Achievement.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Achievement deleted successfully'
    });
  } catch (error) {
    console.error('Delete achievement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting achievement'
    });
  }
};

module.exports = {
  getAchievements,
  getAchievement,
  createAchievement,
  updateAchievement,
  deleteAchievement
};