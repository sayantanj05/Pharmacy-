const mongoose = require('mongoose');

const supplyItemSchema = new mongoose.Schema(
  {
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, default: 0 },
  },
  { _id: false }
);

const supplySchema = new mongoose.Schema(
  {
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    codeNumber: { type: String },
    invoiceNumber: { type: String },
    batchNumber: { type: String },
    expiryDate: { type: Date },
    supplyDate: { type: Date, default: Date.now },
    items: [supplyItemSchema],
    totalAmount: { type: Number, default: 0 },
    notes: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Supply', supplySchema);