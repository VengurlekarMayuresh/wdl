import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:5000/api';

async function testLogin() {
    console.log('🧪 Testing API Login with rebuilt accounts...\n');
    
    const testAccounts = [
        'ashley.smith39@healthcenter.com',
        'andrew.williams40@healthcenter.com',
        'john.hernandez0@healthcenter.com',
        'emily.miller1@healthcenter.com',
        'michelle.jackson0@email.com'  // Patient account
    ];
    
    for (const email of testAccounts) {
        try {
            console.log(`🔍 Testing login for: ${email}`);
            
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: 'doctor123'
                })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                console.log(`✅ ${email}: LOGIN SUCCESS`);
                console.log(`   - User Type: ${data.data.user.userType}`);
                console.log(`   - Name: ${data.data.user.firstName} ${data.data.user.lastName}`);
                console.log(`   - Token: ${data.data.token ? 'Generated' : 'Missing'}`);
                console.log(`   - Profile: ${data.data.profile ? 'Present' : 'Missing'}`);
            } else {
                console.log(`❌ ${email}: LOGIN FAILED`);
                console.log(`   - Status: ${response.status}`);
                console.log(`   - Message: ${data.message || 'Unknown error'}`);
            }
            
        } catch (error) {
            console.log(`❌ ${email}: NETWORK ERROR - ${error.message}`);
        }
        
        console.log(''); // Empty line for readability
    }
    
    console.log('🎉 Login API testing complete!');
    process.exit(0);
}

// Add a small delay to ensure server is ready
setTimeout(testLogin, 2000);