const Medicine = require('../models/Medicine');
const { sendResponse } = require('../utils/response');

exports.getMedicines = async (req, res, next) => {
  try {
    const { shopId, search, category, medicineSystem, medicineType } = req.query;
    const filter = { isActive: true };
    if (shopId) filter.shopId = shopId;
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
    const medicine = await Medicine.findById(req.params.id);
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
    console.log('Creating medicine with body:', req.body);
    console.log('User role:', req.user.role);
    console.log('User shopId:', req.user.shopId);
    
    // For shop_owners, use their shopId. For super_admins, use shopId from body or leave it null
    const medicineData = { ...req.body };
    if (req.user.role === 'shop_owner' && req.user.shopId) {
      medicineData.shopId = req.user.shopId;
    }
    
    const medicine = await Medicine.create(medicineData);
    console.log('Medicine created successfully:', medicine);
    sendResponse(res, 201, true, 'Medicine created', { medicine });
  } catch (error) {
    console.error('Error creating medicine:', error);
    next(error);
  }
};

exports.updateMedicine = async (req, res, next) => {
  try {
    console.log('Updating medicine:', req.params.id, 'by user:', req.user.role);
    
    let filter = { _id: req.params.id };
    
    // Shop owners can only update medicines from their shop
    if (req.user.role === 'shop_owner' && req.user.shopId) {
      filter.shopId = req.user.shopId;
    }
    
    const medicine = await Medicine.findOneAndUpdate(filter, req.body, { new: true });
    if (!medicine) {
      res.status(404);
      throw new Error('Medicine not found');
    }
    console.log('Medicine updated successfully:', medicine);
    sendResponse(res, 200, true, 'Medicine updated', { medicine });
  } catch (error) {
    console.error('Error updating medicine:', error);
    next(error);
  }
};

exports.deleteMedicine = async (req, res, next) => {
  try {
    console.log('Deleting medicine:', req.params.id, 'by user:', req.user.role);
    
    let filter = { _id: req.params.id };
    
    // Shop owners can only delete medicines from their shop
    if (req.user.role === 'shop_owner' && req.user.shopId) {
      filter.shopId = req.user.shopId;
    }
    
    const medicine = await Medicine.findOneAndUpdate(filter, { isActive: false }, { new: true });
    if (!medicine) {
      res.status(404);
      throw new Error('Medicine not found');
    }
    console.log('Medicine deleted successfully');
    sendResponse(res, 200, true, 'Medicine deleted');
  } catch (error) {
    console.error('Error deleting medicine:', error);
    next(error);
  }
};

exports.getCodeNumberSuggestions = async (req, res, next) => {
  try {
    const medicines = await Medicine.find({ shopId: req.user.shopId }).distinct('codeNumber');
    sendResponse(res, 200, true, 'Code numbers fetched', { codeNumbers: medicines });
  } catch (error) {
    next(error);
  }
};
