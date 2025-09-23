const User = require('../models/User');
const logger = require('../utils/logger');

class AuthService {
  // Register a new user
  async register(userData) {
    try {
      const { firstName, lastName, email, password, phone, location, role } = userData;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Create user
      const user = await User.create({
        firstName,
        lastName,
        email,
        password,
        phone,
        location,
        role: role || 'farmer'
      });


      // Generate JWT token
      const token = user.getSignedJwtToken();

      logger.info(`New user registered: ${user.email}`);

      return {
        success: true,
        token,
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          location: user.location,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      };
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  // Login user
  async login(email, password) {
    try {
      // Check for user
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Check if password matches
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        throw new Error('Invalid credentials');
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate JWT token
      const token = user.getSignedJwtToken();

      logger.info(`User logged in: ${user.email}`);

      return {
        success: true,
        token,
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          location: user.location,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          lastLogin: user.lastLogin
        }
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  // Forgot password
  async forgotPassword(email) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('No user found with this email');
      }

      // Get reset token
      const resetToken = user.getResetPasswordToken();
      await user.save();

      logger.info(`Password reset requested for: ${user.email}`);

      return {
        success: true,
        message: 'Password reset email sent'
      };
    } catch (error) {
      logger.error('Forgot password error:', error);
      throw error;
    }
  }

  // Reset password
  async resetPassword(token, password) {
    try {
      // Get hashed token
      const resetPasswordToken = require('crypto')
        .createHash('sha256')
        .update(token)
        .digest('hex');

      const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
      });

      if (!user) {
        throw new Error('Invalid or expired reset token');
      }

      // Set new password
      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      logger.info(`Password reset successful for: ${user.email}`);

      return {
        success: true,
        message: 'Password reset successful'
      };
    } catch (error) {
      logger.error('Reset password error:', error);
      throw error;
    }
  }

  // Change password
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findById(userId).select('+password');
      if (!user) {
        throw new Error('User not found');
      }

      // Check current password
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        throw new Error('Current password is incorrect');
      }

      // Set new password
      user.password = newPassword;
      await user.save();

      logger.info(`Password changed for user: ${user.email}`);

      return {
        success: true,
        message: 'Password changed successfully'
      };
    } catch (error) {
      logger.error('Change password error:', error);
      throw error;
    }
  }

  // Get current user
  async getCurrentUser(userId) {
    try {
      const user = await User.findById(userId).populate('crops');
      if (!user) {
        throw new Error('User not found');
      }

      return {
        success: true,
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          location: user.location,
          farmSize: user.farmSize,
          farmingExperience: user.farmingExperience,
          crops: user.crops,
          avatar: user.avatar,
          preferences: user.preferences,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          lastLogin: user.lastLogin
        }
      };
    } catch (error) {
      logger.error('Get current user error:', error);
      throw error;
    }
  }

  // Update user profile
  async updateProfile(userId, updateData) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Remove sensitive fields
      const { password, email, role, ...allowedUpdates } = updateData;

      // Update user
      Object.keys(allowedUpdates).forEach(key => {
        if (allowedUpdates[key] !== undefined) {
          user[key] = allowedUpdates[key];
        }
      });

      await user.save();

      logger.info(`Profile updated for user: ${user.email}`);

      return {
        success: true,
        message: 'Profile updated successfully',
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          location: user.location,
          farmSize: user.farmSize,
          farmingExperience: user.farmingExperience,
          avatar: user.avatar,
          preferences: user.preferences,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      };
    } catch (error) {
      logger.error('Update profile error:', error);
      throw error;
    }
  }
}

module.exports = new AuthService();
