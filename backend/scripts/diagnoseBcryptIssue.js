import dotenv from 'dotenv';
import { connectDatabase } from '../config/database.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

async function diagnoseBcryptIssue() {
  try {
    console.log('🚀 Connecting to database...');
    await connectDatabase();
    
    const email = 'andrew.williams40@healthcenter.com';
    const testPassword = 'doctor123';
    
    console.log('🔍 Diagnosing bcrypt comparison issue...');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Test password: "${testPassword}"`);
    
    // Get user with password
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      console.log('❌ User not found!');
      return;
    }
    
    console.log('\n💾 Database Info:');
    console.log(`   Password hash: ${user.password}`);
    console.log(`   Hash length: ${user.password.length}`);
    console.log(`   Hash format: ${user.password.substring(0, 7)}`);
    
    console.log('\n🧪 Testing password comparison methods:');
    
    // Test 1: Direct bcrypt.compare
    console.log('\n--- Test 1: Direct bcrypt.compare ---');
    try {
      const directResult = await bcrypt.compare(testPassword, user.password);
      console.log(`   bcrypt.compare("${testPassword}", hash) = ${directResult}`);
    } catch (error) {
      console.log(`   ERROR: ${error.message}`);
    }
    
    // Test 2: Model method
    console.log('\n--- Test 2: User model comparePassword method ---');
    try {
      const modelResult = await user.comparePassword(testPassword);
      console.log(`   user.comparePassword("${testPassword}") = ${modelResult}`);
    } catch (error) {
      console.log(`   ERROR: ${error.message}`);
    }
    
    // Test 3: Check if password has invisible characters
    console.log('\n--- Test 3: Password character analysis ---');
    console.log(`   Password length: ${testPassword.length}`);
    console.log(`   Password bytes:`, [...testPassword].map(c => c.charCodeAt(0)));
    console.log(`   Password hex:`, Buffer.from(testPassword, 'utf8').toString('hex'));
    
    // Test 4: Test with variations
    console.log('\n--- Test 4: Testing password variations ---');
    const variations = [
      testPassword,
      testPassword.trim(),
      testPassword.normalize('NFC'),
      testPassword.normalize('NFD'),
      testPassword.replace(/\u200B/g, ''), // Remove zero-width space
      testPassword.replace(/\uFEFF/g, ''), // Remove BOM
    ];
    
    for (let i = 0; i < variations.length; i++) {
      const variant = variations[i];
      try {
        const result = await bcrypt.compare(variant, user.password);
        console.log(`   Variation ${i + 1}: "${variant}" (len:${variant.length}) = ${result}`);
        if (result) {
          console.log(`   ✅ FOUND WORKING VARIATION: "${variant}"`);
        }
      } catch (error) {
        console.log(`   Variation ${i + 1}: ERROR - ${error.message}`);
      }
    }
    
    // Test 5: Create fresh hash and test
    console.log('\n--- Test 5: Fresh hash test ---');
    try {
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
      console.log(`   Using salt rounds: ${saltRounds}`);
      
      const freshHash = await bcrypt.hash(testPassword, saltRounds);
      console.log(`   Fresh hash: ${freshHash}`);
      
      const freshResult = await bcrypt.compare(testPassword, freshHash);
      console.log(`   Fresh hash comparison: ${freshResult}`);
      
      if (freshResult) {
        console.log('\n🔧 Creating new user with fresh hash...');
        
        // Update the user with the fresh hash
        const updateResult = await User.updateOne(
          { email: email.toLowerCase() },
          { password: freshHash }
        );
        
        console.log(`   Update result: ${updateResult.modifiedCount} document(s) modified`);
        
        // Test again
        const updatedUser = await User.findOne({ email: email.toLowerCase() }).select('+password');
        const finalResult = await bcrypt.compare(testPassword, updatedUser.password);
        console.log(`   Final test with updated hash: ${finalResult}`);
        
        if (finalResult) {
          console.log('   ✅ SUCCESS! Password should now work.');
        }
      }
    } catch (error) {
      console.log(`   Fresh hash error: ${error.message}`);
    }
    
    // Test 6: Check User model's comparePassword method implementation
    console.log('\n--- Test 6: User model method inspection ---');
    console.log('   User model comparePassword method:');
    console.log(user.comparePassword.toString());
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error during diagnosis:', error);
    process.exit(1);
  }
}

diagnoseBcryptIssue();