import dotenv from 'dotenv';
import { connectDatabase } from '../config/database.js';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';

// Load environment variables
dotenv.config();

const andrewWilliamsData = {
  firstName: "Andrew",
  lastName: "Williams", 
  email: "andrew.williams40@healthcenter.com",
  password: "doctor123",
  userType: "doctor",
  phone: "5551234571",
  dateOfBirth: "1983-04-12",
  gender: "male",
  address: {
    street: "500 Health Center Drive",
    city: "Miami",
    state: "FL",
    zipCode: "33101",
    country: "USA"
  },
  doctorData: {
    medicalLicenseNumber: "FL987654321",
    licenseState: "FL",
    licenseExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    primarySpecialty: "Internal Medicine",
    subspecialties: ["General Internal Medicine", "Preventive Medicine"],
    yearsOfExperience: 10,
    consultationFee: 175,
    status: "approved",
    isAcceptingNewPatients: true,
    bio: "Dr. Andrew Williams is an experienced internal medicine physician with over 10 years of practice. He specializes in comprehensive primary care and preventive medicine.",
    averageRating: 4.8,
    totalReviews: 125
  }
};

async function createAndrewWilliams() {
  try {
    console.log('🚀 Connecting to database...');
    await connectDatabase();
    
    console.log('🔍 Checking if Andrew Williams already exists...');
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: andrewWilliamsData.email });
    
    if (existingUser) {
      console.log('📝 User exists, updating password...');
      
      // Update the password
      existingUser.password = andrewWilliamsData.password;
      await existingUser.save();
      
      console.log('✅ Password updated successfully!');
    } else {
      console.log('👤 Creating new Andrew Williams account...');
      
      // Create user
      const { doctorData, ...userFields } = andrewWilliamsData;
      const user = await User.create(userFields);
      console.log(`✅ Created user: ${user.email}`);
      
      // Create doctor profile
      const doctor = await Doctor.create({
        userId: user._id,
        ...doctorData
      });
      console.log(`✅ Created doctor profile for: ${user.email}`);
    }
    
    console.log('\n🎉 Andrew Williams account is ready!');
    console.log('\n📋 Login Credentials:');
    console.log(`   Email: ${andrewWilliamsData.email}`);
    console.log(`   Password: ${andrewWilliamsData.password}`);
    console.log(`   Specialty: ${andrewWilliamsData.doctorData.primarySpecialty}`);
    
    // Test login
    console.log('\n🧪 Testing login...');
    const loginTestUser = await User.findOne({ email: andrewWilliamsData.email }).select('+password');
    
    if (loginTestUser) {
      const isPasswordValid = await loginTestUser.comparePassword(andrewWilliamsData.password);
      console.log(`Password validation result: ${isPasswordValid ? '✅ Valid' : '❌ Invalid'}`);
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error creating Andrew Williams account:', error);
    process.exit(1);
  }
}

// Run the script
createAndrewWilliams();