const express = require('express');
const { body } = require('express-validator');
const { authMiddleware, checkPermission } = require('../middlewares/authMiddleware');
const { upload } = require('../config/cloudinary');
const {
  getToppers,
  getTopper,
  createTopper,
  updateTopper,
  deleteTopper
} = require('../controllers/topperController');

const router = express.Router();

// Validation rules
const topperValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Name must be between 1 and 50 characters'),
  body('achievement')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Achievement must be between 1 and 200 characters'),
  body('exam')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Exam name must be between 1 and 100 characters'),
  body('year')
    .isInt({ min: 2000, max: new Date().getFullYear() + 1 })
    .withMessage('Year must be a valid year'),
  body('score')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Score must be between 1 and 50 characters'),
  body('course')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Course must be between 1 and 100 characters')
];

// Public routes
router.get('/', getToppers);
router.get('/:id', getTopper);

// Protected routes
router.post('/', 
  authMiddleware, 
  checkPermission('toppers'),
  upload.single('photo'),
  topperValidation,
  createTopper
);

router.put('/:id', 
  authMiddleware, 
  checkPermission('toppers'),
  upload.single('photo'),
  topperValidation,
  updateTopper
);

router.delete('/:id', 
  authMiddleware, 
  checkPermission('toppers'),
  deleteTopper
);

module.exports = router;