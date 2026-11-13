const express = require('express');
const router = express.Router();
const expiryController = require('../controllers/expiryController');
const { protect } = require('../middleware/auth');

router.get('/', protect, expiryController.getExpiryLogs);
router.post('/:id/replacement', protect, expiryController.createReplacement);

module.exports = router;
