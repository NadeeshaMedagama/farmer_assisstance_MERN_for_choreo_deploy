const mongoose = require('mongoose');

const WeatherSchema = new mongoose.Schema({
  location: {
    name: {
      type: String,
      required: true
    },
    coordinates: {
      latitude: {
        type: Number,
        required: true,
        min: -90,
        max: 90
      },
      longitude: {
        type: Number,
        required: true,
        min: -180,
        max: 180
      }
    },
    address: {
      city: String,
      state: String,
      country: String
    }
  },
  current: {
    temperature: {
      value: {
        type: Number,
        required: true
      },
      unit: {
        type: String,
        enum: ['celsius', 'fahrenheit'],
        default: 'celsius'
      },
      feelsLike: Number
    },
    humidity: {
      type: Number,
      min: 0,
      max: 100
    },
    pressure: {
      type: Number,
      min: 0
    },
    wind: {
      speed: {
        type: Number,
        min: 0
      },
      direction: {
        type: Number,
        min: 0,
        max: 360
      },
      unit: {
        type: String,
        enum: ['kmh', 'mph', 'ms'],
        default: 'kmh'
      }
    },
    visibility: {
      type: Number,
      min: 0
    },
    uvIndex: {
      type: Number,
      min: 0,
      max: 11
    },
    conditions: {
      main: {
        type: String,
        required: true
      },
      description: String,
      icon: String
    },
    sunrise: Date,
    sunset: Date,
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  forecast: [{
    date: {
      type: Date,
      required: true
    },
    temperature: {
      min: Number,
      max: Number,
      average: Number
    },
    humidity: Number,
    precipitation: {
      probability: {
        type: Number,
        min: 0,
        max: 100
      },
      amount: Number,
      unit: {
        type: String,
        enum: ['mm', 'inches'],
        default: 'mm'
      }
    },
    wind: {
      speed: Number,
      direction: Number
    },
    conditions: {
      main: String,
      description: String,
      icon: String
    },
    uvIndex: Number
  }],
  alerts: [{
    type: {
      type: String,
      enum: ['warning', 'watch', 'advisory', 'statement']
    },
    severity: {
      type: String,
      enum: ['minor', 'moderate', 'severe', 'extreme']
    },
    title: String,
    description: String,
    startTime: Date,
    endTime: Date,
    areas: [String]
  }],
  agriculturalData: {
    soilTemperature: Number,
    soilMoisture: Number,
    growingDegreeDays: Number,
    chillHours: Number,
    frostRisk: {
      type: String,
      enum: ['low', 'medium', 'high', 'extreme']
    },
    irrigationRecommendation: {
      type: String,
      enum: ['not_needed', 'light', 'moderate', 'heavy']
    },
    pestRisk: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    diseaseRisk: {
      type: String,
      enum: ['low', 'medium', 'high']
    }
  },
  dataSource: {
    provider: {
      type: String,
      required: true
    },
    apiVersion: String,
    lastUpdated: {
      type: Date,
      default: Date.now
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
WeatherSchema.index({ 'location.coordinates.latitude': 1, 'location.coordinates.longitude': 1 });
WeatherSchema.index({ 'current.timestamp': -1 });
WeatherSchema.index({ 'forecast.date': 1 });
WeatherSchema.index({ isActive: 1 });

module.exports = mongoose.model('Weather', WeatherSchema);
