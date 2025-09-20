const { validationResult } = require('express-validator');
const Home = require('../models/Home');
const { deleteImage, extractPublicId } = require('../config/cloudinary');

// @desc    Get all home sections
// @route   GET /api/home
// @access  Public
const getHomeSections = async (req, res) => {
  try {
    const { section, isActive = true } = req.query;
    
    const query = { isActive };
    if (section) query.section = section;

    const sections = await Home.find(query)
      .sort({ order: 1, createdAt: 1 })
      .select('-__v');

    res.json({
      success: true,
      data: sections
    });
  } catch (error) {
    console.error('Get home sections error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching home sections'
    });
  }
};

// @desc    Get single home section
// @route   GET /api/home/:section
// @access  Public
const getHomeSection = async (req, res) => {
  try {
    const section = await Home.findOne({ section: req.params.section });
    
    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Home section not found'
      });
    }

    res.json({
      success: true,
      data: section
    });
  } catch (error) {
    console.error('Get home section error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching home section'
    });
  }
};

// @desc    Create home section
// @route   POST /api/home
// @access  Private
const createHomeSection = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Check if section already exists
    const existingSection = await Home.findOne({ section: req.body.section });
    if (existingSection) {
      // Update existing section instead of creating new one
      const updateData = req.body;
      
      // Parse JSON fields from FormData
      if (updateData.stats && typeof updateData.stats === 'string') {
        try {
          updateData.stats = JSON.parse(updateData.stats);
        } catch (error) {
          updateData.stats = [];
        }
      }
      
      if (updateData.testimonials && typeof updateData.testimonials === 'string') {
        try {
          updateData.testimonials = JSON.parse(updateData.testimonials);
        } catch (error) {
          updateData.testimonials = [];
        }
      }
      
      if (updateData.announcements && typeof updateData.announcements === 'string') {
        try {
          updateData.announcements = JSON.parse(updateData.announcements);
        } catch (error) {
          updateData.announcements = [];
        }
      }

      // Handle image upload
      if (req.file) {
        // Delete old image from Cloudinary
        if (existingSection.image) {
          try {
            const publicId = extractPublicId(existingSection.image);
            await deleteImage(publicId);
          } catch (error) {
            console.error('Error deleting old image:', error);
          }
        }
        updateData.image = req.file.path;
      }

      const updatedSection = await Home.findOneAndUpdate(
        { section: req.body.section },
        updateData,
        { new: true, runValidators: true }
      );

      return res.json({
        success: true,
        message: 'Home section updated successfully',
        data: updatedSection
      });
    }

    const sectionData = req.body;
    
    // Parse JSON fields from FormData
    if (sectionData.stats && typeof sectionData.stats === 'string') {
      try {
        sectionData.stats = JSON.parse(sectionData.stats);
      } catch (error) {
        sectionData.stats = [];
      }
    }
    
    if (sectionData.testimonials && typeof sectionData.testimonials === 'string') {
      try {
        sectionData.testimonials = JSON.parse(sectionData.testimonials);
      } catch (error) {
        sectionData.testimonials = [];
      }
    }
    
    if (sectionData.announcements && typeof sectionData.announcements === 'string') {
      try {
        sectionData.announcements = JSON.parse(sectionData.announcements);
      } catch (error) {
        sectionData.announcements = [];
      }
    }
    
    // Handle image upload
    if (req.file) {
      sectionData.image = req.file.path;
    }

    const section = await Home.create(sectionData);

    res.status(201).json({
      success: true,
      message: 'Home section created successfully',
      data: section
    });
  } catch (error) {
    console.error('Create home section error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating home section'
    });
  }
};

// @desc    Update home section
// @route   PUT /api/home/:section
// @access  Private
const updateHomeSection = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const section = await Home.findOne({ section: req.params.section });
    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Home section not found'
      });
    }

    const updateData = req.body;

    // Parse JSON fields from FormData
    if (updateData.stats && typeof updateData.stats === 'string') {
      try {
        updateData.stats = JSON.parse(updateData.stats);
      } catch (error) {
        updateData.stats = [];
      }
    }
    
    if (updateData.testimonials && typeof updateData.testimonials === 'string') {
      try {
        updateData.testimonials = JSON.parse(updateData.testimonials);
      } catch (error) {
        updateData.testimonials = [];
      }
    }
    
    if (updateData.announcements && typeof updateData.announcements === 'string') {
      try {
        updateData.announcements = JSON.parse(updateData.announcements);
      } catch (error) {
        updateData.announcements = [];
      }
    }

    // Handle image upload
    if (req.file) {
      // Delete old image from Cloudinary
      if (section.image) {
        try {
          const publicId = extractPublicId(section.image);
          await deleteImage(publicId);
        } catch (error) {
          console.error('Error deleting old image:', error);
        }
      }
      updateData.image = req.file.path;
    }

    const updatedSection = await Home.findOneAndUpdate(
      { section: req.params.section },
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Home section updated successfully',
      data: updatedSection
    });
  } catch (error) {
    console.error('Update home section error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating home section'
    });
  }
};

// @desc    Delete home section
// @route   DELETE /api/home/:section
// @access  Private
const deleteHomeSection = async (req, res) => {
  try {
    const section = await Home.findOne({ section: req.params.section });
    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Home section not found'
      });
    }

    // Delete image from Cloudinary
    if (section.image) {
      try {
        const publicId = extractPublicId(section.image);
        await deleteImage(publicId);
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }

    await Home.findOneAndDelete({ section: req.params.section });

    res.json({
      success: true,
      message: 'Home section deleted successfully'
    });
  } catch (error) {
    console.error('Delete home section error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting home section'
    });
  }
};

module.exports = {
  getHomeSections,
  getHomeSection,
  createHomeSection,
  updateHomeSection,
  deleteHomeSection
};