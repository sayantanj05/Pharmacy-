const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect, authorize, shopScope } = require('../middleware/auth');

router.get('/financial', protect, shopScope, authorize('shop_owner', 'super_admin'), reportController.getFinancialReport);
router.get('/financial/pdf', protect, shopScope, authorize('shop_owner', 'super_admin'), reportController.getFinancialPDF);

module.exports = router;