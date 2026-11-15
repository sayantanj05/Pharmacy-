const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');
const { protect, authorize, shopScope } = require('../middleware/auth');

router.get('/', protect, shopScope, medicineController.getMedicines);
router.get('/suggestions/code-numbers', protect, shopScope, authorize('shop_owner'), medicineController.getCodeNumberSuggestions);
router.get('/:id', protect, shopScope, medicineController.getMedicine);
router.post('/', protect, shopScope, authorize('shop_owner', 'super_admin'), medicineController.createMedicine);
router.put('/:id', protect, shopScope, authorize('shop_owner', 'super_admin'), medicineController.updateMedicine);
router.delete('/:id', protect, shopScope, authorize('shop_owner', 'super_admin'), medicineController.deleteMedicine);

module.exports = router;