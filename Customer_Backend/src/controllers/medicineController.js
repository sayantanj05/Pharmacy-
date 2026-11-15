const Medicine = require('../models/Medicine');
const Shop = require('../models/Shop');
const { sendResponse } = require('../utils/response');

exports.getMedicines = async (req, res, next) => {
  try {
    const { shopId, search, category, medicineSystem, medicineType, inStock } = req.query;
    const filter = { isActive: true };

    if (shopId) {
      filter.shopId = shopId;
    } else {
      // Only shop-assigned stock can actually be ordered, so hide orphaned rows
      // (medicines created before shop scoping existed) from the storefront.
      filter.shopId = { $ne: null };
    }
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

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

exports.getAvailability = async (req, res, next) => {
  try {
    const medicine = await Medicine.findById(req.params.id).populate('shopId', 'name address phone');
    if (!medicine) {
      res.status(404);
      throw new Error('Medicine not found');
    }

    const filter = {
      _id: { $ne: medicine._id },
      isActive: true,
      stock: { $gt: 0 },
    };

    if (medicine.genericName || medicine.name) {
      const term = escapeRegex(medicine.genericName || medicine.name);
      filter.$or = [
        { name: { $regex: term, $options: 'i' } },
        { genericName: { $regex: term, $options: 'i' } },
      ];
    } else {
      filter.medicineType = medicine.medicineType;
      filter.medicineSystem = medicine.medicineSystem;
    }

    const matches = await Medicine.find(filter)
      .populate('shopId', 'name address phone')
      .limit(20);

    const shops = matches.map((item) => ({
      medicineId: item._id,
      name: item.name,
      price: item.price,
      stock: item.stock,
      medicineType: item.medicineType,
      medicineSystem: item.medicineSystem,
      shop: item.shopId,
    }));

    sendResponse(res, 200, true, 'Availability fetched', {
      medicine,
      shops,
      message:
        shops.length === 0
          ? `No other shop currently has ${medicine.name} in stock.`
          : undefined,
    });
  } catch (error) {
    next(error);
  }
};