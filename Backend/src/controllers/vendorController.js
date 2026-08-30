const Vendor = require('../models/Vendor');
const { sendResponse } = require('../utils/response');

exports.getVendors = async (req, res, next) => {
  try {
    let filter = {};
    if (req.user.role === 'shop_owner') {
      filter.shopId = req.user.shopId;
    }
    const { shopId } = req.query;
    if (shopId && req.user.role === 'super_admin') {
      filter.shopId = shopId;
    }
    const vendors = await Vendor.find(filter);
    sendResponse(res, 200, true, 'Vendors fetched', { vendors });
  } catch (error) {
    next(error);
  }
};

exports.getVendor = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      res.status(404);
      throw new Error('Vendor not found');
    }
    sendResponse(res, 200, true, 'Vendor fetched', { vendor });
  } catch (error) {
    next(error);
  }
};

exports.createVendor = async (req, res, next) => {
  try {
    const vendorData = { ...req.body };
    if (req.user.role === 'shop_owner') {
      vendorData.shopId = req.user.shopId;
    }
    const vendor = await Vendor.create(vendorData);
    sendResponse(res, 201, true, 'Vendor created', { vendor });
  } catch (error) {
    next(error);
  }
};

exports.updateVendor = async (req, res, next) => {
  try {
    let filter = { _id: req.params.id };
    if (req.user.role === 'shop_owner') {
      filter.shopId = req.user.shopId;
    }
    const vendor = await Vendor.findOneAndUpdate(filter, req.body, { new: true });
    if (!vendor) {
      res.status(404);
      throw new Error('Vendor not found');
    }
    sendResponse(res, 200, true, 'Vendor updated', { vendor });
  } catch (error) {
    next(error);
  }
};

exports.deleteVendor = async (req, res, next) => {
  try {
    let filter = { _id: req.params.id };
    if (req.user.role === 'shop_owner') {
      filter.shopId = req.user.shopId;
    }
    const vendor = await Vendor.findOneAndDelete(filter);
    if (!vendor) {
      res.status(404);
      throw new Error('Vendor not found');
    }
    sendResponse(res, 200, true, 'Vendor deleted');
  } catch (error) {
    next(error);
  }
};
