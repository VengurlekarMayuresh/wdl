// Quick test script to verify appointment API endpoints

const API_BASE = 'http://localhost:5000/api';

async function testAppointmentEndpoints() {
    console.log('🧪 Testing Appointment API Endpoints...\n');
    
    try {
        // Test 1: Health check
        console.log('1. Testing health endpoint...');
        const healthResponse = await fetch(`${API_BASE}/health`);
        const healthData = await healthResponse.json();
        console.log('✅ Health check:', healthData.success ? 'OK' : 'FAILED');
        
        // Test 2: Check appointments endpoint (without auth - should fail)
        console.log('\n2. Testing appointments endpoint (no auth - should fail)...');
        const appointmentsResponse = await fetch(`${API_BASE}/appointments/doctor/my`);
        console.log('Status:', appointmentsResponse.status); // Should be 401
        
        if (appointmentsResponse.status === 401) {
            console.log('✅ Auth protection working correctly');
        } else {
            console.log('❌ Auth protection not working');
        }
        
        console.log('\n✅ Basic API tests completed');
        console.log('\n📋 Next steps:');
        console.log('1. Login as doctor in frontend');
        console.log('2. Check browser console for appointment loading logs');
        console.log('3. Create test appointments if needed');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

testAppointmentEndpoints();