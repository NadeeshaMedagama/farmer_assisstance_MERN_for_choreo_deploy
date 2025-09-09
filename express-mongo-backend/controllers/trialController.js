const Trial = require('../models/Trial');
const logger = require('../utils/logger');

// Register for trial
exports.registerTrial = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      company,
      position,
      farmName,
      farmSize,
      sizeUnit,
      address,
      city,
      state,
      country,
      latitude,
      longitude,
      crops,
      farmingExperience,
      currentChallenges,
      goals,
      trialType,
      duration,
      referralCode,
      source,
      notes
    } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !phone || !farmName || !farmSize || !address || !city || !state || !country) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: firstName, lastName, email, phone, farmName, farmSize, address, city, state, country'
      });
    }

    // Check if email already exists
    const existingTrial = await Trial.findOne({ 'user.email': email.toLowerCase() });
    if (existingTrial) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered for trial'
      });
    }

    // Create trial registration
    const trial = await Trial.create({
      user: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase(),
        phone: phone.trim(),
        company: company?.trim() || '',
        position: position?.trim() || ''
      },
      farm: {
        name: farmName.trim(),
        size: parseFloat(farmSize),
        sizeUnit: sizeUnit || 'acres',
        location: {
          address: address.trim(),
          city: city.trim(),
          state: state.trim(),
          country: country.trim(),
          coordinates: {
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null
          }
        },
        crops: crops || [],
        farmingExperience: farmingExperience || 0,
        currentChallenges: currentChallenges || [],
        goals: goals || []
      },
      trial: {
        type: trialType || 'basic',
        duration: duration || 14,
        features: getTrialFeatures(trialType || 'basic')
      },
      source: source || 'api',
      referral: {
        code: referralCode || null
      },
      notes: notes?.trim() || ''
    });

    logger.info(`New trial registration: ${trial._id} for ${trial.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Trial registration successful! Welcome to Farmer Assistance.',
      data: {
        id: trial._id,
        user: {
          name: trial.user.fullName,
          email: trial.user.email
        },
        farm: {
          name: trial.farm.name,
          location: `${trial.farm.location.city}, ${trial.farm.location.country}`
        },
        trial: {
          type: trial.trial.type,
          startDate: trial.trial.startDate,
          endDate: trial.trial.endDate,
          daysRemaining: trial.trial.daysRemaining,
          features: trial.trial.features
        }
      }
    });

  } catch (error) {
    logger.error('Trial registration error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered for trial'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during trial registration'
    });
  }
};

// Get trial features based on type
const getTrialFeatures = (trialType) => {
  const features = {
    basic: ['crop_management', 'weather_monitoring', 'market_prices', 'forum_access'],
    premium: ['crop_management', 'weather_monitoring', 'market_prices', 'forum_access', 'expert_consultation', 'mobile_app'],
    enterprise: ['crop_management', 'weather_monitoring', 'market_prices', 'forum_access', 'expert_consultation', 'mobile_app', 'api_access', 'custom_reports', 'priority_support']
  };
  return features[trialType] || features.basic;
};

// Get trial status
exports.getTrialStatus = async (req, res, next) => {
  try {
    const { email } = req.params;

    const trial = await Trial.findOne({ 
      'user.email': email.toLowerCase(),
      isActive: true 
    });

    if (!trial) {
      return res.status(404).json({
        success: false,
        message: 'Trial not found'
      });
    }

    // Update trial status if expired
    if (trial.trial.endDate <= new Date() && trial.trial.status === 'active') {
      trial.trial.status = 'expired';
      await trial.save();
    }

    res.json({
      success: true,
      data: {
        id: trial._id,
        user: {
          name: trial.user.fullName,
          email: trial.user.email
        },
        farm: {
          name: trial.farm.name,
          location: `${trial.farm.location.city}, ${trial.farm.location.country}`
        },
        trial: {
          type: trial.trial.type,
          status: trial.trial.status,
          startDate: trial.trial.startDate,
          endDate: trial.trial.endDate,
          daysRemaining: trial.trial.daysRemaining,
          features: trial.trial.features,
          usage: trial.trial.usage
        }
      }
    });

  } catch (error) {
    logger.error('Get trial status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching trial status'
    });
  }
};

// Get trial usage
exports.getTrialUsage = async (req, res, next) => {
  try {
    const { email } = req.params;

    const trial = await Trial.findOne({ 
      'user.email': email.toLowerCase(),
      isActive: true 
    });

    if (!trial) {
      return res.status(404).json({
        success: false,
        message: 'Trial not found'
      });
    }

    res.json({
      success: true,
      data: {
        email: trial.user.email,
        trialType: trial.trial.type,
        usage: trial.trial.usage,
        daysRemaining: trial.trial.daysRemaining,
        status: trial.trial.status
      }
    });

  } catch (error) {
    logger.error('Get trial usage error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching trial usage'
    });
  }
};

// Update trial usage
exports.updateTrialUsage = async (req, res, next) => {
  try {
    const { email } = req.params;
    const { apiCalls, loginCount } = req.body;

    const trial = await Trial.findOne({ 
      'user.email': email.toLowerCase(),
      isActive: true 
    });

    if (!trial) {
      return res.status(404).json({
        success: false,
        message: 'Trial not found'
      });
    }

    // Update usage statistics
    if (apiCalls !== undefined) {
      trial.trial.usage.apiCalls = apiCalls;
    }
    if (loginCount !== undefined) {
      trial.trial.usage.loginCount = loginCount;
    }
    trial.trial.usage.lastActive = new Date();

    await trial.save();

    res.json({
      success: true,
      message: 'Trial usage updated successfully',
      data: {
        usage: trial.trial.usage
      }
    });

  } catch (error) {
    logger.error('Update trial usage error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating trial usage'
    });
  }
};

// Get all trials (admin only)
exports.getAllTrials = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      trialType, 
      city,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    // Build filter
    const filter = { isActive: true };
    if (status) filter['trial.status'] = status;
    if (trialType) filter['trial.type'] = trialType;
    if (city) filter['farm.location.city'] = new RegExp(city, 'i');
    if (search) {
      filter.$or = [
        { 'user.firstName': { $regex: search, $options: 'i' } },
        { 'user.lastName': { $regex: search, $options: 'i' } },
        { 'user.email': { $regex: search, $options: 'i' } },
        { 'farm.name': { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const trials = await Trial.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Trial.countDocuments(filter);

    res.json({
      success: true,
      data: trials,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total: total
      }
    });

  } catch (error) {
    logger.error('Get all trials error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching trials'
    });
  }
};

// Convert trial to paid subscription
exports.convertTrial = async (req, res, next) => {
  try {
    const { email } = req.params;
    const { planId, paymentMethodId, paymentDetails } = req.body;

    const trial = await Trial.findOne({ 
      'user.email': email.toLowerCase(),
      isActive: true 
    });

    if (!trial) {
      return res.status(404).json({
        success: false,
        message: 'Trial not found'
      });
    }

    // Import required models
    const Subscription = require('../models/Subscription');
    const SubscriptionPlan = require('../models/SubscriptionPlan');
    const Payment = require('../models/Payment');
    const User = require('../models/User');

    // Find or create user
    let user = await User.findOne({ email: trial.user.email });
    if (!user) {
      user = await User.create({
        firstName: trial.user.firstName,
        lastName: trial.user.lastName,
        email: trial.user.email,
        phone: trial.user.phone,
        company: trial.user.company,
        position: trial.user.position
      });
    }

    // Get the subscription plan
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Subscription plan not found'
      });
    }

    // Create subscription
    const subscription = await Subscription.create({
      user: user._id,
      plan: planId,
      status: 'active',
      billing: {
        billingCycle: plan.price.billingCycle,
        amount: plan.price.amount,
        currency: plan.price.currency
      },
      trial: {
        isTrial: false
      },
      payment: {
        method: 'credit_card',
        paymentMethodId: paymentMethodId
      },
      features: plan.features.map(feature => ({
        name: feature.name,
        enabled: feature.included,
        limit: feature.limits
      }))
    });

    // Create payment record
    const payment = await Payment.create({
      user: user._id,
      subscription: subscription._id,
      paymentMethod: paymentMethodId,
      amount: plan.price.amount,
      currency: plan.price.currency,
      type: 'subscription',
      description: `Initial payment for ${plan.name} subscription`,
      provider: 'stripe',
      status: 'completed',
      providerData: {
        transactionId: `txn_${Date.now()}`,
        paymentDetails: paymentDetails
      },
      processedAt: new Date()
    });

    // Update trial status to converted
    trial.trial.status = 'converted';
    trial.notes = `Converted to ${plan.name} subscription. Payment: ${payment._id}`;
    await trial.save();

    logger.info(`Trial converted: ${trial._id} to subscription ${subscription._id}`);

    res.json({
      success: true,
      message: 'Trial successfully converted to paid subscription',
      data: {
        trialId: trial._id,
        subscriptionId: subscription._id,
        paymentId: payment._id,
        plan: {
          name: plan.name,
          type: plan.type,
          price: plan.price
        },
        status: 'active'
      }
    });

  } catch (error) {
    logger.error('Convert trial error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error converting trial'
    });
  }
};

// Cancel trial
exports.cancelTrial = async (req, res, next) => {
  try {
    const { email } = req.params;
    const { reason } = req.body;

    const trial = await Trial.findOne({ 
      'user.email': email.toLowerCase(),
      isActive: true 
    });

    if (!trial) {
      return res.status(404).json({
        success: false,
        message: 'Trial not found'
      });
    }

    // Update trial status to cancelled
    trial.trial.status = 'cancelled';
    trial.notes = `Trial cancelled. Reason: ${reason || 'Not specified'}`;
    await trial.save();

    logger.info(`Trial cancelled: ${trial._id}. Reason: ${reason}`);

    res.json({
      success: true,
      message: 'Trial cancelled successfully',
      data: {
        id: trial._id,
        status: trial.trial.status
      }
    });

  } catch (error) {
    logger.error('Cancel trial error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error cancelling trial'
    });
  }
};

// Get trial statistics (admin only)
exports.getTrialStats = async (req, res, next) => {
  try {
    const stats = await Trial.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$trial.status', 'active'] }, 1, 0] } },
          expired: { $sum: { $cond: [{ $eq: ['$trial.status', 'expired'] }, 1, 0] } },
          converted: { $sum: { $cond: [{ $eq: ['$trial.status', 'converted'] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$trial.status', 'cancelled'] }, 1, 0] } },
          basic: { $sum: { $cond: [{ $eq: ['$trial.type', 'basic'] }, 1, 0] } },
          premium: { $sum: { $cond: [{ $eq: ['$trial.type', 'premium'] }, 1, 0] } },
          enterprise: { $sum: { $cond: [{ $eq: ['$trial.type', 'enterprise'] }, 1, 0] } }
        }
      }
    ]);

    const cityStats = await Trial.aggregate([
      {
        $group: {
          _id: '$farm.location.city',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          total: 0,
          active: 0,
          expired: 0,
          converted: 0,
          cancelled: 0,
          basic: 0,
          premium: 0,
          enterprise: 0
        },
        byCity: cityStats
      }
    });

  } catch (error) {
    logger.error('Get trial stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching trial statistics'
    });
  }
};
