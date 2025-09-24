// Simple test script to verify backend endpoints
const testAPI = async () => {
  try {
    console.log('Testing backend connectivity...');
    
    // Test health endpoint
    const healthResponse = await fetch('http://localhost:5000/api/health');
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Health endpoint working:', healthData.message);
    } else {
      console.log('❌ Health endpoint failed:', healthResponse.status);
    }
    
    // Test root API endpoint
    const apiResponse = await fetch('http://localhost:5000/api');
    if (apiResponse.ok) {
      const apiData = await apiResponse.json();
      console.log('✅ API root endpoint working:', apiData.message);
      console.log('📋 Available endpoints:', apiData.endpoints);
    } else {
      console.log('❌ API root endpoint failed:', apiResponse.status);
    }
    
    // Test registration endpoint with mock data
    const testUser = {
      firstName: 'Test',
      lastName: 'Doctor',
      email: 'test.doctor@example.com',
      password: 'Test123!',
      userType: 'doctor',
      phone: '1234567890',
      dateOfBirth: '1990-01-01'
    };
    
    const registerResponse = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser)
    });
    
    if (registerResponse.ok) {
      const registerData = await registerResponse.json();
      console.log('✅ Registration endpoint working');
      console.log('🔑 Token received:', registerData.data?.token ? 'Yes' : 'No');
    } else {
      const errorData = await registerResponse.text();
      console.log('❌ Registration endpoint failed:', registerResponse.status);
      console.log('Error details:', errorData);
    }
    
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    console.log('Make sure the backend server is running on port 5000');
  }
};

// Run the test
testAPI();