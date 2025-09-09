const Subscription = require('../models/Subscription');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const Payment = require('../models/Payment');
const logger = require('../utils/logger');

// Get user subscriptions
exports.getUserSubscriptions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const subscriptions = await Subscription.find({ user: userId, isActive: true })
      .populate('plan', 'name type price features')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: subscriptions.length,
      data: subscriptions
    });
    
  } catch (error) {
    logger.error('Get user subscriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching subscriptions'
    });
  }
};

// Get single subscription
exports.getSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id)
      .populate('plan', 'name type price features limits')
      .populate('user', 'firstName lastName email');
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }
    
    // Check if user owns this subscription
    if (subscription.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      data: subscription
    });
    
  } catch (error) {
    logger.error('Get subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching subscription'
    });
  }
};

// Create subscription
exports.createSubscription = async (req, res, next) => {
  try {
    const { planId, paymentMethodId, startTrial = true } = req.body;
    const userId = req.user.id;
    
    // Get the plan
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Subscription plan not found'
      });
    }
    
    // Check if user already has an active subscription
    const existingSubscription = await Subscription.findOne({
      user: userId,
      isActive: true,
      status: { $in: ['active', 'trialing'] }
    });
    
    if (existingSubscription) {
      return res.status(400).json({
        success: false,
        message: 'User already has an active subscription'
      });
    }
    
    // Create subscription
    const subscription = await Subscription.create({
      user: userId,
      plan: planId,
      billing: {
        billingCycle: plan.price.billingCycle,
        amount: plan.price.amount,
        currency: plan.price.currency
      },
      trial: {
        isTrial: startTrial,
        trialDays: plan.trialDays
      },
      payment: {
        method: 'credit_card', // This would be determined by payment method
        paymentMethodId: paymentMethodId
      },
      features: plan.features.map(feature => ({
        name: feature.name,
        enabled: feature.included,
        limit: typeof feature.limits === 'number' ? feature.limits : null
      }))
    });
    
    // Populate the subscription
    await subscription.populate('plan', 'name type price features');
    
    logger.info(`New subscription created: ${subscription._id} for user ${userId}`);
    
    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: subscription
    });
    
  } catch (error) {
    logger.error('Create subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating subscription'
    });
  }
};

// Update subscription
exports.updateSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }
    
    // Check if user owns this subscription
    if (subscription.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Update subscription
    const updatedSubscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('plan', 'name type price features');
    
    logger.info(`Subscription updated: ${subscription._id}`);
    
    res.json({
      success: true,
      message: 'Subscription updated successfully',
      data: updatedSubscription
    });
    
  } catch (error) {
    logger.error('Update subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating subscription'
    });
  }
};

// Cancel subscription
exports.cancelSubscription = async (req, res, next) => {
  try {
    const { reason, effectiveDate } = req.body;
    const subscription = await Subscription.findById(req.params.id);
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }
    
    // Check if user owns this subscription
    if (subscription.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Update subscription
    subscription.status = 'cancelled';
    subscription.cancellation = {
      requestedAt: new Date(),
      reason: reason,
      effectiveDate: effectiveDate || subscription.billing.endDate
    };
    
    await subscription.save();
    
    logger.info(`Subscription cancelled: ${subscription._id} by user ${req.user.id}`);
    
    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
      data: subscription
    });
    
  } catch (error) {
    logger.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error cancelling subscription'
    });
  }
};

// Get subscription usage
exports.getSubscriptionUsage = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id)
      .populate('plan', 'limits');
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }
    
    // Check if user owns this subscription
    if (subscription.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      data: {
        usage: subscription.usage,
        limits: subscription.plan.limits,
        features: subscription.features
      }
    });
    
  } catch (error) {
    logger.error('Get subscription usage error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching subscription usage'
    });
  }
};

// Update subscription usage
exports.updateSubscriptionUsage = async (req, res, next) => {
  try {
    const { apiCalls, loginCount } = req.body;
    const subscription = await Subscription.findById(req.params.id);
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }
    
    // Check if user owns this subscription
    if (subscription.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Update usage
    if (apiCalls !== undefined) {
      subscription.usage.apiCalls = apiCalls;
    }
    if (loginCount !== undefined) {
      subscription.usage.loginCount = loginCount;
    }
    subscription.usage.lastActive = new Date();
    
    await subscription.save();
    
    res.json({
      success: true,
      message: 'Subscription usage updated successfully',
      data: subscription.usage
    });
    
  } catch (error) {
    logger.error('Update subscription usage error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating subscription usage'
    });
  }
};

// Get all subscriptions (admin only)
exports.getAllSubscriptions = async (req, res, next) => {
  try {
    const { status, plan, user } = req.query;
    
    let query = { isActive: true };
    
    if (status) {
      query.status = status;
    }
    
    if (plan) {
      query.plan = plan;
    }
    
    if (user) {
      query.user = user;
    }
    
    const subscriptions = await Subscription.find(query)
      .populate('user', 'firstName lastName email')
      .populate('plan', 'name type price')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: subscriptions.length,
      data: subscriptions
    });
    
  } catch (error) {
    logger.error('Get all subscriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching subscriptions'
    });
  }
};
