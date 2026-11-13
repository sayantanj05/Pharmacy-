const ExpiryLog = require('../models/ExpiryLog');
const Medicine = require('../models/Medicine');
const { sendResponse } = require('../utils/response');

exports.getExpiryLogs = async (req, res, next) => {
  try {
    const { status, shopId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (shopId) {
      filter.shopId = shopId;
    } else if (req.user && req.user.role === 'shop_owner' && req.user.shopId) {
      filter.shopId = req.user.shopId;
    }

    const logs = await ExpiryLog.find(filter).populate('medicineId').populate('shopId');

    // Fetch all medicines from MongoDB medicines collection to ensure complete expiry tracking
    const medFilter = {};
    if (shopId) {
      medFilter.shopId = shopId;
    } else if (req.user && req.user.role === 'shop_owner' && req.user.shopId) {
      medFilter.shopId = req.user.shopId;
    }

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
    const log = await ExpiryLog.findById(req.params.id);
    if (!log) {
      res.status(404);
      throw new Error('Expiry log not found');
    }
    log.status = 'replaced';
    log.notes = notes || log.notes;
    await log.save();
    sendResponse(res, 200, true, 'Replacement recorded', { log });
  } catch (error) {
    next(error);
  }
};
