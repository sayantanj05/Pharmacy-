const Medicine = require('../models/Medicine');
const { sendResponse } = require('../utils/response');
const { resolveShopFilter } = require('../utils/shopScope');

/**
 * Builds the shop filter for a request.
 *
 * - shop_owner / customer: always scoped to their own shop (`req.shopId`, an ObjectId).
 * - super_admin: honours an explicit `?shopId=` (ObjectId or shop key) when provided.
 */
const buildShopFilter = async (req) => {
  if (req.user && req.user.role === 'super_admin') {
    return req.shopFilter ? { shopId: req.shopFilter } : {};
  }
  if (req.shopId) return { shopId: req.shopId };
  if (req.query && req.query.shopId) {
    const resolved = await resolveShopFilter(req.query.shopId);
    if (resolved) return { shopId: resolved };
  }
  return {};
};

exports.getMedicines = async (req, res, next) => {
  try {
    const { search, category, medicineSystem, medicineType } = req.query;
    const filter = { isActive: true, ...(await buildShopFilter(req)) };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { codeNumber: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) filter.category = category;
    if (medicineSystem) filter.medicineSystem = medicineSystem;
    if (medicineType) filter.medicineType = medicineType;
    const medicines = await Medicine.find(filter);
    sendResponse(res, 200, true, 'Medicines fetched', { medicines });
  } catch (error) {
    next(error);
  }
};

exports.getMedicine = async (req, res, next) => {
  try {
    const filter = { _id: req.params.id };
    if (req.user && req.user.role === 'shop_owner' && req.shopId) {
      filter.shopId = req.shopId;
    } else if (req.user && req.user.role === 'customer' && req.shopId) {
      filter.shopId = req.shopId;
    }
    const medicine = await Medicine.findOne(filter);
    if (!medicine) {
      res.status(404);
      throw new Error('Medicine not found');
    }
    sendResponse(res, 200, true, 'Medicine fetched', { medicine });
  } catch (error) {
    next(error);
  }
};

exports.createMedicine = async (req, res, next) => {
  try {
    const medicineData = { ...req.body };

    // Shop owners always write to their own shop; super admins may target one explicitly.
    if (req.user.role === 'shop_owner') {
      if (!req.shopId) {
        res.status(400);
        throw new Error('Your account is not linked to a valid shop');
      }
      medicineData.shopId = req.shopId;
    } else if (req.shopFilter) {
      medicineData.shopId = req.shopFilter;
    }

    const medicine = await Medicine.create(medicineData);
    sendResponse(res, 201, true, 'Medicine created', { medicine });
  } catch (error) {
    next(error);
  }
};

exports.updateMedicine = async (req, res, next) => {
  try {
    const filter = { _id: req.params.id };
    if (req.user.role === 'shop_owner') {
      if (!req.shopId) {
        res.status(400);
        throw new Error('Your account is not linked to a valid shop');
      }
      filter.shopId = req.shopId;
    } else if (req.shopFilter) {
      filter.shopId = req.shopFilter;
    }

    const updates = { ...req.body };
    delete updates.shopId;

    const medicine = await Medicine.findOneAndUpdate(filter, updates, { new: true });
    if (!medicine) {
      res.status(404);
      throw new Error('Medicine not found');
    }
    sendResponse(res, 200, true, 'Medicine updated', { medicine });
  } catch (error) {
    next(error);
  }
};

exports.deleteMedicine = async (req, res, next) => {
  try {
    const filter = { _id: req.params.id };
    if (req.user.role === 'shop_owner') {
      if (!req.shopId) {
        res.status(400);
        throw new Error('Your account is not linked to a valid shop');
      }
      filter.shopId = req.shopId;
    } else if (req.shopFilter) {
      filter.shopId = req.shopFilter;
    }

    const medicine = await Medicine.findOneAndUpdate(filter, { isActive: false }, { new: true });
    if (!medicine) {
      res.status(404);
      throw new Error('Medicine not found');
    }
    sendResponse(res, 200, true, 'Medicine deleted');
  } catch (error) {
    next(error);
  }
};

exports.getCodeNumberSuggestions = async (req, res, next) => {
  try {
    const filter = req.shopId ? { shopId: req.shopId } : {};
    const medicines = await Medicine.find(filter).distinct('codeNumber');
    sendResponse(res, 200, true, 'Code numbers fetched', { codeNumbers: medicines });
  } catch (error) {
    next(error);
  }
};