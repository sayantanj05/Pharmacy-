const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('super_admin'), shopController.createShop);
router.get('/', shopController.getShops);
router.get('/current', protect, shopController.getCurrentShop);
router.get('/:id', shopController.getShop);
router.put('/:id', protect, authorize('super_admin'), shopController.updateShop);
router.delete('/:id', protect, authorize('super_admin'), shopController.deleteShop);

module.exports = router;
