const cropService = require('../services/cropService');

exports.create = async (req, res, next) => {
  try {
    const crop = await cropService.createCrop(req.user.id, req.body);
    res.status(201).json({ success: true, data: crop });
  } catch (err) {
    next(err);
  }
};

exports.list = async (req, res, next) => {
  try {
    const crops = await cropService.listCrops(req.user.id, req.query || {});
    res.status(200).json({ success: true, data: crops });
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const crop = await cropService.getCrop(req.user.id, req.params.id);
    res.status(200).json({ success: true, data: crop });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const crop = await cropService.updateCrop(req.user.id, req.params.id, req.body);
    res.status(200).json({ success: true, data: crop });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const result = await cropService.deleteCrop(req.user.id, req.params.id);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
