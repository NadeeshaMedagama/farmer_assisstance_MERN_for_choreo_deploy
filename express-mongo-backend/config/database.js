const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    // Priority: MONGODB_URI (local) -> MONGO_URI (cloud) -> default local
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/farmer-assistance';
    
    // Determine connection type for logging
    const isLocal = mongoUri.includes('localhost') || mongoUri.includes('127.0.0.1');
    const connectionType = isLocal ? 'Local' : 'Cloud';
    
    const conn = await mongoose.connect(mongoUri);

    logger.info(`🗄️  MongoDB Connected (${connectionType}): ${conn.connection.host}`);
    logger.info(`📊 Database: ${conn.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });

  } catch (error) {
    logger.error('Database connection failed:', error.message);
    logger.warn('Continuing without database connection...');
    // Don't exit - let the server continue running
  }
};

module.exports = connectDB;
