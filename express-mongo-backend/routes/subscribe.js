const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const subscribeController = require('../controllers/subscribeController');

// Public routes
router.post('/', subscribeController.subscribe);
router.post('/unsubscribe', subscribeController.unsubscribe);
router.get('/:email', subscribeController.getSubscriber);

// Protected routes (admin only)
router.get('/', protect, authorize('admin'), subscribeController.getAllSubscribers);
router.put('/:email/preferences', subscribeController.updatePreferences);

module.exports = router;


