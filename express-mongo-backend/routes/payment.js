const express = require('express');
const {
  getUserPayments,
  getPayment,
  createPayment,
  updatePaymentStatus,
  processRefund,
  getPaymentMethods,
  addPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  getAllPayments
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// User routes
router.get('/my-payments', protect, getUserPayments);
router.get('/:id', protect, getPayment);
router.post('/', protect, createPayment);
router.put('/:id/status', protect, updatePaymentStatus);
router.put('/:id/refund', protect, processRefund);

// Payment methods
router.get('/methods/my-methods', protect, getPaymentMethods);
router.post('/methods', protect, addPaymentMethod);
router.put('/methods/:id', protect, updatePaymentMethod);
router.delete('/methods/:id', protect, deletePaymentMethod);

// Admin routes
router.get('/admin/all', protect, authorize('admin'), getAllPayments);

module.exports = router;
