const express = require('express');
const { body } = require('express-validator');
const { authMiddleware, checkPermission } = require('../middlewares/authMiddleware');
const {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  getContactStats
} = require('../controllers/contactController');

const router = express.Router();

// Validation rules for contact form
const contactValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Name must be between 1 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .matches(/^[0-9]{10}$/)
    .withMessage('Please provide a valid 10-digit phone number'),
  body('subject')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Subject must be between 1 and 100 characters'),
  body('message')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters')
];

// Public routes
router.post('/', contactValidation, createContact);

// Protected routes
router.get('/', authMiddleware, checkPermission('contacts'), getContacts);
router.get('/stats', authMiddleware, checkPermission('contacts'), getContactStats);
router.get('/:id', authMiddleware, checkPermission('contacts'), getContact);
router.put('/:id', authMiddleware, checkPermission('contacts'), updateContact);
router.delete('/:id', authMiddleware, checkPermission('contacts'), deleteContact);

module.exports = router;