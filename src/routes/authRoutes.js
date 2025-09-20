const express = require('express');
const { body } = require('express-validator');
const { authMiddleware } = require('../middlewares/authMiddleware');
const {
  loginAdmin,
  verifyToken,
  changePassword
} = require('../controllers/authController');

const router = express.Router();

// @route   POST /api/auth/login
// @desc    Login admin
// @access  Public
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
], loginAdmin);

// @route   GET /api/auth/verify
// @desc    Verify token
// @access  Private
router.get('/verify', authMiddleware, verifyToken);

// @route   PUT /api/auth/change-password
// @desc    Change password
// @access  Private
router.put('/change-password', [
  authMiddleware,
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
], changePassword);

module.exports = router;