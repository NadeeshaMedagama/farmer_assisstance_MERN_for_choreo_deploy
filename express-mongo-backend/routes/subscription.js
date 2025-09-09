const express = require('express');
const {
  getUserSubscriptions,
  getSubscription,
  createSubscription,
  updateSubscription,
  cancelSubscription,
  getSubscriptionUsage,
  updateSubscriptionUsage,
  getAllSubscriptions
} = require('../controllers/subscriptionController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// User routes
router.get('/my-subscriptions', protect, getUserSubscriptions);
router.get('/:id', protect, getSubscription);
router.post('/', protect, createSubscription);
router.put('/:id', protect, updateSubscription);
router.put('/:id/cancel', protect, cancelSubscription);
router.get('/:id/usage', protect, getSubscriptionUsage);
router.put('/:id/usage', protect, updateSubscriptionUsage);

// Admin routes
router.get('/admin/all', protect, authorize('admin'), getAllSubscriptions);

module.exports = router;
