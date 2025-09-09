const mongoose = require('mongoose');

const SubscriptionPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a plan name'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Please add a plan description'],
    trim: true
  },
  type: {
    type: String,
    enum: ['basic', 'premium', 'enterprise', 'custom'],
    required: true
  },
  price: {
    amount: {
      type: Number,
      required: [true, 'Please add plan price'],
      min: [0, 'Price cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD']
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'quarterly', 'yearly', 'lifetime'],
      default: 'monthly'
    }
  },
  features: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    included: {
      type: Boolean,
      default: true
    },
    limits: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  }],
  limits: {
    maxApiCalls: {
      type: Number,
      default: 1000
    },
    maxUsers: {
      type: Number,
      default: 1
    },
    maxFarms: {
      type: Number,
      default: 1
    },
    storageLimit: {
      type: Number,
      default: 100 // in MB
    }
  },
  trialDays: {
    type: Number,
    default: 14,
    min: 0,
    max: 90
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  metadata: {
    stripePriceId: String,
    stripeProductId: String,
    paypalPlanId: String
  }
}, {
  timestamps: true
});

// Index for better query performance
SubscriptionPlanSchema.index({ type: 1 });
SubscriptionPlanSchema.index({ isActive: 1 });
SubscriptionPlanSchema.index({ 'price.billingCycle': 1 });
SubscriptionPlanSchema.index({ sortOrder: 1 });

// Virtual for formatted price
SubscriptionPlanSchema.virtual('formattedPrice').get(function() {
  return `${this.price.currency} ${this.price.amount.toFixed(2)}/${this.price.billingCycle}`;
});

// Ensure virtual fields are serialized
SubscriptionPlanSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('SubscriptionPlan', SubscriptionPlanSchema);
