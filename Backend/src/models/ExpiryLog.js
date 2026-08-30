const mongoose = require('mongoose');

const expiryLogSchema = new mongoose.Schema(
  {
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    batchNumber: { type: String },
    expiryDate: { type: Date, required: true },
    quantity: { type: Number, required: true },
    status: { type: String, enum: ['expired', 'near_expiry', 'replaced', 'disposed'], default: 'expired' },
    replacementMedicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
    disposedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ExpiryLog', expiryLogSchema);
