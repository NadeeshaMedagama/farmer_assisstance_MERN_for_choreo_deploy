const mongoose = require('mongoose');

const SubscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please add an email address'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email address'
    ]
  },
  name: {
    type: String,
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  subscriptionDate: {
    type: Date,
    default: Date.now
  },
  preferences: {
    newsletter: {
      type: Boolean,
      default: true
    },
    marketing: {
      type: Boolean,
      default: false
    },
    updates: {
      type: Boolean,
      default: true
    }
  },
  source: {
    type: String,
    enum: ['website', 'api', 'import', 'other'],
    default: 'api'
  },
  unsubscribedAt: {
    type: Date
  },
  lastEmailSent: {
    type: Date
  },
  emailCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
SubscriberSchema.index({ email: 1 });
SubscriberSchema.index({ isActive: 1 });
SubscriberSchema.index({ subscriptionDate: -1 });

// Prevent duplicate emails
SubscriberSchema.pre('save', async function(next) {
  if (this.isNew) {
    const existingSubscriber = await this.constructor.findOne({ 
      email: this.email, 
      isActive: true 
    });
    if (existingSubscriber) {
      const error = new Error('Email already subscribed');
      error.statusCode = 400;
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model('Subscriber', SubscriberSchema);
