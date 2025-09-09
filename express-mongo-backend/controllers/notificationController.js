const notificationService = require('../services/notificationService');

exports.list = async (req, res, next) => {
  try {
    const data = await notificationService.list(req.user.id, req.query);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const payload = { ...req.body, user: req.user.id };
    const data = await notificationService.create(payload);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.markRead = async (req, res, next) => {
  try {
    const data = await notificationService.markRead(req.user.id, req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
