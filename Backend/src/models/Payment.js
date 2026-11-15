const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, default: 'cash' },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentDate: { type: Date, default: Date.now },
    transactionId: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);