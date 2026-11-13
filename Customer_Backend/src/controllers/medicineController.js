const Medicine = require('../models/Medicine');
const Shop = require('../models/Shop');
const { sendResponse } = require('../utils/response');

exports.getMedicines = async (req, res, next) => {
  try {
    const { search, category, medicineSystem, medicineType, inStock } = req.query;
    const filter = { isActive: true };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { codeNumber: { $regex: search, $options: 'i' } },
        { genericName: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) filter.category = category;
    if (medicineSystem) filter.medicineSystem = medicineSystem;
    if (medicineType) filter.medicineType = medicineType;
    if (inStock === 'true') filter.stock = { $gt: 0 };

    const medicines = await Medicine.find(filter).populate('shopId', 'name address phone');
    sendResponse(res, 200, true, 'Medicines fetched', { medicines });
  } catch (error) {
    next(error);
  }
};

exports.getMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findById(req.params.id).populate('shopId', 'name address phone');
    if (!medicine) {
      res.status(404);
      throw new Error('Medicine not found');
    }
    sendResponse(res, 200, true, 'Medicine fetched', { medicine });
  } catch (error) {
    next(error);
  }
};

exports.getShops = async (req, res, next) => {
  try {
    const shops = await Shop.find({ isActive: true }).select('name address phone email');
    sendResponse(res, 200, true, 'Shops fetched', { shops });
  } catch (error) {
    next(error);
  }
};