import dotenv from 'dotenv';
import { connectDatabase } from '../config/database.js';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';

// Load environment variables
dotenv.config();

const sampleUsers = [
  // Sample Doctors
  {
    firstName: "Dr. Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@hospital.com",
    password: "password123",
    userType: "doctor",
    phone: "5551234567",
    dateOfBirth: "1980-05-15",
    gender: "female",
    address: {
      street: "123 Medical Center Drive",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "USA"
    },
    doctorData: {
      medicalLicenseNumber: "NY123456789",
      licenseState: "NY",
      licenseExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      primarySpecialty: "Cardiology",
      subspecialties: ["Interventional Cardiology", "Heart Surgery"],
      yearsOfExperience: 15,
      consultationFee: 200,
      status: "approved",
      isAcceptingNewPatients: true
    }
  },
  {
    firstName: "Dr. Michael",
    lastName: "Chen",
    email: "michael.chen@clinic.com",
    password: "password123", 
    userType: "doctor",
    phone: "5551234568",
    dateOfBirth: "1975-08-22",
    gender: "male",
    address: {
      street: "456 Healthcare Boulevard",
      city: "Los Angeles",
      state: "CA", 
      zipCode: "90210",
      country: "USA"
    },
    doctorData: {
      medicalLicenseNumber: "CA987654321",
      licenseState: "CA",
      licenseExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      primarySpecialty: "Pediatrics",
      subspecialties: ["Pediatric Surgery", "Neonatology"],
      yearsOfExperience: 12,
      consultationFee: 150,
      status: "approved",
      isAcceptingNewPatients: true
    }
  },
  {
    firstName: "Dr. Emily",
    lastName: "Rodriguez",
    email: "emily.rodriguez@medcenter.com",
    password: "password123",
    userType: "doctor", 
    phone: "5551234569",
    dateOfBirth: "1985-03-10",
    gender: "female",
    address: {
      street: "789 Wellness Street",
      city: "Chicago",
      state: "IL",
      zipCode: "60601", 
      country: "USA"
    },
    doctorData: {
      medicalLicenseNumber: "IL456789123",
      licenseState: "IL",
      licenseExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      primarySpecialty: "Dermatology",
      subspecialties: ["Cosmetic Dermatology", "Dermatopathology"],
      yearsOfExperience: 8,
      consultationFee: 180,
      status: "approved",
      isAcceptingNewPatients: true
    }
  },
  {
    firstName: "Dr. James",
    lastName: "Wilson",
    email: "james.wilson@hospital.com",
    password: "password123",
    userType: "doctor",
    phone: "5551234570", 
    dateOfBirth: "1978-12-05",
    gender: "male",
    address: {
      street: "321 Medical Plaza",
      city: "Houston",
      state: "TX",
      zipCode: "77001",
      country: "USA"
    },
    doctorData: {
      medicalLicenseNumber: "TX789123456",
      licenseState: "TX",
      licenseExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      primarySpecialty: "Orthopedics",
      subspecialties: ["Sports Medicine", "Joint Replacement"],
      yearsOfExperience: 20,
      consultationFee: 220,
      status: "approved",
      isAcceptingNewPatients: true
    }
  },

  // Sample Patients
  {
    firstName: "John",
    lastName: "Smith", 
    email: "john.smith@email.com",
    password: "password123",
    userType: "patient",
    phone: "5557654321",
    dateOfBirth: "1990-07-15",
    gender: "male",
    address: {
      street: "123 Main Street",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "USA"
    }
  },
  {
    firstName: "Jane",
    lastName: "Doe",
    email: "jane.doe@email.com", 
    password: "password123",
    userType: "patient",
    phone: "5557654322",
    dateOfBirth: "1985-11-20",
    gender: "female",
    address: {
      street: "456 Oak Avenue",
      city: "Los Angeles", 
      state: "CA",
      zipCode: "90210",
      country: "USA"
    }
  }
];

async function createSampleData() {
  try {
    console.log('🚀 Connecting to database...');
    await connectDatabase();
    
    console.log('🗑️ Clearing existing sample data...');
    // Clear existing data with specific emails to avoid deleting real user data
    const sampleEmails = sampleUsers.map(u => u.email);
    
    // Get user IDs first
    const existingUsers = await User.find({ email: { $in: sampleEmails } });
    const userIds = existingUsers.map(u => u._id);
    
    // Delete related profiles
    await Doctor.deleteMany({ userId: { $in: userIds } });
    await Patient.deleteMany({ userId: { $in: userIds } });
    
    // Delete users
    await User.deleteMany({ email: { $in: sampleEmails } });
    
    console.log('✨ Creating sample users and profiles...');
    
    for (const userData of sampleUsers) {
      try {
        // Create user
        const { doctorData, ...userFields } = userData;
        const user = await User.create(userFields);
        console.log(`✅ Created user: ${user.email}`);
        
        // Create type-specific profile
        if (userData.userType === 'doctor') {
          const doctor = await Doctor.create({
            userId: user._id,
            ...doctorData
          });
          console.log(`✅ Created doctor profile for: ${user.email}`);
        } else if (userData.userType === 'patient') {
          const patient = await Patient.create({
            userId: user._id
          });
          console.log(`✅ Created patient profile for: ${user.email}`);
        }
        
      } catch (error) {
        console.error(`❌ Error creating user ${userData.email}:`, error.message);
      }
    }
    
    console.log('\n🎉 Sample data creation completed!');
    console.log('\n📋 You can now login with these credentials:');
    console.log('\n👩‍⚕️ DOCTORS:');
    sampleUsers.filter(u => u.userType === 'doctor').forEach(user => {
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: ${user.password}`);
      console.log(`   Specialty: ${user.doctorData.primarySpecialty}\n`);
    });
    
    console.log('👤 PATIENTS:');
    sampleUsers.filter(u => u.userType === 'patient').forEach(user => {
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: ${user.password}\n`);
    });
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
    process.exit(1);
  }
}

// Run the script
createSampleData();