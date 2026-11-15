const Shop = require('../models/Shop');
const { sendResponse } = require('../utils/response');

exports.createShop = async (req, res, next) => {
  try {
    const shop = await Shop.create(req.body);
    sendResponse(res, 201, true, 'Shop created', { shop });
  } catch (error) {
    next(error);
  }
};

exports.getShops = async (req, res, next) => {
  try {
    const shops = await Shop.find({ isActive: true });
    sendResponse(res, 200, true, 'Shops fetched', { shops });
  } catch (error) {
    next(error);
  }
};

exports.getShop = async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) {
      res.status(404);
      throw new Error('Shop not found');
    }
    sendResponse(res, 200, true, 'Shop fetched', { shop });
  } catch (error) {
    next(error);
  }
};

exports.updateShop = async (req, res, next) => {
  try {
    let filter = { _id: req.params.id };
    if (req.user.role === 'shop_owner') {
      if (!req.shopId) {
        res.status(400);
        throw new Error('Your account is not linked to a valid shop');
      }
      filter = { _id: req.shopId };
    }
    const shop = await Shop.findOneAndUpdate(filter, req.body, { new: true });
    if (!shop) {
      res.status(404);
      throw new Error('Shop not found');
    }
    sendResponse(res, 200, true, 'Shop updated', { shop });
  } catch (error) {
    next(error);
  }
};

exports.deleteShop = async (req, res, next) => {
  try {
    const shop = await Shop.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!shop) {
      res.status(404);
      throw new Error('Shop deleted');
    }
    sendResponse(res, 200, true, 'Shop deleted');
  } catch (error) {
    next(error);
  }
};

exports.getCurrentShop = async (req, res, next) => {
  try {
    // `req.shopId` is already resolved to the Shop ObjectId by the shopScope middleware.
    const shop = req.shopId
      ? await Shop.findById(req.shopId)
      : await Shop.findOne({ shopId: String(req.user.shopId || '') });

    if (!shop) {
      res.status(404);
      throw new Error('Shop not found');
    }
    sendResponse(res, 200, true, 'Current shop fetched', { shop });
  } catch (error) {
    next(error);
  }
};