const express = require('express');
const { body } = require('express-validator');
const { authMiddleware, checkPermission } = require('../middlewares/authMiddleware');
const { upload } = require('../config/cloudinary');
const {
  getHomeSections,
  getHomeSection,
  createHomeSection,
  updateHomeSection,
  deleteHomeSection
} = require('../controllers/homeController');

const router = express.Router();

// Validation rules
const homeSectionValidation = [
  body('section')
    .isIn(['hero', 'about', 'vision', 'mission', 'stats', 'testimonials', 'announcements'])
    .withMessage('Invalid section type'),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required')
];

// Public routes
router.get('/', getHomeSections);
router.get('/:section', getHomeSection);

// Protected routes
router.post('/', 
  authMiddleware, 
  checkPermission('home'),
  upload.single('image'),
  homeSectionValidation,
  createHomeSection
);

router.put('/:section', 
  authMiddleware, 
  checkPermission('home'),
  upload.single('image'),
  homeSectionValidation,
  updateHomeSection
);

router.delete('/:section', 
  authMiddleware, 
  checkPermission('home'),
  deleteHomeSection
);

module.exports = router;