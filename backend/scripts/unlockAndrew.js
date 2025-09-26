import dotenv from 'dotenv';
import { connectDatabase } from '../config/database.js';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

async function unlockAndrew() {
  try {
    console.log('🚀 Connecting to database...');
    await connectDatabase();
    
    const email = 'andrew.williams40@healthcenter.com';
    
    console.log(`🔓 Unlocking account: ${email}`);
    
    // Find and unlock the user
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log('❌ User not found!');
      return;
    }
    
    console.log('\n📊 Current account status:');
    console.log(`   Login Attempts: ${user.loginAttempts || 0}`);
    console.log(`   Locked Until: ${user.lockUntil || 'Not locked'}`);
    console.log(`   Is Locked: ${user.isLocked()}`);
    
    // Reset login attempts and unlock
    await user.resetLoginAttempts();
    
    console.log('\n✅ Account unlocked!');
    console.log('   Login attempts reset to 0');
    console.log('   Lock status removed');
    
    // Also ensure the password is correct
    console.log('\n🔑 Setting password to "doctor123"...');
    user.password = 'doctor123';
    await user.save();
    
    console.log('✅ Password reset to "doctor123"');
    
    // Verify the unlock worked
    const updatedUser = await User.findOne({ email: email.toLowerCase() });
    console.log('\n📊 Updated account status:');
    console.log(`   Login Attempts: ${updatedUser.loginAttempts || 0}`);
    console.log(`   Locked Until: ${updatedUser.lockUntil || 'Not locked'}`);
    console.log(`   Is Locked: ${updatedUser.isLocked()}`);
    console.log(`   Is Active: ${updatedUser.isActive}`);
    
    console.log('\n🎉 Andrew Williams account is now ready for login!');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: doctor123`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error unlocking account:', error);
    process.exit(1);
  }
}

unlockAndrew();