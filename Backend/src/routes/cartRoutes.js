const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.get('/', protect, cartController.getCart);
router.post('/', protect, cartController.addToCart);
router.put('/:id', protect, cartController.updateCartItem);
router.delete('/:id', protect, cartController.deleteCartItem);

module.exports = router;
