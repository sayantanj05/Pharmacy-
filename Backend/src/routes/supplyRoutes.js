const express = require('express');
const router = express.Router();
const supplyController = require('../controllers/supplyController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('shop_owner', 'super_admin'), supplyController.getSupplies);
router.get('/:id/pdf', protect, authorize('shop_owner', 'super_admin'), supplyController.getSupplyPDF);
router.post('/', protect, authorize('shop_owner', 'super_admin'), supplyController.createSupply);
router.get('/:id', protect, authorize('shop_owner', 'super_admin'), supplyController.getSupply);
router.put('/:id', protect, authorize('shop_owner', 'super_admin'), supplyController.updateSupply);
router.delete('/:id', protect, authorize('shop_owner', 'super_admin'), supplyController.deleteSupply);

module.exports = router;
