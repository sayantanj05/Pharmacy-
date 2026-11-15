const mongoose = require('mongoose');

const expiryLogSchema = new mongoose.Schema(
  {
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    medicineName: { type: String },
    imageUrl: { type: String },
    batchNumber: { type: String },
    quantity: { type: Number, default: 0 },
    quantityExpired: { type: Number, default: 0 },
    expiryDate: { type: Date },
    replacementRequested: { type: Boolean, default: false },
    replacementDate: { type: Date },
    status: {
      type: String,
      enum: ['pending', 'requested', 'replaced', 'disposed'],
      default: 'pending',
    },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ExpiryLog', expiryLogSchema);