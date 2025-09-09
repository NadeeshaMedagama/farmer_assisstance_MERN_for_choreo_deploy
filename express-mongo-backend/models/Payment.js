const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  subscription: {
    type: mongoose.Schema.ObjectId,
    ref: 'Subscription',
    required: true
  },
  paymentMethod: {
    type: mongoose.Schema.ObjectId,
    ref: 'PaymentMethod',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD']
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  type: {
    type: String,
    enum: ['subscription', 'one_time', 'refund', 'chargeback', 'adjustment'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  provider: {
    type: String,
    enum: ['stripe', 'paypal', 'razorpay', 'square', 'manual'],
    required: true
  },
  providerData: {
    transactionId: String,
    chargeId: String,
    paymentIntentId: String,
    refundId: String,
    rawResponse: mongoose.Schema.Types.Mixed
  },
  billing: {
    billingPeriodStart: Date,
    billingPeriodEnd: Date,
    invoiceNumber: String,
    dueDate: Date
  },
  failure: {
    reason: String,
    code: String,
    message: String,
    retryCount: {
      type: Number,
      default: 0
    },
    nextRetryAt: Date
  },
  refund: {
    amount: Number,
    reason: String,
    processedAt: Date,
    refundId: String
  },
  metadata: {
    notes: String,
    tags: [String],
    customFields: mongoose.Schema.Types.Mixed
  },
  processedAt: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
PaymentSchema.index({ user: 1 });
PaymentSchema.index({ subscription: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ type: 1 });
PaymentSchema.index({ provider: 1 });
PaymentSchema.index({ 'providerData.transactionId': 1 });
PaymentSchema.index({ createdAt: -1 });
PaymentSchema.index({ isActive: 1 });

// Virtual for formatted amount
PaymentSchema.virtual('formattedAmount').get(function() {
  return `${this.currency} ${this.amount.toFixed(2)}`;
});

// Virtual for payment status display
PaymentSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    'pending': 'Pending',
    'processing': 'Processing',
    'completed': 'Completed',
    'failed': 'Failed',
    'cancelled': 'Cancelled',
    'refunded': 'Refunded',
    'partially_refunded': 'Partially Refunded'
  };
  return statusMap[this.status] || this.status;
});

// Ensure virtual fields are serialized
PaymentSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Payment', PaymentSchema);


