const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String, required: true },
    address: { type: String },
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    licenseNumber: { type: String },
    gstNumber: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vendor', vendorSchema);
