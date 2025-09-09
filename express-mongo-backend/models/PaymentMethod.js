const mongoose = require('mongoose');

const PaymentMethodSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'bank_account', 'crypto_wallet'],
    required: true
  },
  provider: {
    type: String,
    enum: ['stripe', 'paypal', 'razorpay', 'square', 'other'],
    required: true
  },
  details: {
    // For credit/debit cards
    last4: String,
    brand: String, // visa, mastercard, amex, etc.
    expMonth: Number,
    expYear: Number,
    
    // For bank accounts
    bankName: String,
    accountType: String, // checking, savings
    
    // For PayPal
    paypalEmail: String,
    
    // For crypto
    walletAddress: String,
    cryptoType: String // bitcoin, ethereum, etc.
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    stripePaymentMethodId: String,
    stripeCustomerId: String,
    paypalPaymentMethodId: String,
    externalId: String
  },
  verification: {
    status: {
      type: String,
      enum: ['pending', 'verified', 'failed'],
      default: 'pending'
    },
    verifiedAt: Date,
    failedAt: Date,
    failureReason: String
  }
}, {
  timestamps: true
});

// Index for better query performance
PaymentMethodSchema.index({ user: 1 });
PaymentMethodSchema.index({ type: 1 });
PaymentMethodSchema.index({ provider: 1 });
PaymentMethodSchema.index({ isDefault: 1 });
PaymentMethodSchema.index({ isActive: 1 });

// Ensure only one default payment method per user
PaymentMethodSchema.pre('save', async function(next) {
  if (this.isDefault && this.isNew) {
    await this.constructor.updateMany(
      { user: this.user, isDefault: true },
      { isDefault: false }
    );
  }
  next();
});

// Virtual for masked card number
PaymentMethodSchema.virtual('maskedNumber').get(function() {
  if (this.type === 'credit_card' || this.type === 'debit_card') {
    return `**** **** **** ${this.details.last4}`;
  }
  if (this.type === 'paypal') {
    return this.details.paypalEmail;
  }
  if (this.type === 'bank_account') {
    return `****${this.details.last4}`;
  }
  return 'N/A';
});

// Ensure virtual fields are serialized
PaymentMethodSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('PaymentMethod', PaymentMethodSchema);
