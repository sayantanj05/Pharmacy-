const mongoose = require('mongoose');

const vendorPaymentSchema = new mongoose.Schema(
  {
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    amount: { type: Number, required: true },
    paymentDate: { type: Date, default: Date.now },
    paymentMethod: { type: String, default: 'cash' },
    reference: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('VendorPayment', vendorPaymentSchema);