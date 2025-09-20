const express = require('express');
const { body } = require('express-validator');
const { authMiddleware, checkPermission } = require('../middlewares/authMiddleware');
const { upload } = require('../config/cloudinary');
const {
  getAchievements,
  getAchievement,
  createAchievement,
  updateAchievement,
  deleteAchievement
} = require('../controllers/achievementController');

const router = express.Router();

// Validation rules
const achievementValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Description must be between 1 and 500 characters'),
  body('date')
    .isISO8601()
    .withMessage('Date must be a valid date'),
  body('category')
    .isIn(['Academic Excellence', 'Student Achievement', 'Institute Recognition', 'Awards', 'Certifications', 'Other'])
    .withMessage('Invalid category')
];

// Public routes
router.get('/', getAchievements);
router.get('/:id', getAchievement);

// Protected routes
router.post('/', 
  authMiddleware, 
  checkPermission('achievements'),
  upload.single('image'),
  achievementValidation,
  createAchievement
);

router.put('/:id', 
  authMiddleware, 
  checkPermission('achievements'),
  upload.single('image'),
  achievementValidation,
  updateAchievement
);

router.delete('/:id', 
  authMiddleware, 
  checkPermission('achievements'),
  deleteAchievement
);

module.exports = router;