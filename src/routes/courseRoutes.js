const express = require('express');
const { body } = require('express-validator');
const { authMiddleware, checkPermission } = require('../middlewares/authMiddleware');
const { upload } = require('../config/cloudinary');
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse
} = require('../controllers/courseController');

const router = express.Router();

// Validation rules
const courseValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description must be between 1 and 1000 characters'),
  body('shortDescription')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Short description must be between 1 and 200 characters'),
  body('duration')
    .trim()
    .notEmpty()
    .withMessage('Duration is required'),
  body('level')
    .isIn(['Beginner', 'Intermediate', 'Advanced'])
    .withMessage('Level must be Beginner, Intermediate, or Advanced'),
  body('category')
    .isIn(['Academic', 'Competitive', 'Skill Development', 'Language', 'Other'])
    .withMessage('Invalid category'),
  body('price')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number')
];

// Public routes
router.get('/', getCourses);
router.get('/:id', getCourse);

// Protected routes
router.post('/', 
  authMiddleware, 
  checkPermission('courses'),
  upload.single('image'),
  courseValidation,
  createCourse
);

router.put('/:id', 
  authMiddleware, 
  checkPermission('courses'),
  upload.single('image'),
  courseValidation,
  updateCourse
);

router.delete('/:id', 
  authMiddleware, 
  checkPermission('courses'),
  deleteCourse
);

module.exports = router;