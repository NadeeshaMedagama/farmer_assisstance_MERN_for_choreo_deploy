const Payment = require('../models/Payment');
const PaymentMethod = require('../models/PaymentMethod');
const Subscription = require('../models/Subscription');
const logger = require('../utils/logger');

// Get user payments
exports.getUserPayments = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, type, limit = 20, page = 1 } = req.query;
    
    let query = { user: userId, isActive: true };
    
    if (status) {
      query.status = status;
    }
    
    if (type) {
      query.type = type;
    }
    
    const skip = (page - 1) * limit;
    
    const payments = await Payment.find(query)
      .populate('subscription', 'plan status')
      .populate('paymentMethod', 'type details')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Payment.countDocuments(query);
    
    res.json({
      success: true,
      count: payments.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: payments
    });
    
  } catch (error) {
    logger.error('Get user payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching payments'
    });
  }
};

// Get single payment
exports.getPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('subscription', 'plan status')
      .populate('paymentMethod', 'type details')
      .populate('user', 'firstName lastName email');
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    // Check if user owns this payment
    if (payment.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      data: payment
    });
    
  } catch (error) {
    logger.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching payment'
    });
  }
};

// Create payment
exports.createPayment = async (req, res, next) => {
  try {
    const { subscriptionId, paymentMethodId, amount, description, type = 'subscription' } = req.body;
    const userId = req.user.id;
    
    // Verify subscription exists and belongs to user
    const subscription = await Subscription.findOne({
      _id: subscriptionId,
      user: userId,
      isActive: true
    });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }
    
    // Verify payment method exists and belongs to user
    const paymentMethod = await PaymentMethod.findOne({
      _id: paymentMethodId,
      user: userId,
      isActive: true
    });
    
    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }
    
    // Create payment
    const payment = await Payment.create({
      user: userId,
      subscription: subscriptionId,
      paymentMethod: paymentMethodId,
      amount: amount || subscription.billing.amount,
      currency: subscription.billing.currency,
      type: type,
      description: description || `Payment for ${subscription.plan.name} subscription`,
      provider: 'stripe', // This would be determined by payment method
      status: 'pending'
    });
    
    // Populate the payment
    await payment.populate([
      { path: 'subscription', select: 'plan status' },
      { path: 'paymentMethod', select: 'type details' }
    ]);
    
    logger.info(`New payment created: ${payment._id} for user ${userId}`);
    
    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      data: payment
    });
    
  } catch (error) {
    logger.error('Create payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating payment'
    });
  }
};

// Update payment status
exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const { status, providerData, failureReason } = req.body;
    
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    // Check if user owns this payment
    if (payment.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Update payment
    payment.status = status;
    
    if (providerData) {
      payment.providerData = { ...payment.providerData, ...providerData };
    }
    
    if (status === 'completed') {
      payment.processedAt = new Date();
    }
    
    if (status === 'failed' && failureReason) {
      payment.failure = {
        reason: failureReason,
        code: 'PAYMENT_FAILED',
        message: failureReason
      };
    }
    
    await payment.save();
    
    logger.info(`Payment status updated: ${payment._id} to ${status}`);
    
    res.json({
      success: true,
      message: 'Payment status updated successfully',
      data: payment
    });
    
  } catch (error) {
    logger.error('Update payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating payment status'
    });
  }
};

// Process refund
exports.processRefund = async (req, res, next) => {
  try {
    const { amount, reason } = req.body;
    
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    // Check if user owns this payment
    if (payment.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Check if payment is eligible for refund
    if (payment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Only completed payments can be refunded'
      });
    }
    
    const refundAmount = amount || payment.amount;
    
    // Update payment
    payment.status = refundAmount === payment.amount ? 'refunded' : 'partially_refunded';
    payment.refund = {
      amount: refundAmount,
      reason: reason,
      processedAt: new Date(),
      refundId: `refund_${Date.now()}`
    };
    
    await payment.save();
    
    logger.info(`Refund processed: ${payment._id} for amount ${refundAmount}`);
    
    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: payment
    });
    
  } catch (error) {
    logger.error('Process refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing refund'
    });
  }
};

// Get payment methods
exports.getPaymentMethods = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const paymentMethods = await PaymentMethod.find({ user: userId, isActive: true })
      .sort({ isDefault: -1, createdAt: -1 });
    
    res.json({
      success: true,
      count: paymentMethods.length,
      data: paymentMethods
    });
    
  } catch (error) {
    logger.error('Get payment methods error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching payment methods'
    });
  }
};

// Add payment method
exports.addPaymentMethod = async (req, res, next) => {
  try {
    const { type, provider, details, isDefault = false } = req.body;
    const userId = req.user.id;
    
    // If setting as default, unset other defaults
    if (isDefault) {
      await PaymentMethod.updateMany(
        { user: userId, isDefault: true },
        { isDefault: false }
      );
    }
    
    const paymentMethod = await PaymentMethod.create({
      user: userId,
      type: type,
      provider: provider,
      details: details,
      isDefault: isDefault
    });
    
    logger.info(`New payment method added: ${paymentMethod._id} for user ${userId}`);
    
    res.status(201).json({
      success: true,
      message: 'Payment method added successfully',
      data: paymentMethod
    });
    
  } catch (error) {
    logger.error('Add payment method error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding payment method'
    });
  }
};

// Update payment method
exports.updatePaymentMethod = async (req, res, next) => {
  try {
    const { isDefault } = req.body;
    const userId = req.user.id;
    
    const paymentMethod = await PaymentMethod.findById(req.params.id);
    
    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }
    
    // Check if user owns this payment method
    if (paymentMethod.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // If setting as default, unset other defaults
    if (isDefault) {
      await PaymentMethod.updateMany(
        { user: userId, isDefault: true, _id: { $ne: req.params.id } },
        { isDefault: false }
      );
    }
    
    const updatedPaymentMethod = await PaymentMethod.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    logger.info(`Payment method updated: ${paymentMethod._id}`);
    
    res.json({
      success: true,
      message: 'Payment method updated successfully',
      data: updatedPaymentMethod
    });
    
  } catch (error) {
    logger.error('Update payment method error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating payment method'
    });
  }
};

// Delete payment method
exports.deletePaymentMethod = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const paymentMethod = await PaymentMethod.findById(req.params.id);
    
    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }
    
    // Check if user owns this payment method
    if (paymentMethod.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Soft delete
    paymentMethod.isActive = false;
    await paymentMethod.save();
    
    logger.info(`Payment method deleted: ${paymentMethod._id} by user ${userId}`);
    
    res.json({
      success: true,
      message: 'Payment method deleted successfully'
    });
    
  } catch (error) {
    logger.error('Delete payment method error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting payment method'
    });
  }
};

// Get all payments (admin only)
exports.getAllPayments = async (req, res, next) => {
  try {
    const { status, type, user, limit = 20, page = 1 } = req.query;
    
    let query = { isActive: true };
    
    if (status) {
      query.status = status;
    }
    
    if (type) {
      query.type = type;
    }
    
    if (user) {
      query.user = user;
    }
    
    const skip = (page - 1) * limit;
    
    const payments = await Payment.find(query)
      .populate('user', 'firstName lastName email')
      .populate('subscription', 'plan status')
      .populate('paymentMethod', 'type details')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Payment.countDocuments(query);
    
    res.json({
      success: true,
      count: payments.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: payments
    });
    
  } catch (error) {
    logger.error('Get all payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching payments'
    });
  }
};
