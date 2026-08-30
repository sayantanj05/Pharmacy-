const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('shop_owner', 'super_admin'), vendorController.getVendors);
router.post('/', protect, authorize('shop_owner', 'super_admin'), vendorController.createVendor);
router.get('/:id', protect, authorize('shop_owner', 'super_admin'), vendorController.getVendor);
router.put('/:id', protect, authorize('shop_owner', 'super_admin'), vendorController.updateVendor);
router.delete('/:id', protect, authorize('shop_owner', 'super_admin'), vendorController.deleteVendor);

module.exports = router;
