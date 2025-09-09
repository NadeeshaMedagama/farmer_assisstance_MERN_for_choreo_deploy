const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test admin endpoints
async function testAdminEndpoints() {
  console.log('🧪 Testing Admin Endpoints...\n');

  try {
    // Test 1: Admin Stats
    console.log('1️⃣ Testing GET /api/admin/stats');
    try {
      const response = await axios.get(`${BASE_URL}/admin/stats`);
      console.log('✅ Admin Stats Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log('❌ Admin Stats Error:', error.response?.data || error.message);
    }

    // Test 2: System Health
    console.log('\n2️⃣ Testing GET /api/admin/health');
    try {
      const response = await axios.get(`${BASE_URL}/admin/health`);
      console.log('✅ System Health Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log('❌ System Health Error:', error.response?.data || error.message);
    }

    // Test 3: Admin Analytics
    console.log('\n3️⃣ Testing GET /api/admin/analytics');
    try {
      const response = await axios.get(`${BASE_URL}/admin/analytics?timeRange=30d`);
      console.log('✅ Admin Analytics Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log('❌ Admin Analytics Error:', error.response?.data || error.message);
    }

    // Test 4: Get All Users
    console.log('\n4️⃣ Testing GET /api/admin/users');
    try {
      const response = await axios.get(`${BASE_URL}/admin/users?page=1&limit=5`);
      console.log('✅ Get All Users Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log('❌ Get All Users Error:', error.response?.data || error.message);
    }

    // Test 5: System Settings
    console.log('\n5️⃣ Testing GET /api/admin/settings');
    try {
      const response = await axios.get(`${BASE_URL}/admin/settings`);
      console.log('✅ System Settings Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log('❌ System Settings Error:', error.response?.data || error.message);
    }

    // Test 6: Security Logs
    console.log('\n6️⃣ Testing GET /api/admin/security/logs');
    try {
      const response = await axios.get(`${BASE_URL}/admin/security/logs?page=1&limit=5`);
      console.log('✅ Security Logs Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log('❌ Security Logs Error:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the tests
testAdminEndpoints();
