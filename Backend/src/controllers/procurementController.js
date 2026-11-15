const ProcurementOrder = require('../models/ProcurementOrder');
const Medicine = require('../models/Medicine');
const ExpiryLog = require('../models/ExpiryLog');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendResponse } = require('../utils/response');
const { resolveShopId } = require('../utils/shopScope');

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const toDateOrNull = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const notify = async (userIds, payload) => {
  const ids = (userIds || []).filter(Boolean);
  if (ids.length === 0) return;
  await Notification.insertMany(ids.map((userId) => ({ userId, ...payload })));
};

exports.createProcurement = async (req, res, next) => {
  try {
    const { items, notes } = req.body;

    if (!req.user.shopId) {
      res.status(400);
      throw new Error('Your account is not linked to a shop');
    }

    const shopObjectId = await resolveShopId(req.user.shopId);
    if (!shopObjectId) {
      res.status(400);
      throw new Error('Shop not found for your account');
    }

    if (!items || items.length === 0) {
      res.status(400);
      throw new Error('At least one item is required');
    }

    const normalized = items.map((item) => ({
      name: String(item.name || '').trim(),
      medicineType: item.medicineType || 'Tablet',
      medicineSystem: item.medicineSystem || 'Allopathy',
      manufacturer: item.manufacturer || '',
      quantity: Number(item.quantity),
      price: Number(item.price),
      batchNumber: item.batchNumber ? String(item.batchNumber).trim() : '',
      expiryDate: toDateOrNull(item.expiryDate),
    }));

    for (const item of normalized) {
      if (!item.name) {
        res.status(400);
        throw new Error('Every item needs a medicine name');
      }
      if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
        res.status(400);
        throw new Error(`Invalid quantity for ${item.name}`);
      }
      if (!Number.isFinite(item.price) || item.price < 0) {
        res.status(400);
        throw new Error(`Invalid price for ${item.name}`);
      }
    }

    const totalAmount = normalized.reduce((sum, item) => sum + item.quantity * item.price, 0);

    const procurement = await ProcurementOrder.create({
      shopId: shopObjectId,
      requestedBy: req.user._id,
      items: normalized,
      totalAmount,
      notes,
    });

    const admins = await User.find({ role: 'super_admin' }).select('_id');
    await notify(
      admins.map((admin) => admin._id),
      {
        title: 'New procurement request',
        message: `${req.user.name} requested ${normalized.length} medicine item(s).`,
        type: 'system',
        relatedId: procurement._id,
        relatedModel: 'ProcurementOrder',
      }
    );

    sendResponse(res, 201, true, 'Procurement request submitted', { procurement });
  } catch (error) {
    next(error);
  }
};

exports.getProcurements = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role === 'shop_owner') {
      filter.shopId = await resolveShopId(req.user.shopId);
      if (!filter.shopId) {
        sendResponse(res, 200, true, 'Procurement requests fetched', { procurements: [] });
        return;
      }
    } else if (req.query.shopId) {
      filter.shopId = await resolveShopId(req.query.shopId);
    }
    if (req.query.status) filter.status = req.query.status;

    const procurements = await ProcurementOrder.find(filter)
      .populate('shopId', 'name shopId address')
      .populate('requestedBy', 'name email')
      .sort({ createdAt: -1 });

    sendResponse(res, 200, true, 'Procurement requests fetched', { procurements });
  } catch (error) {
    next(error);
  }
};

exports.getProcurement = async (req, res, next) => {
  try {
    const filter = { _id: req.params.id };
    if (req.user.role === 'shop_owner') {
      filter.shopId = await resolveShopId(req.user.shopId);
      if (!filter.shopId) {
        res.status(404);
        throw new Error('Procurement request not found');
      }
    }

    const procurement = await ProcurementOrder.findOne(filter)
      .populate('shopId', 'name shopId address')
      .populate('requestedBy', 'name email');

    if (!procurement) {
      res.status(404);
      throw new Error('Procurement request not found');
    }

    sendResponse(res, 200, true, 'Procurement request fetched', { procurement });
  } catch (error) {
    next(error);
  }
};

/**
 * Applies a fulfilled request to the shop's stock.
 *
 * Existing medicines are topped up (stock += quantity, price refreshed, expiry extended when
 * the request carries one). New medicines are created under the requesting shop so they show
 * up immediately in the owner portal's medicines, dashboard and expiry views.
 */
const applyFulfilment = async (procurement) => {
  for (const item of procurement.items) {
    const existing = await Medicine.findOne({
      shopId: procurement.shopId,
      name: { $regex: `^${escapeRegex(item.name)}$`, $options: 'i' },
    });

    // Procurement items carry no image, so reuse the picture already on file for the
    // same medicine name. Without this every newly stocked item renders imageless
    // in the customer storefront.
    let imageUrl = item.imageUrl || '';
    if (!imageUrl) {
      const catalogueMatch = await Medicine.findOne({
        name: { $regex: `^${escapeRegex(item.name)}$`, $options: 'i' },
        imageUrl: { $exists: true, $nin: ['', null] },
      })
        .select('imageUrl')
        .lean();
      imageUrl = catalogueMatch?.imageUrl || '';
    }

    if (existing) {
      existing.stock = Number(existing.stock || 0) + item.quantity;
      existing.price = item.price;
      if (item.batchNumber) existing.batchNumber = item.batchNumber;
      if (item.expiryDate) existing.expiryDate = item.expiryDate;
      if (imageUrl && !existing.imageUrl) existing.imageUrl = imageUrl;
      existing.isActive = true;
      await existing.save();
      await syncExpiryLog(existing);
    } else {
      const created = await Medicine.create({
        name: item.name,
        codeNumber: `PROC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        shopId: procurement.shopId,
        medicineType: item.medicineType,
        medicineSystem: item.medicineSystem,
        manufacturer: item.manufacturer,
        batchNumber: item.batchNumber || '',
        expiryDate: item.expiryDate || undefined,
        quantityUnit: 'Units',
        price: item.price,
        stock: item.quantity,
        imageUrl,
      });
      await syncExpiryLog(created);
    }
  }
};

const syncExpiryLog = async (medicine) => {
  if (!medicine.expiryDate) return;

  const existing = await ExpiryLog.findOne({ medicineId: medicine._id });
  if (existing) {
    existing.quantity = medicine.stock || 0;
    existing.quantityExpired = medicine.stock || 0;
    existing.expiryDate = medicine.expiryDate;
    existing.batchNumber = medicine.batchNumber || existing.batchNumber;
    existing.shopId = medicine.shopId;
    await existing.save();
    return;
  }

  await ExpiryLog.create({
    medicineId: medicine._id,
    shopId: medicine.shopId,
    medicineName: medicine.name,
    imageUrl: medicine.imageUrl,
    batchNumber: medicine.batchNumber || '',
    quantity: medicine.stock || 0,
    quantityExpired: medicine.stock || 0,
    expiryDate: medicine.expiryDate,
    status: 'pending',
  });
};

exports.updateProcurementStatus = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;
    const allowed = ['approved', 'rejected', 'fulfilled'];
    if (!allowed.includes(status)) {
      res.status(400);
      throw new Error(`Status must be one of ${allowed.join(', ')}`);
    }

    const procurement = await ProcurementOrder.findById(req.params.id);
    if (!procurement) {
      res.status(404);
      throw new Error('Procurement request not found');
    }
    if (['fulfilled', 'cancelled'].includes(procurement.status)) {
      res.status(400);
      throw new Error(`Request is already ${procurement.status}`);
    }

    procurement.status = status;
    procurement.approvedBy = req.user._id;
    procurement.approvedAt = new Date();
    procurement.rejectionReason = rejectionReason || '';

    if (status === 'fulfilled') {
      await applyFulfilment(procurement);
      procurement.fulfilledAt = new Date();
    }

    await procurement.save();

    await Notification.create({
      userId: procurement.requestedBy,
      title: `Procurement ${status}`,
      message: `Your request for ${procurement.items.length} item(s) was ${status}.`,
      type: 'system',
      relatedId: procurement._id,
      relatedModel: 'ProcurementOrder',
    });

    sendResponse(res, 200, true, `Procurement ${status}`, { procurement });
  } catch (error) {
    next(error);
  }
};

exports.cancelProcurement = async (req, res, next) => {
  try {
    const shopObjectId = await resolveShopId(req.user.shopId);
    const procurement = await ProcurementOrder.findOne({
      _id: req.params.id,
      shopId: shopObjectId,
    });

    if (!procurement) {
      res.status(404);
      throw new Error('Procurement request not found');
    }
    if (procurement.status !== 'pending') {
      res.status(400);
      throw new Error('Only pending requests can be cancelled');
    }

    procurement.status = 'cancelled';
    await procurement.save();

    sendResponse(res, 200, true, 'Procurement request cancelled', { procurement });
  } catch (error) {
    next(error);
  }
};