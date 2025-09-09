const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'email and password are required' });
  }
  return res.status(201).json({ success: true, message: 'Registered (placeholder)' });
});

module.exports = router;


