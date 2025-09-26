import dotenv from 'dotenv';
import { connectDatabase } from '../config/database.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

async function testPasswordForAndrew() {
  try {
    console.log('🚀 Connecting to database...');
    await connectDatabase();
    
    const email = 'andrew.williams40@healthcenter.com';
    const testPassword = 'doctor123';
    
    console.log(`\n🔍 Testing password for: ${email}`);
    console.log(`🔑 Test password: ${testPassword}`);
    
    // Get user with password
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      console.log('❌ User not found!');
      return;
    }
    
    console.log('\n👤 User found:');
    console.log(`   ID: ${user._id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   User Type: ${user.userType}`);
    console.log(`   Active: ${user.isActive}`);
    
    console.log('\n🔒 Password Analysis:');
    console.log(`   Stored hash exists: ${!!user.password}`);
    console.log(`   Stored hash length: ${user.password ? user.password.length : 'N/A'}`);
    console.log(`   Hash starts with: ${user.password ? user.password.substring(0, 10) + '...' : 'N/A'}`);
    console.log(`   Looks like bcrypt: ${user.password ? user.password.startsWith('$2') : 'N/A'}`);
    
    // Test 1: Use the model's comparePassword method
    console.log('\n🧪 Test 1: Model comparePassword method');
    try {
      const result1 = await user.comparePassword(testPassword);
      console.log(`   Result: ${result1 ? '✅ SUCCESS' : '❌ FAILED'}`);
    } catch (error) {
      console.log(`   Error: ${error.message}`);
    }
    
    // Test 2: Direct bcrypt comparison
    console.log('\n🧪 Test 2: Direct bcrypt.compare');
    try {
      const result2 = await bcrypt.compare(testPassword, user.password);
      console.log(`   Result: ${result2 ? '✅ SUCCESS' : '❌ FAILED'}`);
    } catch (error) {
      console.log(`   Error: ${error.message}`);
    }
    
    // Test 3: Test with different variations
    console.log('\n🧪 Test 3: Testing password variations');
    const variations = [
      'doctor123',
      'Doctor123', 
      'DOCTOR123',
      'doctor123 ',
      ' doctor123',
      'password123'
    ];
    
    for (const variant of variations) {
      try {
        const result = await bcrypt.compare(variant, user.password);
        console.log(`   "${variant}": ${result ? '✅' : '❌'}`);
      } catch (error) {
        console.log(`   "${variant}": ERROR - ${error.message}`);
      }
    }
    
    // Test 4: Create a new hash with the same password and compare
    console.log('\n🧪 Test 4: Fresh hash comparison');
    try {
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
      const freshHash = await bcrypt.hash(testPassword, saltRounds);
      console.log(`   Fresh hash: ${freshHash.substring(0, 20)}...`);
      
      const freshTest = await bcrypt.compare(testPassword, freshHash);
      console.log(`   Fresh hash test: ${freshTest ? '✅ SUCCESS' : '❌ FAILED'}`);
      
      // Compare the patterns
      console.log(`   Stored hash pattern: ${user.password.substring(0, 7)}`);
      console.log(`   Fresh hash pattern:  ${freshHash.substring(0, 7)}`);
      
    } catch (error) {
      console.log(`   Fresh hash error: ${error.message}`);
    }
    
    // Test 5: Reset password and test
    console.log('\n🧪 Test 5: Resetting password to known value');
    try {
      user.password = testPassword;
      await user.save();
      console.log('   Password reset and saved');
      
      // Get the user again to test
      const updatedUser = await User.findOne({ email: email.toLowerCase() }).select('+password');
      const resetTest = await updatedUser.comparePassword(testPassword);
      console.log(`   Reset test result: ${resetTest ? '✅ SUCCESS' : '❌ FAILED'}`);
      
      if (resetTest) {
        console.log('   ✅ Password reset successful! The user should now be able to login.');
      }
      
    } catch (error) {
      console.log(`   Reset error: ${error.message}`);
    }
    
    console.log('\n🎉 Password testing completed!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error during password testing:', error);
    process.exit(1);
  }
}

testPasswordForAndrew();