const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');

router.get('/', medicineController.getMedicines);
router.get('/shops', medicineController.getShops);
router.get('/:id/availability', medicineController.getAvailability);
router.get('/:id', medicineController.getMedicine);

module.exports = router;