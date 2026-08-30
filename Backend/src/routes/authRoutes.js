const express = require('express');
const router = express.Router();
const { body } = require('../middleware/validation');
const authController = require('../controllers/authController');
const { validate } = require('../middleware/validation');

router.post('/register', [body('name').notEmpty(), body('email').isEmail(), body('password').isLength({ min: 6 })], validate, authController.register);
router.post('/login', [body('email').isEmail(), body('password').notEmpty()], validate, authController.login);
router.get('/profile', require('../middleware/auth').protect, authController.getProfile);
router.put('/profile', require('../middleware/auth').protect, authController.updateProfile);

module.exports = router;
