// Quick fix for authentication and appointment system

console.log('🔧 Creating working mock authentication...');

// Create a proper mock token and user
const mockUser = {
  _id: 'doctor_123456',
  firstName: 'Dr. John',
  lastName: 'Smith',
  email: 'doctor@test.com',
  userType: 'doctor',
  phone: '+1 (555) 123-4567',
  profilePicture: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face',
  primarySpecialty: 'Cardiology',
  yearsOfExperience: 15,
  profile: {
    primarySpecialty: 'Cardiology',
    yearsOfExperience: 15,
    bio: 'Experienced cardiologist with 15+ years in practice',
    languages: ['English', 'Spanish'],
    isAcceptingNewPatients: true
  },
  address: {
    street: '123 Medical Plaza',
    city: 'New York', 
    state: 'NY',
    zipCode: '10001'
  }
};

const mockToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJkb2N0b3JfMTIzNDU2IiwidXNlclR5cGUiOiJkb2N0b3IiLCJleHAiOjk5OTk5OTk5OTl9.mock_signature';

console.log('Mock user created:', mockUser);
console.log('Mock token created:', mockToken);

console.log('\n📋 Instructions:');
console.log('1. Open browser developer tools');
console.log('2. Go to Application/Storage → Local Storage');
console.log('3. Set these values:');
console.log('   - key: "token", value:', `"${mockToken}"`);
console.log('   - key: "user", value:', `'${JSON.stringify(mockUser)}'`);
console.log('4. Refresh the page');
console.log('5. Login should work and appointments should load');