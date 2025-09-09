const express = require('express');
const router = express.Router();

// Import controllers
const {
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
} = require('../controllers/adminController');

// Import middleware
const { protect, authorize } = require('../middleware/auth');
const { validateContentType } = require('../middleware/securityMiddleware');

// Apply authentication and admin authorization to all routes
router.use(protect);
router.use(authorize('admin'));

// Apply content type validation
router.use(validateContentType);

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get comprehensive admin dashboard data
 * @access  Private (Admin only)
 * @returns Complete system overview with all data aggregated
 */
router.get('/dashboard', getAdminDashboard);

/**
 * @route   GET /api/admin/analytics/users
 * @desc    Get detailed user analytics with time-based filtering
 * @access  Private (Admin only)
 * @query   timeframe - Time period for analytics (7d, 30d, 90d, 1y)
 * @returns User registration and verification trends
 */
router.get('/analytics/users', getUserAnalytics);

/**
 * @route   GET /api/admin/metrics/system
 * @desc    Get system performance and health metrics
 * @access  Private (Admin only)
 * @returns System performance data, memory usage, and database statistics
 */
router.get('/metrics/system', getSystemMetrics);

/**
 * @route   GET /api/admin/stats
 * @desc    Get admin dashboard statistics
 * @access  Private (Admin only)
 * @returns Basic statistics for admin dashboard overview
 */
router.get('/stats', getAdminStats);

/**
 * @route   GET /api/admin/health
 * @desc    Get system health status
 * @access  Private (Admin only)
 * @returns System health information
 */
router.get('/health', getSystemHealth);

/**
 * @route   GET /api/admin/analytics
 * @desc    Get comprehensive admin analytics
 * @access  Private (Admin only)
 * @query   timeRange - Time period for analytics (7d, 30d, 90d, 1y)
 * @returns Detailed analytics data
 */
router.get('/analytics', getAdminAnalytics);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with filtering and pagination
 * @access  Private (Admin only)
 * @query   page, limit, role, status, search
 * @returns Paginated list of users
 */
router.get('/users', getAllUsers);

/**
 * @route   PUT /api/admin/users/:userId/role
 * @desc    Update user role
 * @access  Private (Admin only)
 * @param   userId - User ID
 * @body    { role: 'farmer' | 'expert' | 'admin' }
 * @returns Updated user data
 */
router.put('/users/:userId/role', updateUserRole);

/**
 * @route   DELETE /api/admin/users/:userId
 * @desc    Delete a user
 * @access  Private (Admin only)
 * @param   userId - User ID
 * @returns Success message
 */
router.delete('/users/:userId', deleteUser);

/**
 * @route   GET /api/admin/settings
 * @desc    Get system settings
 * @access  Private (Admin only)
 * @returns Current system settings
 */
router.get('/settings', getSystemSettings);

/**
 * @route   PUT /api/admin/settings
 * @desc    Update system settings
 * @access  Private (Admin only)
 * @body    System settings object
 * @returns Updated settings
 */
router.put('/settings', updateSystemSettings);

/**
 * @route   GET /api/admin/security/logs
 * @desc    Get security logs
 * @access  Private (Admin only)
 * @query   page, limit
 * @returns Paginated security logs
 */
router.get('/security/logs', getSecurityLogs);

/**
 * @route   PUT /api/admin/forum/:threadId/moderate
 * @desc    Moderate forum thread
 * @access  Private (Admin only)
 * @param   threadId - Forum thread ID
 * @body    { action: 'approve' | 'reject' | 'delete' }
 * @returns Success message
 */
router.put('/forum/:threadId/moderate', moderateForumThread);

module.exports = router;
