const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const trialController = require('../controllers/trialController');

// Public routes
router.post('/', trialController.registerTrial);
router.get('/status/:email', trialController.getTrialStatus);
router.get('/usage/:email', trialController.getTrialUsage);
router.put('/usage/:email', trialController.updateTrialUsage);
router.put('/convert/:email', trialController.convertTrial);
router.put('/cancel/:email', trialController.cancelTrial);

// Protected routes (admin only)
router.get('/', protect, authorize('admin'), trialController.getAllTrials);
router.get('/stats', protect, authorize('admin'), trialController.getTrialStats);

module.exports = router;


