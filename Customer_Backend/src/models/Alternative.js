const mongoose = require('mongoose');

const alternativeSchema = new mongoose.Schema(
  {
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
    alternativeMedicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
    reason: { type: String },
    source: { type: String, default: 'Aura DB' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Alternative', alternativeSchema);