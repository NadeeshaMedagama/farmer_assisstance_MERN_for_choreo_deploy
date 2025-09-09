const marketService = require('../services/marketService');

exports.list = async (req, res, next) => {
  try {
    const data = await marketService.list(req.query);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.upsert = async (req, res, next) => {
  try {
    const doc = await marketService.upsertPrice(req.body);
    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
};

exports.externalLookup = async (req, res, next) => {
  try {
    const { name } = req.query;
    if (!name) return res.status(400).json({ success: false, message: 'name is required' });
    const result = await marketService.externalLookup(name);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
