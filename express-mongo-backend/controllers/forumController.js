const Forum = require('../models/Forum');

exports.createThread = async (req, res, next) => {
  try {
    const thread = await Forum.create({ ...req.body, author: req.user.id });
    res.status(201).json({ success: true, data: thread });
  } catch (err) {
    next(err);
  }
};

exports.listThreads = async (req, res, next) => {
  try {
    const { category } = req.query;
    const query = category ? { category } : {};
    const threads = await Forum.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: threads });
  } catch (err) {
    next(err);
  }
};

exports.getThread = async (req, res, next) => {
  try {
    const thread = await Forum.findById(req.params.id);
    if (!thread) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: thread });
  } catch (err) {
    next(err);
  }
};

exports.reply = async (req, res, next) => {
  try {
    const thread = await Forum.findById(req.params.id);
    if (!thread) return res.status(404).json({ success: false, message: 'Not found' });
    thread.replies.push({ content: req.body.content, author: req.user.id });
    await thread.save();
    res.status(201).json({ success: true, data: thread });
  } catch (err) {
    next(err);
  }
};
