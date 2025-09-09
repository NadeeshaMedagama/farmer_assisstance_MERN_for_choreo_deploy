const express = require('express');
const {
  getPlans,
  getPlan,
  createPlan,
  updatePlan,
  deletePlan,
  getPlanFeatures,
  bulkCreatePlans
} = require('../controllers/subscriptionPlanController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getPlans);
router.get('/:id', getPlan);
router.get('/:id/features', getPlanFeatures);

// Admin routes
router.post('/', protect, authorize('admin'), createPlan);
router.post('/bulk-create', protect, authorize('admin'), bulkCreatePlans);
router.put('/:id', protect, authorize('admin'), updatePlan);
router.delete('/:id', protect, authorize('admin'), deletePlan);

module.exports = router;
