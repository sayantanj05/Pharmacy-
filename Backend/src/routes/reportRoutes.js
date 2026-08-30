const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.get('/financial', protect, reportController.getFinancialReport);
router.get('/financial/pdf', protect, reportController.getFinancialPDF);

module.exports = router;
