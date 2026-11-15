const Supply = require('../models/Supply');
const Medicine = require('../models/Medicine');
const { generateSupplyPDF } = require('../utils/pdfGenerator');
const { sendResponse } = require('../utils/response');
const { resolveShopFilter } = require('../utils/shopScope');

const ownerShopId = (req) => {
  if (req.user.role !== 'shop_owner') return null;
  return req.shopId || null;
};

exports.getSupplies = async (req, res, next) => {
  try {
    const filter = {};

    if (req.user.role === 'shop_owner') {
      if (!req.shopId) {
        sendResponse(res, 200, true, 'Supplies fetched', { supplies: [] });
        return;
      }
      filter.shopId = req.shopId;
    } else if (req.user.role === 'super_admin') {
      const requested = req.query.shopId || req.shopFilter;
      if (requested) filter.shopId = await resolveShopFilter(requested);
    }

    const supplies = await Supply.find(filter).populate('vendorId').sort({ createdAt: -1 });
    sendResponse(res, 200, true, 'Supplies fetched', { supplies });
  } catch (error) {
    next(error);
  }
};

exports.getSupply = async (req, res, next) => {
  try {
    const filter = { _id: req.params.id };
    const shopId = ownerShopId(req);
    if (shopId) filter.shopId = shopId;

    const supply = await Supply.findOne(filter).populate('vendorId');
    if (!supply) {
      res.status(404);
      throw new Error('Supply not found');
    }
    sendResponse(res, 200, true, 'Supply fetched', { supply });
  } catch (error) {
    next(error);
  }
};

exports.createSupply = async (req, res, next) => {
  try {
    const supplyData = { ...req.body };

    if (req.user.role === 'shop_owner') {
      if (!req.shopId) {
        res.status(400);
        throw new Error('Your account is not linked to a valid shop');
      }
      supplyData.shopId = req.shopId;
    } else if (req.shopFilter) {
      supplyData.shopId = req.shopFilter;
    }

    const supply = await Supply.create(supplyData);

    if (supply.items && supply.items.length > 0) {
      for (const item of supply.items) {
        if (item.medicineId) {
          await Medicine.findByIdAndUpdate(item.medicineId, { $inc: { stock: item.quantity } });
        }
      }
    }

    sendResponse(res, 201, true, 'Supply created', { supply });
  } catch (error) {
    next(error);
  }
};

exports.updateSupply = async (req, res, next) => {
  try {
    const filter = { _id: req.params.id };
    const shopId = ownerShopId(req);
    if (shopId) filter.shopId = shopId;

    const updates = { ...req.body };
    delete updates.shopId;

    const supply = await Supply.findOneAndUpdate(filter, updates, { new: true });
    if (!supply) {
      res.status(404);
      throw new Error('Supply not found');
    }
    sendResponse(res, 200, true, 'Supply updated', { supply });
  } catch (error) {
    next(error);
  }
};

exports.deleteSupply = async (req, res, next) => {
  try {
    const filter = { _id: req.params.id };
    const shopId = ownerShopId(req);
    if (shopId) filter.shopId = shopId;

    const supply = await Supply.findOneAndDelete(filter);
    if (!supply) {
      res.status(404);
      throw new Error('Supply not found');
    }
    sendResponse(res, 200, true, 'Supply deleted');
  } catch (error) {
    next(error);
  }
};

exports.getSupplyPDF = async (req, res, next) => {
  try {
    const filter = { _id: req.params.id };
    const shopId = ownerShopId(req);
    if (shopId) filter.shopId = shopId;

    const supply = await Supply.findOne(filter);
    if (!supply) {
      res.status(404);
      throw new Error('Supply not found');
    }
    const pdfBuffer = await generateSupplyPDF(supply, supply.items || []);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=supply-${supply._id}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};