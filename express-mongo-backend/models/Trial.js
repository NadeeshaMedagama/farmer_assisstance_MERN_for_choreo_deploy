const mongoose = require('mongoose');

const TrialSchema = new mongoose.Schema({
  user: {
    firstName: {
      type: String,
      required: [true, 'Please add a first name'],
      trim: true,
      maxlength: [50, 'First name cannot be more than 50 characters']
    },
    lastName: {
      type: String,
      required: [true, 'Please add a last name'],
      trim: true,
      maxlength: [50, 'Last name cannot be more than 50 characters']
    },
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
    phone: {
      type: String,
      required: [true, 'Please add a phone number'],
      match: [/^\+?[\d\s-()]+$/, 'Please add a valid phone number']
    },
    company: {
      type: String,
      trim: true,
      maxlength: [100, 'Company name cannot be more than 100 characters']
    },
    position: {
      type: String,
      trim: true,
      maxlength: [100, 'Position cannot be more than 100 characters']
    }
  },
  farm: {
    name: {
      type: String,
      required: [true, 'Please add a farm name'],
      trim: true,
      maxlength: [100, 'Farm name cannot be more than 100 characters']
    },
    size: {
      type: Number,
      required: [true, 'Please add farm size'],
      min: [0, 'Farm size cannot be negative']
    },
    sizeUnit: {
      type: String,
      enum: ['acres', 'hectares', 'square_meters'],
      default: 'acres'
    },
    location: {
      address: {
        type: String,
        required: [true, 'Please add farm address']
      },
      city: {
        type: String,
        required: [true, 'Please add city']
      },
      state: {
        type: String,
        required: [true, 'Please add state']
      },
      country: {
        type: String,
        required: [true, 'Please add country']
      },
      coordinates: {
        latitude: {
          type: Number,
          min: -90,
          max: 90
        },
        longitude: {
          type: Number,
          min: -180,
          max: 180
        }
      }
    },
    crops: [{
      type: String,
      trim: true
    }],
    farmingExperience: {
      type: Number,
      min: 0,
      description: 'Years of farming experience'
    },
    currentChallenges: [{
      type: String,
      trim: true
    }],
    goals: [{
      type: String,
      trim: true
    }]
  },
  trial: {
    type: {
      type: String,
      enum: ['basic', 'premium', 'enterprise'],
      default: 'basic'
    },
    duration: {
      type: Number,
      default: 14, // 14 days
      min: 1,
      max: 90
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'expired', 'converted', 'cancelled'],
      default: 'pending'
    },
    features: [{
      type: String,
      enum: [
        'crop_management',
        'weather_monitoring',
        'market_prices',
        'forum_access',
        'expert_consultation',
        'mobile_app',
        'api_access',
        'custom_reports',
        'priority_support'
      ]
    }],
    usage: {
      apiCalls: {
        type: Number,
        default: 0
      },
      maxApiCalls: {
        type: Number,
        default: 1000
      },
      lastActive: {
        type: Date
      },
      loginCount: {
        type: Number,
        default: 0
      }
    }
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    language: {
      type: String,
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    units: {
      temperature: { type: String, default: 'celsius' },
      distance: { type: String, default: 'metric' }
    }
  },
  source: {
    type: String,
    enum: ['website', 'api', 'referral', 'advertisement', 'other'],
    default: 'api'
  },
  referral: {
    code: String,
    source: String
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot be more than 1000 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Calculate end date before saving
TrialSchema.pre('save', function(next) {
  if (this.isNew && !this.trial.endDate) {
    this.trial.endDate = new Date(this.trial.startDate.getTime() + this.trial.duration * 24 * 60 * 60 * 1000);
  }
  next();
});

// Index for better query performance
TrialSchema.index({ 'user.email': 1 });
TrialSchema.index({ 'trial.status': 1 });
TrialSchema.index({ 'trial.startDate': -1 });
TrialSchema.index({ 'trial.endDate': 1 });
TrialSchema.index({ 'farm.location.city': 1 });
TrialSchema.index({ isActive: 1 });

// Virtual for full name
TrialSchema.virtual('user.fullName').get(function() {
  return `${this.user.firstName} ${this.user.lastName}`;
});

// Virtual for trial days remaining
TrialSchema.virtual('trial.daysRemaining').get(function() {
  const now = new Date();
  const endDate = this.trial.endDate;
  if (endDate <= now) return 0;
  return Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
});

// Ensure virtual fields are serialized
TrialSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Trial', TrialSchema);
