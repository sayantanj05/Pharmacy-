const mongoose = require('mongoose');

const vendorPaymentSchema = new mongoose.Schema(
  {
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    supplyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supply' },
    amount: { type: Number, required: true },
    method: { type: String, enum: ['cash', 'bank_transfer', 'cheque', 'upi'], required: true },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    transactionId: { type: String },
    paidAt: { type: Date },
    dueDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('VendorPayment', vendorPaymentSchema);
