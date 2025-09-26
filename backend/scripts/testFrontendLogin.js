import fetch from 'node-fetch';

async function testFrontendLogin() {
  const API_BASE_URL = 'http://localhost:5000/api';
  const email = 'andrew.williams40@healthcenter.com';
  const password = 'doctor123';
  
  console.log('🧪 Testing frontend-style login request...');
  console.log(`📧 Email: ${email}`);
  console.log(`🔑 Password: ${password}`);
  
  const requestBody = JSON.stringify({ email, password });
  console.log(`📦 Request body: ${requestBody}`);
  
  const config = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    credentials: 'include',
    body: requestBody
  };
  
  console.log(`📋 Request config:`, {
    method: config.method,
    headers: config.headers,
    credentials: config.credentials,
    bodyLength: config.body.length
  });
  
  try {
    console.log(`\n🚀 Making request to: ${API_BASE_URL}/auth/login`);
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, config);
    
    console.log(`📡 Response status: ${response.status} ${response.statusText}`);
    console.log(`📋 Response headers:`, Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log(`📦 Response data:`, data);
    
    if (response.ok && data.success) {
      console.log(`\n✅ LOGIN SUCCESS!`);
      console.log(`👤 User: ${data.data.user.firstName} ${data.data.user.lastName}`);
      console.log(`📧 Email: ${data.data.user.email}`);
      console.log(`👨‍⚕️ Type: ${data.data.user.userType}`);
      console.log(`🎫 Token: ${data.data.token ? 'Generated' : 'Missing'}`);
    } else {
      console.log(`\n❌ LOGIN FAILED`);
      console.log(`💬 Message: ${data.message}`);
      console.log(`🔍 Success: ${data.success}`);
      
      if (response.status === 401) {
        console.log(`\n🚨 This is a 401 Unauthorized error`);
        console.log(`   This means the backend received the request but rejected the credentials`);
      }
    }
    
  } catch (error) {
    console.error(`\n❌ Network Error:`, error.message);
  }
  
  process.exit(0);
}

testFrontendLogin();