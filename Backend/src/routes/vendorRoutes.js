const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const { protect, authorize, shopScope } = require('../middleware/auth');

router.use(protect, shopScope, authorize('shop_owner', 'super_admin'));

router.get('/', vendorController.getVendors);
router.get('/:id', vendorController.getVendor);
router.post('/', vendorController.createVendor);
router.put('/:id', vendorController.updateVendor);
router.delete('/:id', vendorController.deleteVendor);

module.exports = router;