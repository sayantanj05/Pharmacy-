const express = require('express');
const router = express.Router();
const systemController = require('../controllers/systemController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('super_admin'));

router.get('/analytics', systemController.getAnalytics);
router.put('/settings', systemController.updateSettings);

module.exports = router;