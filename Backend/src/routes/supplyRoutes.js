const express = require('express');
const router = express.Router();
const supplyController = require('../controllers/supplyController');
const { protect, authorize, shopScope } = require('../middleware/auth');

router.use(protect, shopScope, authorize('shop_owner', 'super_admin'));

router.get('/', supplyController.getSupplies);
router.get('/:id', supplyController.getSupply);
router.get('/:id/pdf', supplyController.getSupplyPDF);
router.post('/', supplyController.createSupply);
router.put('/:id', supplyController.updateSupply);
router.delete('/:id', supplyController.deleteSupply);

module.exports = router;