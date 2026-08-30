const express = require('express');
const router = express.Router();
const systemController = require('../controllers/systemController');
const { protect, authorize } = require('../middleware/auth');

router.get('/analytics', protect, authorize('super_admin'), systemController.getAnalytics);
router.put('/settings', protect, authorize('super_admin'), systemController.updateSettings);

module.exports = router;
