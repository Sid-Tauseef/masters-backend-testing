const { validationResult } = require('express-validator');
const Gallery = require('../models/Gallery');
const { deleteImage, extractPublicId } = require('../config/cloudinary');

// @desc    Get all gallery items
// @route   GET /api/gallery
// @access  Public
const getGalleryItems = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      category, 
      featured,
      isActive = true 
    } = req.query;

    const query = { isActive };
    
    if (category) query.category = category;
    if (featured !== undefined) query.featured = featured === 'true';

    const items = await Gallery.find(query)
      .sort({ order: 1, date: -1, featured: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    const total = await Gallery.countDocuments(query);

    res.json({
      success: true,
      data: {
        items,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get gallery items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching gallery items'
    });
  }
};

// @desc    Get single gallery item
// @route   GET /api/gallery/:id
// @access  Public
const getGalleryItem = async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Get gallery item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching gallery item'
    });
  }
};

// @desc    Create gallery item
// @route   POST /api/gallery
// @access  Private
const createGalleryItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const itemData = req.body;
    
    // Parse JSON fields from FormData
    if (itemData.tags && typeof itemData.tags === 'string') {
      try {
        itemData.tags = JSON.parse(itemData.tags);
      } catch (error) {
        itemData.tags = [];
      }
    }
    
    // Handle image upload
    if (req.file) {
      itemData.image = req.file.path;
    }

    const item = await Gallery.create(itemData);

    res.status(201).json({
      success: true,
      message: 'Gallery item created successfully',
      data: item
    });
  } catch (error) {
    console.error('Create gallery item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating gallery item'
    });
  }
};

// @desc    Update gallery item
// @route   PUT /api/gallery/:id
// @access  Private
const updateGalleryItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const item = await Gallery.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    const updateData = req.body;

    // Parse JSON fields from FormData
    if (updateData.tags && typeof updateData.tags === 'string') {
      try {
        updateData.tags = JSON.parse(updateData.tags);
      } catch (error) {
        updateData.tags = [];
      }
    }

    // Handle image upload
    if (req.file) {
      // Delete old image from Cloudinary
      if (item.image) {
        try {
          const publicId = extractPublicId(item.image);
          await deleteImage(publicId);
        } catch (error) {
          console.error('Error deleting old image:', error);
        }
      }
      updateData.image = req.file.path;
    }

    const updatedItem = await Gallery.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Gallery item updated successfully',
      data: updatedItem
    });
  } catch (error) {
    console.error('Update gallery item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating gallery item'
    });
  }
};

// @desc    Delete gallery item
// @route   DELETE /api/gallery/:id
// @access  Private
const deleteGalleryItem = async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    // Delete image from Cloudinary
    if (item.image) {
      try {
        const publicId = extractPublicId(item.image);
        await deleteImage(publicId);
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }

    await Gallery.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Gallery item deleted successfully'
    });
  } catch (error) {
    console.error('Delete gallery item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting gallery item'
    });
  }
};

module.exports = {
  getGalleryItems,
  getGalleryItem,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem
};