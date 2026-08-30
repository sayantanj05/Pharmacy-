const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', medicineController.getMedicines);
router.get('/:id', medicineController.getMedicine);
router.get('/suggestions/code-numbers', protect, authorize('shop_owner'), medicineController.getCodeNumberSuggestions);
router.post('/', protect, authorize('shop_owner', 'super_admin'), medicineController.createMedicine);
router.put('/:id', protect, authorize('shop_owner', 'super_admin'), medicineController.updateMedicine);
router.delete('/:id', protect, authorize('shop_owner', 'super_admin'), medicineController.deleteMedicine);

module.exports = router;
