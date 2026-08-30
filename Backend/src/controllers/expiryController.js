const ExpiryLog = require('../models/ExpiryLog');
const Medicine = require('../models/Medicine');
const { sendResponse } = require('../utils/response');

exports.getExpiryLogs = async (req, res, next) => {
  try {
    const { status, shopId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (shopId) filter.shopId = shopId;
    const logs = await ExpiryLog.find(filter).populate('medicineId').populate('shopId');
    sendResponse(res, 200, true, 'Expiry logs fetched', { logs });
  } catch (error) {
    next(error);
  }
};

exports.createReplacement = async (req, res, next) => {
  try {
    const { expiryLogId, replacementMedicineId } = req.body;
    const log = await ExpiryLog.findById(expiryLogId);
    if (!log) {
      res.status(404);
      throw new Error('Expiry log not found');
    }
    log.status = 'replaced';
    log.replacementMedicineId = replacementMedicineId;
    await log.save();
    sendResponse(res, 200, true, 'Replacement recorded', { log });
  } catch (error) {
    next(error);
  }
};
