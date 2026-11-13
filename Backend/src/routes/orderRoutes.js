const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.post('/', protect, orderController.createOrder);
router.get('/', protect, orderController.getOrders);
router.get('/:id', protect, orderController.getOrder);
router.put('/:id', protect, orderController.updateOrderStatus);
router.post('/:id/cancel', protect, orderController.cancelOrder);

module.exports = router;
