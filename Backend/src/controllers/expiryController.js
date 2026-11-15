const ExpiryLog = require('../models/ExpiryLog');
const Medicine = require('../models/Medicine');
const { sendResponse } = require('../utils/response');
const { resolveShopFilter } = require('../utils/shopScope');

/**
 * Shop owners are always scoped to their own shop ObjectId. Super admins may pass
 * `?shopId=` (ObjectId or shop key).
 */
const resolveShopFilterForRequest = async (req) => {
  if (req.user && req.user.role === 'shop_owner') return req.shopId || null;
  if (req.user && req.user.role === 'customer') return req.shopId || null;
  const raw = req.query.shopId || req.shopFilter;
  if (!raw) return null;
  return resolveShopFilter(raw);
};

exports.getExpiryLogs = async (req, res, next) => {
  try {
    const { status } = req.query;
    const shopId = await resolveShopFilterForRequest(req);

    const filter = {};
    if (status) filter.status = status;
    if (shopId) filter.shopId = shopId;

    const logs = await ExpiryLog.find(filter).populate('medicineId').populate('shopId');

    // Fetch all medicines from MongoDB medicines collection to ensure complete expiry tracking
    const medFilter = {};
    if (shopId) medFilter.shopId = shopId;

    const medicines = await Medicine.find(medFilter);

    // Track existing medicine IDs already present in ExpiryLogs
    const existingMedIds = new Set(
      logs
        .map((l) => (l.medicineId && l.medicineId._id ? l.medicineId._id.toString() : l.medicineId ? l.medicineId.toString() : null))
        .filter(Boolean)
    );

    const combinedLogs = [...logs];

    // For any medicine in medicines collection not explicitly in ExpiryLog, create dynamic log entry
    medicines.forEach((med) => {
      if (!existingMedIds.has(med._id.toString()) && med.expiryDate) {
        combinedLogs.push({
          _id: med._id,
          medicineId: med,
          medicineName: med.name,
          imageUrl: med.imageUrl,
          shopId: med.shopId,
          batchNumber: med.batchNumber || '',
          expiryDate: med.expiryDate,
          quantity: med.stock || 0,
          quantityExpired: med.stock || 0,
          status: 'pending',
          createdAt: med.createdAt,
        });
      }
    });

    sendResponse(res, 200, true, 'Expiry logs fetched', { logs: combinedLogs, expiryLogs: combinedLogs });
  } catch (error) {
    next(error);
  }
};

exports.createReplacement = async (req, res, next) => {
  try {
    const { vendorId, notes } = req.body;

    const filter = { _id: req.params.id };
    if (req.user && req.user.role === 'shop_owner' && req.shopId) {
      filter.shopId = req.shopId;
    }

    const log = await ExpiryLog.findOneAndUpdate(
      filter,
      { status: 'replaced', notes: notes || '', replacementRequested: true, replacementDate: new Date() },
      { new: true }
    );

    if (!log) {
      res.status(404);
      throw new Error('Expiry log not found');
    }

    sendResponse(res, 200, true, 'Replacement recorded', { log });
  } catch (error) {
    next(error);
  }
};