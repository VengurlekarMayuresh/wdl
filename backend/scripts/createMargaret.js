import dotenv from 'dotenv';
import { connectDatabase } from '../config/database.js';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';

// Load environment variables
dotenv.config();

async function createMargaret() {
  try {
    console.log('🚀 Connecting to database...');
    await connectDatabase();
    
    const email = 'margaret.rodriguez43@healthcenter.com';
    const password = 'doctor123';
    
    console.log(`👩‍⚕️ Creating Margaret Rodriguez: ${email}`);
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      console.log('📝 User already exists, updating password...');
      
      // Reset login attempts and unlock
      await existingUser.resetLoginAttempts();
      
      // Update password
      existingUser.password = password;
      await existingUser.save();
      
      console.log('✅ Updated existing user with fresh password');
    } else {
      console.log('👤 Creating new user...');
      
      // Create user
      const user = await User.create({
        firstName: 'Margaret',
        lastName: 'Rodriguez',
        email: email,
        password: password,
        userType: 'doctor',
        phone: '5551234572',
        dateOfBirth: '1980-03-15',
        gender: 'female',
        address: {
          street: '600 Medical Plaza',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90210',
          country: 'USA'
        }
      });
      
      console.log('✅ Created user:', user.email);
      
      // Create doctor profile
      const doctor = await Doctor.create({
        userId: user._id,
        medicalLicenseNumber: 'CA123456789',
        licenseState: 'CA',
        licenseExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        primarySpecialty: 'Internal Medicine',
        subspecialties: ['Preventive Medicine'],
        yearsOfExperience: 12,
        consultationFee: 180,
        status: 'approved',
        isAcceptingNewPatients: true,
        bio: 'Dr. Margaret Rodriguez is an experienced internal medicine physician.',
        averageRating: 4.9,
        totalReviews: 87
      });
      
      console.log('✅ Created doctor profile');
    }
    
    // Test the login
    console.log('\n🧪 Testing login...');
    const testUser = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (testUser) {
      const passwordValid = await testUser.comparePassword(password);
      console.log(`Password test result: ${passwordValid ? '✅ VALID' : '❌ INVALID'}`);
    }
    
    console.log('\n🎉 Margaret Rodriguez account is ready!');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error creating Margaret:', error);
    process.exit(1);
  }
}

createMargaret();