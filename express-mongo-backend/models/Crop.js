const mongoose = require('mongoose');

const CropSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a crop name'],
    trim: true,
    maxlength: [100, 'Crop name cannot be more than 100 characters']
  },
  variety: {
    type: String,
    trim: true,
    maxlength: [100, 'Variety cannot be more than 100 characters']
  },
  type: {
    type: String,
    required: [true, 'Please add a crop type'],
    enum: ['vegetable', 'fruit', 'grain', 'legume', 'herb', 'spice', 'other'],
    default: 'vegetable'
  },
  plantingDate: {
    type: Date,
    required: [true, 'Please add a planting date']
  },
  expectedHarvestDate: {
    type: Date,
    required: [true, 'Please add an expected harvest date']
  },
  actualHarvestDate: {
    type: Date
  },
  area: {
    type: Number,
    required: [true, 'Please add the area planted'],
    min: [0, 'Area cannot be negative']
  },
  unit: {
    type: String,
    enum: ['acres', 'hectares', 'square_meters'],
    default: 'acres'
  },
  plantingMethod: {
    type: String,
    enum: ['direct_seeding', 'transplanting', 'bulb_planting', 'cutting', 'other'],
    default: 'direct_seeding'
  },
  soilType: {
    type: String,
    enum: ['clay', 'sandy', 'loamy', 'silty', 'peaty', 'chalky', 'unknown'],
    default: 'unknown'
  },
  irrigationMethod: {
    type: String,
    enum: ['drip', 'sprinkler', 'flood', 'manual', 'rainfed'],
    default: 'manual'
  },
  fertilizerUsed: [{
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['organic', 'inorganic', 'mixed'],
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      enum: ['kg', 'lbs', 'tons', 'liters', 'gallons'],
      required: true
    },
    applicationDate: {
      type: Date,
      required: true
    }
  }],
  pesticidesUsed: [{
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['herbicide', 'insecticide', 'fungicide', 'other'],
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      enum: ['ml', 'liters', 'grams', 'kg', 'lbs'],
      required: true
    },
    applicationDate: {
      type: Date,
      required: true
    }
  }],
  yield: {
    expected: {
      type: Number,
      min: 0
    },
    actual: {
      type: Number,
      min: 0
    },
    unit: {
      type: String,
      enum: ['kg', 'lbs', 'tons', 'bushels', 'quintals'],
      default: 'kg'
    }
  },
  cost: {
    seeds: {
      type: Number,
      min: 0,
      default: 0
    },
    fertilizer: {
      type: Number,
      min: 0,
      default: 0
    },
    pesticides: {
      type: Number,
      min: 0,
      default: 0
    },
    labor: {
      type: Number,
      min: 0,
      default: 0
    },
    irrigation: {
      type: Number,
      min: 0,
      default: 0
    },
    other: {
      type: Number,
      min: 0,
      default: 0
    },
    total: {
      type: Number,
      min: 0,
      default: 0
    }
  },
  revenue: {
    type: Number,
    min: 0,
    default: 0
  },
  profit: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['planted', 'growing', 'flowering', 'fruiting', 'harvested', 'failed'],
    default: 'planted'
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot be more than 1000 characters']
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
  farmer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    address: String,
    city: String,
    state: String,
    country: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  weatherData: [{
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
    rainfall: Number,
    windSpeed: Number,
    conditions: String
  }],
  growthStages: [{
    stage: {
      type: String,
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: Date,
    notes: String,
    images: [String]
  }]
}, {
  timestamps: true
});

// Calculate profit before saving
CropSchema.pre('save', function(next) {
  if (this.cost.total && this.revenue) {
    this.profit = this.revenue - this.cost.total;
  }
  next();
});

// Index for better query performance
CropSchema.index({ farmer: 1, plantingDate: -1 });
CropSchema.index({ status: 1 });
CropSchema.index({ type: 1 });

module.exports = mongoose.model('Crop', CropSchema);
