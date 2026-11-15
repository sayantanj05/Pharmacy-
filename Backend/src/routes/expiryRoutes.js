const express = require('express');
const router = express.Router();
const expiryController = require('../controllers/expiryController');
const { protect, shopScope } = require('../middleware/auth');

router.use(protect, shopScope);

router.get('/', expiryController.getExpiryLogs);
router.post('/:id/replacement', expiryController.createReplacement);

module.exports = router;