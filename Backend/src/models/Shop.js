const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema(
  {
    shopId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    phone: { type: String },
    email: { type: String },
    licenseNumber: { type: String, required: true, unique: true },
    gstNumber: { type: String },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Shop', shopSchema);
