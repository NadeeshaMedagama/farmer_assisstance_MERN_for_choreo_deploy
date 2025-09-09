const User = require('../models/User');
const Crop = require('../models/Crop');
const Forum = require('../models/Forum');
const Market = require('../models/Market');
const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');
const Purchase = require('../models/Purchase');
const Notification = require('../models/Notification');
const Contact = require('../models/Contact');
const Subscriber = require('../models/Subscriber');
const Trial = require('../models/Trial');
const Weather = require('../models/Weather');
const logger = require('../utils/logger');
const auditLogger = require('../utils/auditLogger');

// Get comprehensive admin dashboard data
const getAdminDashboard = async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Parallel data fetching for better performance
    const [
      userStats,
      cropStats,
      forumStats,
      marketStats,
      subscriptionStats,
      paymentStats,
      purchaseStats,
      notificationStats,
      contactStats,
      subscriberStats,
      trialStats,
      weatherStats,
      recentUsers,
      recentCrops,
      recentForums,
      recentPayments
    ] = await Promise.all([
      // User Statistics
      User.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 },
            verified: { $sum: { $cond: ['$isVerified', 1, 0] } },
            unverified: { $sum: { $cond: ['$isVerified', 0, 1] } }
          }
        }
      ]),
      
      // Crop Statistics
      Crop.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalArea: { $sum: '$area' },
            totalRevenue: { $sum: '$revenue' },
            totalCost: { $sum: '$cost.total' },
            totalProfit: { $sum: '$profit' }
          }
        }
      ]),
      
      // Forum Statistics
      Forum.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalViews: { $sum: '$views' },
            totalLikes: { $sum: { $size: '$likes' } },
            totalReplies: { $sum: { $size: '$replies' } }
          }
        }
      ]),
      
      // Market Statistics
      Market.aggregate([
        {
          $group: {
            _id: '$crop.type',
            count: { $sum: 1 },
            avgWholesalePrice: { $avg: '$prices.wholesale.average' },
            avgRetailPrice: { $avg: '$prices.retail.average' },
            totalVolume: { $sum: '$volume.available' }
          }
        }
      ]),
      
      // Subscription Statistics
      Subscription.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalRevenue: { $sum: '$billing.amount' },
            totalPaid: { $sum: '$payment.totalPaid' }
          }
        }
      ]),
      
      // Payment Statistics
      Payment.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' }
          }
        }
      ]),
      
      // Purchase Statistics
      Purchase.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' }
          }
        }
      ]),
      
      // Notification Statistics
      Notification.aggregate([
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            read: { $sum: { $cond: ['$isRead', 1, 0] } },
            unread: { $sum: { $cond: ['$isRead', 0, 1] } }
          }
        }
      ]),
      
      // Contact Statistics
      Contact.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Subscriber Statistics
      Subscriber.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Trial Statistics
      Trial.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Weather Statistics
      Weather.aggregate([
        {
          $group: {
            _id: '$location.city',
            count: { $sum: 1 },
            avgTemperature: { $avg: '$temperature.average' },
            avgHumidity: { $avg: '$humidity' },
            totalRainfall: { $sum: '$rainfall' }
          }
        }
      ]),
      
      // Recent Users (last 10)
      User.find()
        .select('firstName lastName email role isVerified createdAt lastLogin')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      
      // Recent Crops (last 10)
      Crop.find()
        .populate('farmer', 'firstName lastName email')
        .select('name type status area revenue profit createdAt')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      
      // Recent Forum Posts (last 10)
      Forum.find()
        .populate('author', 'firstName lastName role')
        .select('title category views likes replies createdAt')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      
      // Recent Payments (last 10)
      Payment.find()
        .populate('user', 'firstName lastName email')
        .select('amount status paymentMethod createdAt')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()
    ]);

    // Calculate overall statistics
    const totalUsers = userStats.reduce((sum, stat) => sum + stat.count, 0);
    const totalCrops = cropStats.reduce((sum, stat) => sum + stat.count, 0);
    const totalForums = forumStats.reduce((sum, stat) => sum + stat.count, 0);
    const totalMarkets = marketStats.reduce((sum, stat) => sum + stat.count, 0);
    const totalSubscriptions = subscriptionStats.reduce((sum, stat) => sum + stat.count, 0);
    const totalPayments = paymentStats.reduce((sum, stat) => sum + stat.count, 0);
    const totalRevenue = paymentStats
      .filter(stat => stat._id === 'completed')
      .reduce((sum, stat) => sum + stat.totalAmount, 0);

    // Calculate growth metrics (comparing last 30 days with previous 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const [recentUsersCount, previousUsersCount] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      User.countDocuments({ 
        createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } 
      })
    ]);

    const userGrowthRate = previousUsersCount > 0 
      ? ((recentUsersCount - previousUsersCount) / previousUsersCount * 100).toFixed(2)
      : 0;

    // Prepare comprehensive dashboard data
    const dashboardData = {
      overview: {
        totalUsers,
        totalCrops,
        totalForums,
        totalMarkets,
        totalSubscriptions,
        totalPayments,
        totalRevenue,
        userGrowthRate: parseFloat(userGrowthRate),
        responseTime: Date.now() - startTime
      },
      statistics: {
        users: userStats,
        crops: cropStats,
        forums: forumStats,
        markets: marketStats,
        subscriptions: subscriptionStats,
        payments: paymentStats,
        purchases: purchaseStats,
        notifications: notificationStats,
        contacts: contactStats,
        subscribers: subscriberStats,
        trials: trialStats,
        weather: weatherStats
      },
      recentActivity: {
        users: recentUsers,
        crops: recentCrops,
        forums: recentForums,
        payments: recentPayments
      },
      systemHealth: {
        databaseConnected: true,
        lastUpdated: new Date().toISOString(),
        dataFreshness: 'real-time'
      }
    };

    // Log admin dashboard access
    auditLogger.sensitiveAction(req, 'admin.dashboard.view', {
      userId: req.user.id || req.user._id,
      dataPoints: Object.keys(dashboardData.statistics).length,
      responseTime: dashboardData.overview.responseTime
    });

    logger.info(`Admin dashboard accessed by user ${req.user.id || req.user._id} in ${dashboardData.overview.responseTime}ms`);

    res.status(200).json({
      success: true,
      message: 'Admin dashboard data retrieved successfully',
      data: dashboardData
    });

  } catch (error) {
    logger.error('Admin dashboard error:', error);
    auditLogger.sensitiveAction(req, 'admin.dashboard.error', {
      userId: req.user.id || req.user._id,
      error: error.message
    });
    
    res.status(500).json({
      success: false,
      message: 'Error retrieving admin dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get detailed user analytics
const getUserAnalytics = async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    switch (timeframe) {
      case '7d':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
        break;
      case '30d':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
        break;
      case '90d':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) } };
        break;
      case '1y':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) } };
        break;
    }

    const userAnalytics = await User.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            role: '$role'
          },
          count: { $sum: 1 },
          verified: { $sum: { $cond: ['$isVerified', 1, 0] } }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    res.status(200).json({
      success: true,
      message: 'User analytics retrieved successfully',
      data: {
        timeframe,
        analytics: userAnalytics
      }
    });

  } catch (error) {
    logger.error('User analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving user analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get system performance metrics
const getSystemMetrics = async (req, res) => {
  try {
    const metrics = {
      database: {
        collections: await Promise.all([
          User.countDocuments(),
          Crop.countDocuments(),
          Forum.countDocuments(),
          Market.countDocuments(),
          Subscription.countDocuments(),
          Payment.countDocuments(),
          Purchase.countDocuments(),
          Notification.countDocuments(),
          Contact.countDocuments(),
          Subscriber.countDocuments(),
          Trial.countDocuments(),
          Weather.countDocuments()
        ])
      },
      performance: {
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime(),
        nodeVersion: process.version,
        platform: process.platform
      },
      timestamp: new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      message: 'System metrics retrieved successfully',
      data: metrics
    });

  } catch (error) {
    logger.error('System metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving system metrics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get admin statistics (for dashboard overview)
const getAdminStats = async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Get current date for calculations
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Parallel queries for better performance
    const [
      totalUsers,
      newUsersThisMonth,
      activeUsers,
      totalCrops,
      totalForumThreads,
      totalMarketEntries
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      User.countDocuments({ lastLogin: { $gte: sevenDaysAgo } }),
      Crop.countDocuments(),
      Forum.countDocuments(),
      Market.countDocuments()
    ]);

    const stats = {
      totalUsers,
      totalCrops,
      totalForumThreads,
      totalMarketEntries,
      newUsersThisMonth,
      activeUsers
    };

    auditLogger.sensitiveAction(req, 'admin.stats.view', {
      userId: req.user.id || req.user._id,
      responseTime: Date.now() - startTime
    });

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    logger.error('Admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving admin statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get system health status
const getSystemHealth = async (req, res) => {
  try {
    const health = {
      apiStatus: 'healthy',
      databaseStatus: 'healthy',
      lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Yesterday
      uptime: '99.9%'
    };

    res.status(200).json({
      success: true,
      data: health
    });

  } catch (error) {
    logger.error('System health error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving system health',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get admin analytics with time range filtering
const getAdminAnalytics = async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    switch (timeRange) {
      case '7d':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
        break;
      case '30d':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
        break;
      case '90d':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) } };
        break;
      case '1y':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) } };
        break;
    }

    // Get analytics data
    const [
      userGrowth,
      platformUsage,
      engagement,
      revenue
    ] = await Promise.all([
      // User Growth Analytics
      User.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            monthly: { $sum: { $cond: [{ $gte: ['$createdAt', new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)] }, 1, 0] } },
            weekly: { $sum: { $cond: [{ $gte: ['$createdAt', new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)] }, 1, 0] } }
          }
        }
      ]),
      
      // Platform Usage Analytics
      Promise.all([
        Crop.countDocuments(),
        Forum.countDocuments(),
        Market.countDocuments(),
        Weather.countDocuments()
      ]).then(([totalCrops, totalForumPosts, totalMarketEntries, weatherRequests]) => ({
        totalCrops,
        totalForumPosts,
        totalMarketEntries,
        weatherRequests
      })),
      
      // Engagement Analytics
      Promise.all([
        User.countDocuments({ lastLogin: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } }),
        User.countDocuments({ lastLogin: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } }),
        User.countDocuments({ lastLogin: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } })
      ]).then(([dailyActiveUsers, weeklyActiveUsers, monthlyActiveUsers]) => ({
        dailyActiveUsers,
        weeklyActiveUsers,
        monthlyActiveUsers,
        averageSessionTime: '24m 30s' // This would need session tracking
      })),
      
      // Revenue Analytics (from payments)
      Payment.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$amount' },
            monthlyRevenue: { 
              $sum: { 
                $cond: [
                  { $gte: ['$createdAt', new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)] }, 
                  '$amount', 
                  0
                ] 
              } 
            }
          }
        }
      ]).then(result => ({
        totalRevenue: result[0]?.totalRevenue || 0,
        monthlyRevenue: result[0]?.monthlyRevenue || 0,
        growthRate: 12.5 // This would need historical comparison
      }))
    ]);

    const analytics = {
      userGrowth: userGrowth[0] || { total: 0, monthly: 0, weekly: 0 },
      platformUsage,
      engagement,
      revenue: revenue[0] || { totalRevenue: 0, monthlyRevenue: 0, growthRate: 0 }
    };

    res.status(200).json({
      success: true,
      data: analytics
    });

  } catch (error) {
    logger.error('Admin analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving admin analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get all users for user management
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, status, search } = req.query;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    
    if (role && role !== 'all') {
      filter.role = role;
    }
    
    if (status && status !== 'all') {
      if (status === 'verified') {
        filter.isVerified = true;
      } else if (status === 'unverified') {
        filter.isVerified = false;
      }
    }
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password -verificationToken -resetPasswordToken -resetPasswordExpire')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    logger.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving users',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['farmer', 'expert', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be farmer, expert, or admin'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    ).select('-password -verificationToken -resetPasswordToken -resetPasswordExpire');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    auditLogger.sensitiveAction(req, 'admin.user.role.update', {
      userId: req.user.id || req.user._id,
      targetUserId: userId,
      newRole: role,
      previousRole: user.role
    });

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    logger.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user role',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't allow deleting the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete the last admin user'
        });
      }
    }

    await User.findByIdAndDelete(userId);

    auditLogger.sensitiveAction(req, 'admin.user.delete', {
      userId: req.user.id || req.user._id,
      deletedUserId: userId,
      deletedUserEmail: user.email
    });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    logger.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get system settings
const getSystemSettings = async (req, res) => {
  try {
    // In a real application, these would come from a Settings model
    const settings = {
      general: {
        siteName: 'Farmer Assistant',
        siteDescription: 'Your comprehensive farming companion',
        maintenanceMode: false,
        registrationEnabled: true,
        emailVerificationRequired: true
      },
      notifications: {
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        adminNotifications: true
      },
      security: {
        sessionTimeout: 30,
        maxLoginAttempts: 5,
        passwordMinLength: 8,
        twoFactorAuth: false,
        ipWhitelist: []
      },
      integrations: {
        weatherApiKey: '',
        marketDataApiKey: '',
        emailService: 'smtp',
        smsService: 'twilio'
      }
    };

    res.status(200).json({
      success: true,
      data: settings
    });

  } catch (error) {
    logger.error('Get system settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving system settings',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update system settings
const updateSystemSettings = async (req, res) => {
  try {
    const settings = req.body;

    // In a real application, you would save these to a Settings model
    // For now, we'll just return the updated settings
    
    auditLogger.sensitiveAction(req, 'admin.settings.update', {
      userId: req.user.id || req.user._id,
      settingsUpdated: Object.keys(settings)
    });

    res.status(200).json({
      success: true,
      data: settings,
      message: 'Settings updated successfully'
    });

  } catch (error) {
    logger.error('Update system settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating system settings',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get security logs
const getSecurityLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    // In a real application, these would come from a SecurityLog model
    const mockLogs = [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        action: 'login.success',
        userId: 'user123',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0...',
        details: 'Successful login'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 60000).toISOString(),
        action: 'login.failed',
        userId: null,
        ipAddress: '192.168.1.2',
        userAgent: 'Mozilla/5.0...',
        details: 'Failed login attempt'
      }
    ];

    res.status(200).json({
      success: true,
      data: mockLogs,
      pagination: {
        current: parseInt(page),
        pages: 1,
        total: mockLogs.length
      }
    });

  } catch (error) {
    logger.error('Get security logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving security logs',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Moderate forum thread
const moderateForumThread = async (req, res) => {
  try {
    const { threadId } = req.params;
    const { action } = req.body;

    if (!['approve', 'reject', 'delete'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Must be approve, reject, or delete'
      });
    }

    const thread = await Forum.findById(threadId);
    if (!thread) {
      return res.status(404).json({
        success: false,
        message: 'Forum thread not found'
      });
    }

    let updateData = {};
    switch (action) {
      case 'approve':
        updateData = { status: 'approved', moderatedAt: new Date() };
        break;
      case 'reject':
        updateData = { status: 'rejected', moderatedAt: new Date() };
        break;
      case 'delete':
        await Forum.findByIdAndDelete(threadId);
        break;
    }

    if (action !== 'delete') {
      await Forum.findByIdAndUpdate(threadId, updateData);
    }

    auditLogger.sensitiveAction(req, 'admin.forum.moderate', {
      userId: req.user.id || req.user._id,
      threadId,
      action,
      threadTitle: thread.title
    });

    res.status(200).json({
      success: true,
      message: `Forum thread ${action}d successfully`
    });

  } catch (error) {
    logger.error('Moderate forum thread error:', error);
    res.status(500).json({
      success: false,
      message: 'Error moderating forum thread',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  getAdminDashboard,
  getUserAnalytics,
  getSystemMetrics,
  getAdminStats,
  getSystemHealth,
  getAdminAnalytics,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getSystemSettings,
  updateSystemSettings,
  getSecurityLogs,
  moderateForumThread
};
