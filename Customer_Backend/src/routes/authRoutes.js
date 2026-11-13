const express = require('express');
const router = express.Router();
const { body, validate } = require('../middleware/validation');
const { protect } = require('../middleware/auth');
const authController = require('../controllers/authController');

router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  authController.register
);

router.post(
  '/login',
  [body('email').isEmail().withMessage('Valid email is required'), body('password').notEmpty().withMessage('Password is required')],
  validate,
  authController.login
);

router.get('/profile', protect, authController.getProfile);
router.put('/profile', protect, authController.updateProfile);

module.exports = router;