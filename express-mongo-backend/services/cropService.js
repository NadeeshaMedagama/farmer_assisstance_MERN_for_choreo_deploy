const Crop = require('../models/Crop');
const logger = require('../utils/logger');

class CropService {
  async createCrop(userId, data) {
    const crop = await Crop.create({ ...data, farmer: userId });
    logger.info(`Crop created: ${crop._id} by user ${userId}`);
    return crop;
  }

  async listCrops(userId, filters = {}) {
    const query = { farmer: userId, ...(filters || {}) };
    return Crop.find(query).sort({ plantingDate: -1 });
  }

  async getCrop(userId, cropId) {
    const crop = await Crop.findOne({ _id: cropId, farmer: userId });
    if (!crop) throw new Error('Crop not found');
    return crop;
  }

  async updateCrop(userId, cropId, updates) {
    const crop = await Crop.findOneAndUpdate(
      { _id: cropId, farmer: userId },
      updates,
      { new: true, runValidators: true }
    );
    if (!crop) throw new Error('Crop not found');
    return crop;
  }

  async deleteCrop(userId, cropId) {
    const crop = await Crop.findOneAndDelete({ _id: cropId, farmer: userId });
    if (!crop) throw new Error('Crop not found');
    return { deleted: true };
  }
}

module.exports = new CropService();
