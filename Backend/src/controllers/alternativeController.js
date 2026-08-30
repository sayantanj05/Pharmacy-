const Alternative = require('../models/Alternative');
const { sendResponse } = require('../utils/response');

exports.getAlternatives = async (req, res, next) => {
  try {
    const { medicineId } = req.query;
    if (!medicineId) {
      res.status(400);
      throw new Error('medicineId is required');
    }
    const alternatives = await Alternative.find({ medicineId }).populate('alternativeMedicineId');
    sendResponse(res, 200, true, 'Alternatives fetched', { alternatives });
  } catch (error) {
    next(error);
  }
};

exports.createAlternative = async (req, res, next) => {
  try {
    const alternative = await Alternative.create(req.body);
    sendResponse(res, 201, true, 'Alternative created', { alternative });
  } catch (error) {
    next(error);
  }
};
