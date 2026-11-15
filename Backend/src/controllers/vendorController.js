const Vendor = require('../models/Vendor');
const { sendResponse } = require('../utils/response');
const { resolveShopFilter } = require('../utils/shopScope');

const ownerShopId = (req) => (req.user.role === 'shop_owner' ? req.shopId || null : null);

exports.getVendors = async (req, res, next) => {
  try {
    const filter = {};

    if (req.user.role === 'shop_owner') {
      if (!req.shopId) {
        sendResponse(res, 200, true, 'Vendors fetched', { vendors: [] });
        return;
      }
      filter.shopId = req.shopId;
    } else if (req.user.role === 'super_admin') {
      const requested = req.query.shopId || req.shopFilter;
      if (requested) filter.shopId = await resolveShopFilter(requested);
    }

    const vendors = await Vendor.find(filter).sort({ createdAt: -1 });
    sendResponse(res, 200, true, 'Vendors fetched', { vendors });
  } catch (error) {
    next(error);
  }
};

exports.getVendor = async (req, res, next) => {
  try {
    const filter = { _id: req.params.id };
    const shopId = ownerShopId(req);
    if (shopId) filter.shopId = shopId;

    const vendor = await Vendor.findOne(filter);
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
      if (!req.shopId) {
        res.status(400);
        throw new Error('Your account is not linked to a valid shop');
      }
      vendorData.shopId = req.shopId;
    } else if (req.shopFilter) {
      vendorData.shopId = req.shopFilter;
    }

    const vendor = await Vendor.create(vendorData);
    sendResponse(res, 201, true, 'Vendor created', { vendor });
  } catch (error) {
    next(error);
  }
};

exports.updateVendor = async (req, res, next) => {
  try {
    const filter = { _id: req.params.id };
    const shopId = ownerShopId(req);
    if (shopId) filter.shopId = shopId;

    const updates = { ...req.body };
    delete updates.shopId;

    const vendor = await Vendor.findOneAndUpdate(filter, updates, { new: true });
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
    const filter = { _id: req.params.id };
    const shopId = ownerShopId(req);
    if (shopId) filter.shopId = shopId;

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