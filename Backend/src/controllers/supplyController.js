const Supply = require('../models/Supply');
const Medicine = require('../models/Medicine');
const { generateSupplyPDF } = require('../utils/pdfGenerator');
const { sendResponse } = require('../utils/response');

exports.getSupplies = async (req, res, next) => {
  try {
    let filter = {};
    if (req.user.role === 'shop_owner') {
      filter.shopId = req.user.shopId;
    }
    const { shopId } = req.query;
    if (shopId && req.user.role === 'super_admin') {
      filter.shopId = shopId;
    }
    const supplies = await Supply.find(filter).populate('vendorId');
    sendResponse(res, 200, true, 'Supplies fetched', { supplies });
  } catch (error) {
    next(error);
  }
};

exports.getSupply = async (req, res, next) => {
  try {
    const supply = await Supply.findById(req.params.id).populate('vendorId');
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
      supplyData.shopId = req.user.shopId;
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
    let filter = { _id: req.params.id };
    if (req.user.role === 'shop_owner') {
      filter.shopId = req.user.shopId;
    }
    const supply = await Supply.findOneAndUpdate(filter, req.body, { new: true });
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
    let filter = { _id: req.params.id };
    if (req.user.role === 'shop_owner') {
      filter.shopId = req.user.shopId;
    }
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
    const supply = await Supply.findById(req.params.id);
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
