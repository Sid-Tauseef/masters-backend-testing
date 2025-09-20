const express = require('express');
const { body } = require('express-validator');
const { authMiddleware, checkPermission } = require('../middlewares/authMiddleware');
const { upload } = require('../config/cloudinary');
const {
  getGalleryItems,
  getGalleryItem,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem
} = require('../controllers/galleryController');

const router = express.Router();

// Validation rules
const galleryValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('category')
    .isIn(['Events', 'Campus Life', 'Functions', 'Achievements', 'Sports', 'Cultural', 'Academic', 'Other'])
    .withMessage('Invalid category'),
  body('date')
    .isISO8601()
    .withMessage('Date must be a valid date')
];

// Public routes
router.get('/', getGalleryItems);
router.get('/:id', getGalleryItem);

// Protected routes
router.post('/', 
  authMiddleware, 
  checkPermission('gallery'),
  upload.single('image'),
  galleryValidation,
  createGalleryItem
);

router.put('/:id', 
  authMiddleware, 
  checkPermission('gallery'),
  upload.single('image'),
  galleryValidation,
  updateGalleryItem
);

router.delete('/:id', 
  authMiddleware, 
  checkPermission('gallery'),
  deleteGalleryItem
);

module.exports = router;