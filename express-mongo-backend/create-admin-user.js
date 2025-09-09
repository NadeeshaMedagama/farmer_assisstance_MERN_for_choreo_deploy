const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('./models/User');

async function createAdminUser() {
  try {
    // Connect to MongoDB (same logic as database.js)
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/farmer-assistance';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@farmerassistant.com' });
    if (existingAdmin) {
      console.log('👤 Admin user already exists:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
      return;
    }

    // Create admin user
    const adminUser = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@farmerassistant.com',
      password: 'admin123', // This will be hashed automatically
      phone: '+1234567890',
      role: 'admin',
      location: {
        address: 'Admin Office',
        city: 'Colombo',
        state: 'Western Province',
        country: 'Sri Lanka'
      },
      isEmailVerified: true,
      farmSize: 0,
      farmingExperience: 0
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@farmerassistant.com');
    console.log('🔑 Password: admin123');
    console.log('👑 Role: admin');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

createAdminUser();
