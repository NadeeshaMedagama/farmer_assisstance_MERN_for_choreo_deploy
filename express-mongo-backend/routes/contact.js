const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const contactController = require('../controllers/contactController');

// Public routes
router.post('/', contactController.submitContact);

// Protected routes (admin only)
router.get('/', protect, authorize('admin'), contactController.getAllContacts);
router.get('/stats', protect, authorize('admin'), contactController.getContactStats);
router.get('/:id', protect, authorize('admin'), contactController.getContact);
router.put('/:id/status', protect, authorize('admin'), contactController.updateContactStatus);
router.put('/:id/respond', protect, authorize('admin'), contactController.respondToContact);
router.delete('/:id', protect, authorize('admin'), contactController.deleteContact);

module.exports = router;


