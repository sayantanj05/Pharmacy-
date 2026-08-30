const mongoose = require('mongoose');

const supplySchema = new mongoose.Schema(
  {
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    date: { type: Date, default: Date.now },
    items: [
      {
        medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
        medicineName: { type: String },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        totalPrice: { type: Number, required: true },
        batchNumber: { type: String },
        expiryDate: { type: Date },
      },
    ],
    totalAmount: { type: Number, required: true },
    notes: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Supply', supplySchema);
