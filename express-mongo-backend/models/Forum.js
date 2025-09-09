const mongoose = require('mongoose');

const ForumSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Please add content'],
    maxlength: [5000, 'Content cannot be more than 5000 characters']
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: [
      'general',
      'crop_management',
      'pest_control',
      'soil_health',
      'weather',
      'market_prices',
      'equipment',
      'organic_farming',
      'irrigation',
      'fertilizers',
      'harvesting',
      'storage',
      'other'
    ],
    default: 'general'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot be more than 50 characters']
  }],
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    caption: {
      type: String,
      maxlength: [200, 'Caption cannot be more than 200 characters']
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  likes: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  dislikes: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    dislikedAt: {
      type: Date,
      default: Date.now
    }
  }],
  views: {
    type: Number,
    default: 0
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  isResolved: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  location: {
    city: String,
    state: String,
    country: String
  },
  replies: [{
    content: {
      type: String,
      required: true,
      maxlength: [2000, 'Reply content cannot be more than 2000 characters']
    },
    author: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    images: [{
      url: String,
      caption: String
    }],
    likes: [{
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      },
      likedAt: {
        type: Date,
        default: Date.now
      }
    }],
    dislikes: [{
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      },
      dislikedAt: {
        type: Date,
        default: Date.now
      }
    }],
    isAccepted: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  expertReplies: [{
    expert: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: [2000, 'Expert reply content cannot be more than 2000 characters']
    },
    recommendations: [{
      type: String,
      maxlength: [500, 'Recommendation cannot be more than 500 characters']
    }],
    resources: [{
      title: String,
      url: String,
      type: {
        type: String,
        enum: ['article', 'video', 'document', 'website']
      }
    }],
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  relatedCrops: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Crop'
  }],
  status: {
    type: String,
    enum: ['active', 'closed', 'archived'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Update reply updatedAt when modified
ForumSchema.pre('save', function(next) {
  this.replies.forEach(reply => {
    if (reply.isModified()) {
      reply.updatedAt = new Date();
    }
  });
  next();
});

// Index for better query performance
ForumSchema.index({ category: 1, createdAt: -1 });
ForumSchema.index({ author: 1 });
ForumSchema.index({ tags: 1 });
ForumSchema.index({ status: 1 });
ForumSchema.index({ isPinned: -1, createdAt: -1 });

module.exports = mongoose.model('Forum', ForumSchema);
