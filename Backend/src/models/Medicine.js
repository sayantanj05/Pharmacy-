const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    codeNumber: { type: String, required: true, unique: true },
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
    category: { type: String },
    medicineType: { type: String, enum: ['Tablet', 'Capsule', 'Syrup', 'Suspension', 'Sachet', 'Cream'], required: true },
    quantityUnit: { type: String, required: true },
    medicineSystem: { type: String, enum: ['Allopathy', 'Homeopathy', 'Ayurvedic'], required: true },
    manufacturer: { type: String },
    batchNumber: { type: String },
    manufactureDate: { type: Date },
    expiryDate: { type: Date },
    price: { type: Number, required: true },
    discountPrice: { type: Number },
    stock: { type: Number, default: 0 },
    minStockLevel: { type: Number, default: 10 },
    description: { type: String },
    imageUrl: { type: String },
    prescriptionRequired: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Medicine', medicineSchema);
