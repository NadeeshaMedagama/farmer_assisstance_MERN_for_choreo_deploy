// Debug script to test login functionality
const testLogin = async () => {
  const credentials = {
    email: 'test@example.com',
    password: 'password123'
  };

  console.log('🔍 Testing login with credentials:', credentials);

  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials)
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Login failed:', errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ Login successful:', data);

    // Test getting current user with the token
    const userResponse = await fetch('http://localhost:5000/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${data.token}`,
        'Content-Type': 'application/json',
      }
    });

    if (userResponse.ok) {
      const userData = await userResponse.json();
      console.log('✅ User data retrieved:', userData);
    } else {
      console.error('❌ Failed to get user data');
    }

  } catch (error) {
    console.error('❌ Network error:', error);
  }
};

// Run the test
testLogin();
