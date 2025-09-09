const Subscriber = require('../models/Subscriber');
const logger = require('../utils/logger');

// Subscribe to newsletter
exports.subscribe = async (req, res, next) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if email already exists and is active
    const existingSubscriber = await Subscriber.findOne({ 
      email: email.toLowerCase(),
      isActive: true 
    });

    if (existingSubscriber) {
      return res.status(400).json({
        success: false,
        message: 'Email is already subscribed'
      });
    }

    // Create new subscriber
    const subscriber = await Subscriber.create({
      email: email.toLowerCase(),
      name: name || '',
      source: 'api'
    });

    logger.info(`New subscriber added: ${subscriber.email}`);

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to newsletter',
      data: {
        id: subscriber._id,
        email: subscriber.email,
        subscriptionDate: subscriber.subscriptionDate
      }
    });

  } catch (error) {
    logger.error('Subscribe error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email is already subscribed'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during subscription'
    });
  }
};

// Unsubscribe from newsletter
exports.unsubscribe = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const subscriber = await Subscriber.findOneAndUpdate(
      { email: email.toLowerCase(), isActive: true },
      { 
        isActive: false,
        unsubscribedAt: new Date()
      },
      { new: true }
    );

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Email not found in subscribers list'
      });
    }

    logger.info(`Subscriber unsubscribed: ${subscriber.email}`);

    res.json({
      success: true,
      message: 'Successfully unsubscribed from newsletter'
    });

  } catch (error) {
    logger.error('Unsubscribe error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during unsubscription'
    });
  }
};

// Get all subscribers (admin only)
exports.getAllSubscribers = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, active = true } = req.query;
    
    const filter = {};
    if (active !== undefined) {
      filter.isActive = active === 'true';
    }

    const subscribers = await Subscriber.find(filter)
      .sort({ subscriptionDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Subscriber.countDocuments(filter);

    res.json({
      success: true,
      data: subscribers,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total: total
      }
    });

  } catch (error) {
    logger.error('Get subscribers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching subscribers'
    });
  }
};

// Get subscriber by email
exports.getSubscriber = async (req, res, next) => {
  try {
    const { email } = req.params;

    const subscriber = await Subscriber.findOne({ 
      email: email.toLowerCase() 
    });

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Subscriber not found'
      });
    }

    res.json({
      success: true,
      data: subscriber
    });

  } catch (error) {
    logger.error('Get subscriber error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching subscriber'
    });
  }
};

// Update subscriber preferences
exports.updatePreferences = async (req, res, next) => {
  try {
    const { email } = req.params;
    const { preferences } = req.body;

    const subscriber = await Subscriber.findOneAndUpdate(
      { email: email.toLowerCase() },
      { preferences: { ...subscriber?.preferences, ...preferences } },
      { new: true }
    );

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Subscriber not found'
      });
    }

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: subscriber
    });

  } catch (error) {
    logger.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating preferences'
    });
  }
};
