import dotenv from 'dotenv';
import { connectDatabase } from '../config/database.js';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';

// Load environment variables
dotenv.config();

async function fixDoctorProfiles() {
  try {
    console.log('🚀 Connecting to database...');
    await connectDatabase();
    
    console.log('🔍 Finding all doctor users without doctor profiles...');
    
    // Get all users with userType 'doctor'
    const doctorUsers = await User.find({ userType: 'doctor' });
    console.log(`📊 Found ${doctorUsers.length} doctor users in users collection`);
    
    // Get all existing doctor profiles
    const existingDoctorProfiles = await Doctor.find({});
    const existingDoctorUserIds = existingDoctorProfiles.map(doc => doc.userId.toString());
    console.log(`📊 Found ${existingDoctorProfiles.length} doctor profiles in doctors collection`);
    
    // Find users without doctor profiles
    const usersWithoutProfiles = doctorUsers.filter(user => 
      !existingDoctorUserIds.includes(user._id.toString())
    );
    
    console.log(`🔧 Found ${usersWithoutProfiles.length} doctor users missing profiles`);
    
    if (usersWithoutProfiles.length === 0) {
      console.log('✅ All doctor users already have profiles!');
      process.exit(0);
    }
    
    console.log('\n👨‍⚕️ Creating missing doctor profiles...');
    
    for (const user of usersWithoutProfiles) {
      try {
        console.log(`\n🔨 Creating profile for: ${user.firstName} ${user.lastName} (${user.email})`);
        
        // Generate a unique medical license number
        const licenseNumber = `AUTO_${user._id.toString().substring(0, 8).toUpperCase()}`;
        
        // Determine state from user address or use a default
        const state = user.address?.state || 'CA';
        
        // Choose a primary specialty (you might want to randomize this)
        const specialties = ['Internal Medicine', 'Family Medicine', 'Cardiology', 'Pediatrics', 'Dermatology'];
        const randomSpecialty = specialties[Math.floor(Math.random() * specialties.length)];
        
        const doctorProfile = {
          userId: user._id,
          medicalLicenseNumber: licenseNumber,
          licenseState: state,
          licenseExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
          primarySpecialty: randomSpecialty,
          yearsOfExperience: Math.floor(Math.random() * 20) + 5, // 5-25 years
          consultationFee: Math.floor(Math.random() * 200) + 100, // $100-300
          status: 'approved',
          isAcceptingNewPatients: true,
          bio: `Dr. ${user.firstName} ${user.lastName} is an experienced ${randomSpecialty.toLowerCase()} physician dedicated to providing quality healthcare.`,
          averageRating: (Math.random() * 2 + 3).toFixed(1), // 3.0-5.0 rating
          totalReviews: Math.floor(Math.random() * 50) + 10 // 10-60 reviews
        };
        
        const createdDoctor = await Doctor.create(doctorProfile);
        console.log(`✅ Created doctor profile with license: ${licenseNumber}`);
        
      } catch (error) {
        if (error.code === 11000) {
          // Duplicate key error - try with a different license number
          const alternateLicenseNumber = `ALT_${user._id.toString().substring(8, 16).toUpperCase()}`;
          try {
            const doctorProfile = {
              userId: user._id,
              medicalLicenseNumber: alternateLicenseNumber,
              licenseState: user.address?.state || 'CA',
              licenseExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
              primarySpecialty: 'Internal Medicine',
              yearsOfExperience: 10,
              consultationFee: 150,
              status: 'approved',
              isAcceptingNewPatients: true
            };
            
            await Doctor.create(doctorProfile);
            console.log(`✅ Created doctor profile with alternate license: ${alternateLicenseNumber}`);
          } catch (retryError) {
            console.error(`❌ Failed to create profile for ${user.email} (retry):`, retryError.message);
          }
        } else {
          console.error(`❌ Error creating profile for ${user.email}:`, error.message);
        }
      }
    }
    
    console.log('\n🎉 Doctor profile creation completed!');
    
    // Verify the fix
    console.log('\n🔍 Verifying the fix...');
    const updatedDoctorProfiles = await Doctor.find({});
    const updatedDoctorUsers = await User.find({ userType: 'doctor' });
    
    console.log(`📊 Doctor users: ${updatedDoctorUsers.length}`);
    console.log(`📊 Doctor profiles: ${updatedDoctorProfiles.length}`);
    
    if (updatedDoctorUsers.length === updatedDoctorProfiles.length) {
      console.log('✅ All doctor users now have corresponding profiles!');
    } else {
      console.log('⚠️  Some users may still be missing profiles');
    }
    
    // Test the specific Andrew Williams login
    console.log('\n🧪 Testing Andrew Williams login...');
    const andrewUser = await User.findOne({ email: 'andrew.williams40@healthcenter.com' }).select('+password');
    
    if (andrewUser) {
      const andrewDoctorProfile = await Doctor.findOne({ userId: andrewUser._id });
      console.log(`User found: ✅`);
      console.log(`Doctor profile found: ${andrewDoctorProfile ? '✅' : '❌'}`);
      
      if (andrewDoctorProfile) {
        const passwordValid = await andrewUser.comparePassword('doctor123');
        console.log(`Password valid: ${passwordValid ? '✅' : '❌'}`);
        
        console.log('\n📋 Andrew Williams account details:');
        console.log(`   Email: ${andrewUser.email}`);
        console.log(`   User Type: ${andrewUser.userType}`);
        console.log(`   Specialty: ${andrewDoctorProfile.primarySpecialty}`);
        console.log(`   License: ${andrewDoctorProfile.medicalLicenseNumber}`);
        console.log(`   Status: ${andrewDoctorProfile.status}`);
      }
    } else {
      console.log('❌ Andrew Williams user not found');
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error fixing doctor profiles:', error);
    process.exit(1);
  }
}

// Run the script
fixDoctorProfiles();