const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'weather_alert',
      'price_alert',
      'crop_reminder',
      'forum_reply',
      'expert_advice',
      'system_update',
      'harvest_reminder',
      'irrigation_reminder',
      'pest_alert',
      'market_update',
      'general'
    ]
  },
  title: {
    type: String,
    required: [true, 'Please add a notification title'],
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Please add a notification message'],
    maxlength: [1000, 'Message cannot be more than 1000 characters']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  channels: {
    email: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date,
      status: {
        type: String,
        enum: ['pending', 'sent', 'failed', 'delivered', 'opened', 'clicked']
      }
    },
    sms: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date,
      status: {
        type: String,
        enum: ['pending', 'sent', 'failed', 'delivered']
      }
    },
    push: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date,
      status: {
        type: String,
        enum: ['pending', 'sent', 'failed', 'delivered', 'opened']
      }
    },
    inApp: {
      sent: {
        type: Boolean,
        default: true
      },
      sentAt: {
        type: Date,
        default: Date.now
      }
    }
  },
  data: {
    // Additional data specific to notification type
    cropId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Crop'
    },
    forumId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Forum'
    },
    weatherData: {
      temperature: Number,
      conditions: String,
      alert: String
    },
    priceData: {
      crop: String,
      price: Number,
      change: Number,
      trend: String
    },
    reminderData: {
      task: String,
      dueDate: Date,
      crop: String
    },
    actionUrl: String,
    actionText: String
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: Date,
  expiresAt: Date,
  metadata: {
    source: {
      type: String,
      enum: ['system', 'user', 'external_api', 'scheduled'],
      default: 'system'
    },
    category: String,
    tags: [String],
    relatedEntities: [{
      type: {
        type: String,
        enum: ['crop', 'forum', 'user', 'weather', 'market']
      },
      id: mongoose.Schema.ObjectId
    }]
  }
}, {
  timestamps: true
});

// Index for better query performance
NotificationSchema.index({ user: 1, createdAt: -1 });
NotificationSchema.index({ user: 1, isRead: 1 });
NotificationSchema.index({ user: 1, type: 1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
NotificationSchema.index({ 'channels.email.status': 1 });
NotificationSchema.index({ 'channels.sms.status': 1 });

// Pre-save middleware to set expiration date if not provided
NotificationSchema.pre('save', function(next) {
  if (!this.expiresAt) {
    // Set default expiration to 30 days from creation
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  next();
});

module.exports = mongoose.model('Notification', NotificationSchema);
