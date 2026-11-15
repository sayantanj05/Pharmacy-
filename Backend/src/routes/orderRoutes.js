const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, shopScope } = require('../middleware/auth');

router.use(protect, shopScope);

router.post('/', orderController.createOrder);
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrder);
router.put('/:id', orderController.updateOrderStatus);
router.post('/:id/cancel', orderController.cancelOrder);

module.exports = router;