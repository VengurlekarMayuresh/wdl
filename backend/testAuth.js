import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

// Load environment variables
dotenv.config();

// Import models
import User from './models/User.js';
import Doctor from './models/Doctor.js';

async function testAuth() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Get first doctor
    const doctor = await User.findOne({ userType: 'doctor' });
    
    if (!doctor) {
      console.log('❌ No doctor found');
      return;
    }
    
    const doctorProfile = await Doctor.findOne({ userId: doctor._id });
    
    console.log('👨‍⚕️ Found Doctor:');
    console.log(`Name: Dr. ${doctor.firstName} ${doctor.lastName}`);
    console.log(`Email: ${doctor.email}`);
    console.log(`ID: ${doctor._id}`);
    console.log(`Specialty: ${doctorProfile?.primarySpecialty || 'General'}`);
    
    // Generate token
    const token = jwt.sign(
      { 
        userId: doctor._id,
        userType: 'doctor',
        email: doctor.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Create user object for localStorage
    const userForStorage = {
      _id: doctor._id.toString(),
      id: doctor._id.toString(),
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      email: doctor.email,
      phone: doctor.phone,
      userType: 'doctor',
      address: doctor.address,
      profilePicture: doctor.profilePicture || '',
      profile: doctorProfile ? {
        primarySpecialty: doctorProfile.primarySpecialty,
        yearsOfExperience: doctorProfile.yearsOfExperience,
        bio: doctor.bio || doctorProfile.bio
      } : {}
    };
    
    console.log('\n🔑 Authentication Details for Browser:');
    console.log('='.repeat(50));
    console.log('1. Open Browser Developer Tools (F12)');
    console.log('2. Go to Application > Local Storage > http://localhost:8080');
    console.log('3. Add these entries:');
    console.log('');
    console.log('Key: token');
    console.log('Value:', token);
    console.log('');
    console.log('Key: user');
    console.log('Value:', JSON.stringify(userForStorage));
    console.log('');
    console.log('4. Refresh the page and navigate to /doctor-profile');
    console.log('5. You should see working appointments!');
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

testAuth();