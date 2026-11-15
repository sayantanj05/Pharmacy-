const mongoose = require('mongoose');

const procurementItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    medicineType: {
      type: String,
      enum: ['Tablet', 'Capsule', 'Syrup', 'Suspension', 'Sachet', 'Cream'],
      default: 'Tablet',
    },
    medicineSystem: {
      type: String,
      enum: ['Allopathy', 'Homeopathy', 'Ayurvedic'],
      default: 'Allopathy',
    },
    manufacturer: { type: String, default: '' },
    batchNumber: { type: String, default: '' },
    expiryDate: { type: Date, default: null },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const procurementOrderSchema = new mongoose.Schema(
  {
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [procurementItemSchema],
    totalAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'fulfilled', 'cancelled'],
      default: 'pending',
    },
    notes: { type: String },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    fulfilledAt: { type: Date },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ProcurementOrder', procurementOrderSchema);