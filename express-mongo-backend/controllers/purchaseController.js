const purchaseService = require('../services/purchaseService');

exports.create = async (req, res, next) => {
  try {
    const doc = await purchaseService.create(req.user, req.body);
    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
};

exports.list = async (req, res, next) => {
  try {
    const data = await purchaseService.list(req.user);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
