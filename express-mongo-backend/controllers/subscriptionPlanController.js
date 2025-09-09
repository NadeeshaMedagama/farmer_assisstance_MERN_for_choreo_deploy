const SubscriptionPlan = require('../models/SubscriptionPlan');
const logger = require('../utils/logger');

// Get all subscription plans
exports.getPlans = async (req, res, next) => {
  try {
    const { type, active, popular } = req.query;
    
    let query = {};
    
    if (type) {
      query.type = type;
    }
    
    if (active !== undefined) {
      query.isActive = active === 'true';
    }
    
    if (popular !== undefined) {
      query.isPopular = popular === 'true';
    }
    
    const plans = await SubscriptionPlan.find(query)
      .sort({ sortOrder: 1, createdAt: 1 })
      .select('-metadata');
    
    res.json({
      success: true,
      count: plans.length,
      data: plans
    });
    
  } catch (error) {
    logger.error('Get subscription plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching subscription plans'
    });
  }
};

// Get single subscription plan
exports.getPlan = async (req, res, next) => {
  try {
    const plan = await SubscriptionPlan.findById(req.params.id);
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Subscription plan not found'
      });
    }
    
    res.json({
      success: true,
      data: plan
    });
    
  } catch (error) {
    logger.error('Get subscription plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching subscription plan'
    });
  }
};

// Create subscription plan (admin only)
exports.createPlan = async (req, res, next) => {
  try {
    const plan = await SubscriptionPlan.create(req.body);
    
    logger.info(`New subscription plan created: ${plan._id} - ${plan.name}`);
    
    res.status(201).json({
      success: true,
      message: 'Subscription plan created successfully',
      data: plan
    });
    
  } catch (error) {
    logger.error('Create subscription plan error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Plan name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error creating subscription plan'
    });
  }
};

// Update subscription plan (admin only)
exports.updatePlan = async (req, res, next) => {
  try {
    const plan = await SubscriptionPlan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Subscription plan not found'
      });
    }
    
    logger.info(`Subscription plan updated: ${plan._id} - ${plan.name}`);
    
    res.json({
      success: true,
      message: 'Subscription plan updated successfully',
      data: plan
    });
    
  } catch (error) {
    logger.error('Update subscription plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating subscription plan'
    });
  }
};

// Delete subscription plan (admin only)
exports.deletePlan = async (req, res, next) => {
  try {
    const plan = await SubscriptionPlan.findByIdAndDelete(req.params.id);
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Subscription plan not found'
      });
    }
    
    logger.info(`Subscription plan deleted: ${plan._id} - ${plan.name}`);
    
    res.json({
      success: true,
      message: 'Subscription plan deleted successfully'
    });
    
  } catch (error) {
    logger.error('Delete subscription plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting subscription plan'
    });
  }
};

// Get plan features
exports.getPlanFeatures = async (req, res, next) => {
  try {
    const plan = await SubscriptionPlan.findById(req.params.id)
      .select('features limits');
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Subscription plan not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        features: plan.features,
        limits: plan.limits
      }
    });
    
  } catch (error) {
    logger.error('Get plan features error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching plan features'
    });
  }
};

// Bulk create subscription plans (admin only)
exports.bulkCreatePlans = async (req, res, next) => {
  try {
    const { plans } = req.body;
    
    if (!plans || !Array.isArray(plans) || plans.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Plans array is required and must not be empty'
      });
    }
    
    // Validate each plan before creating
    const validationErrors = [];
    const validPlans = [];
    
    for (let i = 0; i < plans.length; i++) {
      const plan = plans[i];
      
      // Check required fields
      if (!plan.name || !plan.description || !plan.type || !plan.price) {
        validationErrors.push(`Plan ${i + 1}: Missing required fields (name, description, type, price)`);
        continue;
      }
      
      if (!plan.price.amount || !plan.price.currency || !plan.price.billingCycle) {
        validationErrors.push(`Plan ${i + 1}: Missing required price fields (amount, currency, billingCycle)`);
        continue;
      }
      
      // Check if plan name already exists
      const existingPlan = await SubscriptionPlan.findOne({ name: plan.name });
      if (existingPlan) {
        validationErrors.push(`Plan ${i + 1}: Plan name "${plan.name}" already exists`);
        continue;
      }
      
      validPlans.push(plan);
    }
    
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors found',
        errors: validationErrors
      });
    }
    
    // Create all valid plans
    const createdPlans = await SubscriptionPlan.insertMany(validPlans);
    
    logger.info(`Bulk created ${createdPlans.length} subscription plans`);
    
    res.status(201).json({
      success: true,
      message: `Successfully created ${createdPlans.length} subscription plans`,
      count: createdPlans.length,
      data: createdPlans
    });
    
  } catch (error) {
    logger.error('Bulk create subscription plans error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'One or more plan names already exist'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error creating subscription plans'
    });
  }
};
