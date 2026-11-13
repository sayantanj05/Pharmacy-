const Alternative = require('../models/Alternative');
const Medicine = require('../models/Medicine');
const { sendResponse } = require('../utils/response');

exports.getAlternatives = async (req, res, next) => {
  try {
    const { medicineId } = req.query;
    if (!medicineId) {
      res.status(400);
      throw new Error('medicineId is required');
    }

    const medicine = await Medicine.findById(medicineId);
    if (!medicine) {
      res.status(404);
      throw new Error('Medicine not found');
    }

    const mapped = await Alternative.find({ medicineId }).populate('alternativeMedicineId');
    const mappedIds = new Set();
    let alternatives = [];

    for (const alt of mapped) {
      const candidate = alt.alternativeMedicineId;
      if (!candidate || !candidate.isActive || candidate.stock <= 0) continue;
      if (mappedIds.has(candidate._id.toString())) continue;
      mappedIds.add(candidate._id.toString());
      alternatives.push({
        _id: candidate._id,
        name: candidate.name,
        medicineType: candidate.medicineType,
        medicineSystem: candidate.medicineSystem,
        price: candidate.price,
        stock: candidate.stock,
        imageUrl: candidate.imageUrl,
        reason: alt.reason || 'Suggested alternative',
        source: alt.source || 'Aura DB',
      });
    }

    if (alternatives.length === 0) {
      const fallbackFilter = {
        _id: { $ne: medicine._id },
        isActive: true,
        stock: { $gt: 0 },
      };
      if (medicine.category) fallbackFilter.category = medicine.category;
      if (medicine.medicineSystem) fallbackFilter.medicineSystem = medicine.medicineSystem;

      const fallback = await Medicine.find(fallbackFilter).limit(5);
      alternatives = fallback.map((m) => ({
        _id: m._id,
        name: m.name,
        medicineType: m.medicineType,
        medicineSystem: m.medicineSystem,
        price: m.price,
        stock: m.stock,
        imageUrl: m.imageUrl,
        reason: 'Same category and system, available in stock',
        source: 'Fallback',
      }));
    }

    sendResponse(res, 200, true, 'Alternatives fetched', {
      alternatives,
      message:
        alternatives.length === 0
          ? 'No alternatives available right now. Please check back later.'
          : undefined,
    });
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