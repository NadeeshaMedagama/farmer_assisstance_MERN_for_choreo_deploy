const mongoose = require('mongoose');

const MarketSchema = new mongoose.Schema({
  crop: {
    name: {
      type: String,
      required: [true, 'Please add crop name'],
      trim: true
    },
    variety: String,
    type: {
      type: String,
      enum: ['vegetable', 'fruit', 'grain', 'legume', 'herb', 'spice', 'other'],
      required: true
    },
    grade: {
      type: String,
      enum: ['A', 'B', 'C', 'premium', 'standard', 'commercial'],
      default: 'standard'
    }
  },
  location: {
    market: {
      type: String,
      required: [true, 'Please add market name']
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
      latitude: Number,
      longitude: Number
    }
  },
  prices: {
    wholesale: {
      min: {
        type: Number,
        required: true,
        min: 0
      },
      max: {
        type: Number,
        required: true,
        min: 0
      },
      average: {
        type: Number,
        required: true,
        min: 0
      },
      unit: {
        type: String,
        required: true,
        enum: ['kg', 'lbs', 'quintal', 'ton', 'piece', 'dozen', 'bunch']
      }
    },
    retail: {
      min: {
        type: Number,
        min: 0
      },
      max: {
        type: Number,
        min: 0
      },
      average: {
        type: Number,
        min: 0
      },
      unit: {
        type: String,
        enum: ['kg', 'lbs', 'quintal', 'ton', 'piece', 'dozen', 'bunch']
      }
    }
  },
  volume: {
    available: {
      type: Number,
      min: 0
    },
    unit: {
      type: String,
      enum: ['kg', 'lbs', 'quintal', 'ton', 'pieces', 'dozens', 'bunches']
    }
  },
  quality: {
    freshness: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor']
    },
    appearance: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor']
    },
    size: {
      type: String,
      enum: ['large', 'medium', 'small', 'mixed']
    }
  },
  demand: {
    level: {
      type: String,
      enum: ['very_high', 'high', 'medium', 'low', 'very_low'],
      required: true
    },
    trend: {
      type: String,
      enum: ['increasing', 'stable', 'decreasing'],
      required: true
    }
  },
  supply: {
    level: {
      type: String,
      enum: ['very_high', 'high', 'medium', 'low', 'very_low'],
      required: true
    },
    trend: {
      type: String,
      enum: ['increasing', 'stable', 'decreasing'],
      required: true
    }
  },
  seasonality: {
    isInSeason: {
      type: Boolean,
      required: true
    },
    peakSeason: {
      start: Date,
      end: Date
    }
  },
  marketConditions: {
    weatherImpact: {
      type: String,
      enum: ['positive', 'neutral', 'negative']
    },
    transportation: {
      cost: Number,
      availability: {
        type: String,
        enum: ['excellent', 'good', 'fair', 'poor']
      }
    },
    competition: {
      level: {
        type: String,
        enum: ['high', 'medium', 'low']
      },
      mainCompetitors: [String]
    }
  },
  priceHistory: [{
    date: {
      type: Date,
      required: true
    },
    wholesale: {
      min: Number,
      max: Number,
      average: Number
    },
    retail: {
      min: Number,
      max: Number,
      average: Number
    },
    volume: Number,
    demand: {
      type: String,
      enum: ['very_high', 'high', 'medium', 'low', 'very_low']
    },
    supply: {
      type: String,
      enum: ['very_high', 'high', 'medium', 'low', 'very_low']
    }
  }],
  predictions: {
    nextWeek: {
      price: {
        min: Number,
        max: Number,
        average: Number
      },
      trend: {
        type: String,
        enum: ['up', 'down', 'stable']
      },
      confidence: {
        type: Number,
        min: 0,
        max: 100
      }
    },
    nextMonth: {
      price: {
        min: Number,
        max: Number,
        average: Number
      },
      trend: {
        type: String,
        enum: ['up', 'down', 'stable']
      },
      confidence: {
        type: Number,
        min: 0,
        max: 100
      }
    }
  },
  dataSource: {
    provider: {
      type: String,
      required: true
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    reliability: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
MarketSchema.index({ 'crop.name': 1, 'location.city': 1 });
MarketSchema.index({ 'location.city': 1, 'location.state': 1 });
MarketSchema.index({ 'prices.wholesale.average': -1 });
MarketSchema.index({ 'demand.level': 1 });
MarketSchema.index({ 'supply.level': 1 });
MarketSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Market', MarketSchema);
