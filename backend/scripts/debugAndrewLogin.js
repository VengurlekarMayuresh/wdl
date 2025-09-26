import dotenv from 'dotenv';
import { connectDatabase } from '../config/database.js';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';

// Load environment variables
dotenv.config();

async function debugAndrewLogin() {
  try {
    console.log('🚀 Connecting to database...');
    await connectDatabase();
    
    const email = 'andrew.williams40@healthcenter.com';
    const password = 'doctor123';
    
    console.log(`\n🔍 Debugging login for: ${email}`);
    console.log(`🔑 Testing password: ${password}`);
    
    // Step 1: Check if user exists
    console.log('\n📝 Step 1: Finding user...');
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log('❌ User not found in database');
      return;
    }
    
    console.log('✅ User found!');
    console.log(`   ID: ${user._id}`);
    console.log(`   Name: ${user.firstName} ${user.lastName}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   User Type: ${user.userType}`);
    console.log(`   Active: ${user.isActive}`);
    console.log(`   Email Verified: ${user.isEmailVerified}`);
    console.log(`   Login Attempts: ${user.loginAttempts || 0}`);
    console.log(`   Locked Until: ${user.lockUntil || 'Not locked'}`);
    
    // Step 2: Get user with password for comparison
    console.log('\n🔒 Step 2: Getting user with password...');
    const userWithPassword = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!userWithPassword) {
      console.log('❌ Could not get user with password');
      return;
    }
    
    console.log('✅ Got user with password');
    console.log(`   Password field exists: ${!!userWithPassword.password}`);
    console.log(`   Password length: ${userWithPassword.password ? userWithPassword.password.length : 'N/A'}`);
    
    // Step 3: Check if account is locked
    console.log('\n🔐 Step 3: Checking account lock status...');
    const isLocked = userWithPassword.isLocked();
    console.log(`   Account locked: ${isLocked}`);
    
    // Step 4: Check if account is active
    console.log('\n✅ Step 4: Checking account status...');
    console.log(`   Account active: ${userWithPassword.isActive}`);
    
    // Step 5: Test password comparison
    console.log('\n🧪 Step 5: Testing password comparison...');
    try {
      const isPasswordValid = await userWithPassword.comparePassword(password);
      console.log(`   Password valid: ${isPasswordValid ? '✅' : '❌'}`);
      
      // Also test with some common variations
      const variations = ['Doctor123', 'DOCTOR123', 'doctor123 ', ' doctor123'];
      console.log('\n🔄 Testing password variations:');
      for (const variation of variations) {
        const isValid = await userWithPassword.comparePassword(variation);
        console.log(`   "${variation}": ${isValid ? '✅' : '❌'}`);
      }
      
    } catch (error) {
      console.log(`   Password comparison error: ${error.message}`);
    }
    
    // Step 6: Check doctor profile
    console.log('\n👨‍⚕️ Step 6: Checking doctor profile...');
    const doctorProfile = await Doctor.findOne({ userId: user._id });
    
    if (!doctorProfile) {
      console.log('❌ Doctor profile not found!');
      return;
    }
    
    console.log('✅ Doctor profile found!');
    console.log(`   License Number: ${doctorProfile.medicalLicenseNumber}`);
    console.log(`   Specialty: ${doctorProfile.primarySpecialty}`);
    console.log(`   Status: ${doctorProfile.status}`);
    console.log(`   Accepting Patients: ${doctorProfile.isAcceptingNewPatients}`);
    
    // Step 7: Simulate the full login process
    console.log('\n🎯 Step 7: Simulating full login process...');
    
    if (!userWithPassword.isActive) {
      console.log('❌ Login would fail: Account is deactivated');
      return;
    }
    
    if (userWithPassword.isLocked()) {
      console.log('❌ Login would fail: Account is locked');
      return;
    }
    
    const passwordCheck = await userWithPassword.comparePassword(password);
    if (!passwordCheck) {
      console.log('❌ Login would fail: Invalid password');
      return;
    }
    
    console.log('✅ All login checks passed! Login should succeed.');
    
    // Step 8: Try creating a new user with the same credentials
    console.log('\n🔄 Step 8: Testing password hashing...');
    try {
      const testUser = new User({
        firstName: 'Test',
        lastName: 'User',
        email: 'test-password-' + Date.now() + '@test.com',
        password: password,
        userType: 'patient'
      });
      
      // Save to trigger password hashing
      await testUser.save();
      
      // Test the password immediately
      const testPasswordValid = await testUser.comparePassword(password);
      console.log(`   New user password validation: ${testPasswordValid ? '✅' : '❌'}`);
      
      // Clean up
      await User.findByIdAndDelete(testUser._id);
      
    } catch (error) {
      console.log(`   Password hashing test error: ${error.message}`);
    }
    
    console.log('\n🎉 Diagnosis complete!');
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}

// Run the script
debugAndrewLogin();
