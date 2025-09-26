import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Load environment variables
dotenv.config();

// Import models
import User from './models/User.js';
import Doctor from './models/Doctor.js';

async function testAuthentication() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Check existing doctors
    console.log('\n🔍 Checking existing doctors...');
    const existingDoctors = await User.find({ userType: 'doctor' }).limit(5);
    console.log(`Found ${existingDoctors.length} doctors:`);
    
    existingDoctors.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user._id}`);
      console.log(`   Name: ${user.firstName} ${user.lastName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Phone: ${user.phone || 'N/A'}`);
      console.log('---');
    });

    // 2. Create a test doctor if none exist
    if (existingDoctors.length === 0) {
      console.log('\n🏥 Creating test doctor...');
      
      // Create user
      const hashedPassword = await bcrypt.hash('password123', 12);
      const testUser = new User({
        firstName: 'John',
        lastName: 'Smith',
        email: 'doctor@test.com',
        password: hashedPassword,
        userType: 'doctor',
        dateOfBirth: new Date('1980-01-01'),
        address: {
          street: '123 Medical Center Dr',
          city: 'Phoenix',
          state: 'AZ',
          zipCode: '85001',
          country: 'USA'
        }
      });
      
      await testUser.save();
      console.log('✅ Test user created:', testUser._id);

      // Create doctor profile
      const doctorProfile = new Doctor({
        userId: testUser._id,
        medicalLicenseNumber: 'MD123456',
        licenseState: 'AZ',
        licenseExpiryDate: new Date('2025-12-31'),
        primarySpecialty: 'Cardiology',
        yearsOfExperience: 10,
        bio: 'Experienced cardiologist dedicated to patient care.',
        isAcceptingNewPatients: true,
        languages: ['English', 'Spanish']
      });
      
      await doctorProfile.save();
      console.log('✅ Doctor profile created');

      // Generate a test token
      const token = jwt.sign(
        { 
          userId: testUser._id, 
          userType: 'doctor',
          email: testUser.email 
        },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      console.log('\n🔑 Test Authentication Details:');
      console.log('Email: doctor@test.com');
      console.log('Password: password123');
      console.log('User ID:', testUser._id.toString());
      console.log('Token (for localStorage):', token);

    } else {
      // Generate token for existing doctor
      const firstDoctor = existingDoctors[0];
      const token = jwt.sign(
        { 
          userId: firstDoctor._id, 
          userType: 'doctor',
          email: firstDoctor.email 
        },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      console.log('\n🔑 Existing Doctor Token:');
      console.log('Email:', firstDoctor.email);
      console.log('User ID:', firstDoctor._id.toString());
      console.log('Token (for localStorage):', token);

      // Also show user object for localStorage
      const userForStorage = {
        _id: firstDoctor._id.toString(),
        id: firstDoctor._id.toString(),
        firstName: firstDoctor.firstName,
        lastName: firstDoctor.lastName,
        email: firstDoctor.email,
        phone: firstDoctor.phone,
        userType: 'doctor',
        address: firstDoctor.address,
        profilePicture: firstDoctor.profilePicture || ''
      };

      console.log('\nUser object for localStorage:');
      console.log(JSON.stringify(userForStorage, null, 2));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

testAuthentication();