const express = require('express');
const router = express.Router();
const procurementController = require('../controllers/procurementController');
const { protect, authorize, shopScope } = require('../middleware/auth');

router.use(protect, shopScope);

router.post('/', authorize('shop_owner'), procurementController.createProcurement);
router.get('/', authorize('shop_owner', 'super_admin'), procurementController.getProcurements);
router.get('/:id', authorize('shop_owner', 'super_admin'), procurementController.getProcurement);
router.put('/:id/status', authorize('super_admin'), procurementController.updateProcurementStatus);
router.post('/:id/cancel', authorize('shop_owner'), procurementController.cancelProcurement);

module.exports = router;