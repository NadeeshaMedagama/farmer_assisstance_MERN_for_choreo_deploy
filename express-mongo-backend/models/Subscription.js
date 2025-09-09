const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: mongoose.Schema.ObjectId,
    ref: 'SubscriptionPlan',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'cancelled', 'expired', 'past_due', 'trialing'],
    default: 'trialing'
  },
  billing: {
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date
    },
    nextBillingDate: {
      type: Date
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'quarterly', 'yearly', 'lifetime'],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  trial: {
    isTrial: {
      type: Boolean,
      default: true
    },
    trialStartDate: {
      type: Date,
      default: Date.now
    },
    trialEndDate: {
      type: Date
    },
    trialDays: {
      type: Number,
      default: 14
    }
  },
  payment: {
    method: {
      type: String,
      enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'crypto', 'other'],
      required: true
    },
    paymentMethodId: {
      type: String
    },
    lastPaymentDate: {
      type: Date
    },
    nextPaymentDate: {
      type: Date
    },
    totalPaid: {
      type: Number,
      default: 0
    },
    failedPayments: {
      type: Number,
      default: 0
    }
  },
  features: [{
    name: String,
    enabled: {
      type: Boolean,
      default: true
    },
    usage: {
      type: Number,
      default: 0
    },
    limit: {
      type: Number,
      default: null
    }
  }],
  usage: {
    apiCalls: {
      type: Number,
      default: 0
    },
    lastActive: {
      type: Date
    },
    loginCount: {
      type: Number,
      default: 0
    }
  },
  cancellation: {
    requestedAt: {
      type: Date
    },
    cancelledAt: {
      type: Date
    },
    reason: {
      type: String
    },
    effectiveDate: {
      type: Date
    }
  },
  metadata: {
    stripeSubscriptionId: String,
    stripeCustomerId: String,
    paypalSubscriptionId: String,
    notes: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
SubscriptionSchema.index({ user: 1 });
SubscriptionSchema.index({ plan: 1 });
SubscriptionSchema.index({ status: 1 });
SubscriptionSchema.index({ 'billing.nextBillingDate': 1 });
SubscriptionSchema.index({ 'trial.trialEndDate': 1 });
SubscriptionSchema.index({ isActive: 1 });

// Calculate trial end date before saving
SubscriptionSchema.pre('save', function(next) {
  if (this.isNew && this.trial.isTrial && !this.trial.trialEndDate) {
    this.trial.trialEndDate = new Date(this.trial.trialStartDate.getTime() + this.trial.trialDays * 24 * 60 * 60 * 1000);
  }
  
  // Calculate billing end date
  if (this.isNew && !this.billing.endDate) {
    const cycleDays = this.billing.billingCycle === 'monthly' ? 30 : 
                     this.billing.billingCycle === 'quarterly' ? 90 : 
                     this.billing.billingCycle === 'yearly' ? 365 : 0;
    
    if (cycleDays > 0) {
      this.billing.endDate = new Date(this.billing.startDate.getTime() + cycleDays * 24 * 60 * 60 * 1000);
      this.billing.nextBillingDate = this.billing.endDate;
    }
  }
  
  next();
});

// Virtual for days remaining in trial
SubscriptionSchema.virtual('trial.daysRemaining').get(function() {
  if (!this.trial.isTrial || !this.trial.trialEndDate) return 0;
  const now = new Date();
  const endDate = this.trial.trialEndDate;
  if (endDate <= now) return 0;
  return Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
});

// Virtual for subscription status
SubscriptionSchema.virtual('subscriptionStatus').get(function() {
  if (this.trial.isTrial) {
    const now = new Date();
    if (this.trial.trialEndDate && this.trial.trialEndDate <= now) {
      return 'trial_expired';
    }
    return 'trialing';
  }
  return this.status;
});

// Ensure virtual fields are serialized
SubscriptionSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Subscription', SubscriptionSchema);
