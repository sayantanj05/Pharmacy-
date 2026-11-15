const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
    quantity: { type: Number, required: true, min: 1 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CartItem', cartItemSchema);