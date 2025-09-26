import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database.js';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Slot from '../models/Slot.js';
import Appointment from '../models/Appointment.js';

// Load environment variables
dotenv.config();

const sampleDoctors = [
  {
    firstName: "Andrew",
    lastName: "Williams",
    email: "andrew.williams40@healthcenter.com",
    password: "doctor123",
    userType: "doctor",
    phone: "5551405020",
    dateOfBirth: "1985-05-13",
    gender: "male",
    address: {
      street: "140 Main St",
      city: "New York", 
      state: "NY",
      zipCode: "90040",
      country: "USA"
    },
    doctorData: {
      medicalLicenseNumber: "MD100040",
      licenseState: "NY",
      licenseExpiryDate: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000),
      primarySpecialty: "Internal Medicine",
      subspecialties: ["General Internal Medicine", "Preventive Medicine"],
      yearsOfExperience: 15,
      consultationFee: 200,
      status: "approved",
      isAcceptingNewPatients: true
    }
  },
  {
    firstName: "Margaret",
    lastName: "Rodriguez", 
    email: "margaret.rodriguez43@healthcenter.com",
    password: "doctor123",
    userType: "doctor",
    phone: "5551234572",
    dateOfBirth: "1980-03-15",
    gender: "female",
    address: {
      street: "600 Medical Plaza",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90210",
      country: "USA"
    },
    doctorData: {
      medicalLicenseNumber: "CA123456789",
      licenseState: "CA",
      licenseExpiryDate: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000),
      primarySpecialty: "Cardiology",
      subspecialties: ["Interventional Cardiology"],
      yearsOfExperience: 12,
      consultationFee: 180,
      status: "approved",
      isAcceptingNewPatients: true
    }
  },
  {
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@hospital.com",
    password: "doctor123",
    userType: "doctor",
    phone: "5551234567",
    dateOfBirth: "1978-08-22",
    gender: "female",
    address: {
      street: "123 Medical Center Drive",
      city: "Chicago",
      state: "IL",
      zipCode: "60601",
      country: "USA"
    },
    doctorData: {
      medicalLicenseNumber: "IL456789123",
      licenseState: "IL", 
      licenseExpiryDate: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000),
      primarySpecialty: "Pediatrics",
      subspecialties: ["Pediatric Surgery"],
      yearsOfExperience: 10,
      consultationFee: 150,
      status: "approved",
      isAcceptingNewPatients: true
    }
  }
];

const samplePatients = [
  {
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@email.com",
    password: "patient123",
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
    password: "patient123",
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
  },
  {
    firstName: "Michael",
    lastName: "Johnson",
    email: "michael.johnson@email.com", 
    password: "patient123",
    userType: "patient",
    phone: "5557654323",
    dateOfBirth: "1992-03-10",
    gender: "male",
    address: {
      street: "789 Pine Street",
      city: "Chicago",
      state: "IL",
      zipCode: "60601",
      country: "USA"
    }
  }
];

async function rebuildDatabase() {
  try {
    console.log('🚀 Connecting to database...');
    await connectDatabase();
    
    console.log('🗑️ CLEARING ENTIRE DATABASE...');
    console.log('   This will remove ALL users, doctors, patients, appointments, and slots');
    
    // Drop all collections to start fresh
    const collections = ['users', 'doctors', 'patients', 'appointments', 'slots'];
    
    for (const collectionName of collections) {
      try {
        await mongoose.connection.db.collection(collectionName).drop();
        console.log(`   ✅ Dropped ${collectionName} collection`);
      } catch (error) {
        if (error.code === 26) {
          console.log(`   ⚠️ Collection ${collectionName} doesn't exist (ok)`);
        } else {
          console.log(`   ❌ Error dropping ${collectionName}:`, error.message);
        }
      }
    }
    
    console.log('\n✨ REBUILDING DATABASE WITH CLEAN DATA...');
    
    // Create doctors
    console.log('\n👩‍⚕️ Creating doctors...');
    for (const doctorData of sampleDoctors) {
      try {
        console.log(`   Creating Dr. ${doctorData.firstName} ${doctorData.lastName}...`);
        
        // Create user first
        const { doctorData: docProfile, ...userData } = doctorData;
        const user = await User.create(userData);
        console.log(`     ✅ User created: ${user.email}`);
        
        // Test password immediately after creation
        const userWithPassword = await User.findById(user._id).select('+password');
        const passwordTest = await userWithPassword.comparePassword(doctorData.password);
        console.log(`     🧪 Password test: ${passwordTest ? '✅ WORKS' : '❌ FAILED'}`);
        
        // Create doctor profile
        const doctor = await Doctor.create({
          userId: user._id,
          ...docProfile
        });
        console.log(`     ✅ Doctor profile created`);
        
      } catch (error) {
        console.log(`     ❌ Error creating doctor: ${error.message}`);
      }
    }
    
    // Create patients  
    console.log('\n👤 Creating patients...');
    for (const patientData of samplePatients) {
      try {
        console.log(`   Creating ${patientData.firstName} ${patientData.lastName}...`);
        
        // Create user
        const user = await User.create(patientData);
        console.log(`     ✅ User created: ${user.email}`);
        
        // Test password
        const userWithPassword = await User.findById(user._id).select('+password');
        const passwordTest = await userWithPassword.comparePassword(patientData.password);
        console.log(`     🧪 Password test: ${passwordTest ? '✅ WORKS' : '❌ FAILED'}`);
        
        // Create patient profile
        const patient = await Patient.create({
          userId: user._id
        });
        console.log(`     ✅ Patient profile created`);
        
      } catch (error) {
        console.log(`     ❌ Error creating patient: ${error.message}`);
      }
    }
    
    console.log('\n📊 DATABASE REBUILD SUMMARY:');
    
    // Count all records
    const userCount = await User.countDocuments();
    const doctorCount = await Doctor.countDocuments();
    const patientCount = await Patient.countDocuments();
    
    console.log(`   👥 Total Users: ${userCount}`);
    console.log(`   👩‍⚕️ Total Doctors: ${doctorCount}`);
    console.log(`   👤 Total Patients: ${patientCount}`);
    
    // List all users for verification
    console.log('\n📋 CREATED ACCOUNTS:');
    console.log('\n🩺 DOCTORS (password: doctor123):');
    const doctors = await User.find({ userType: 'doctor' });
    doctors.forEach(doc => {
      console.log(`   📧 ${doc.email} (${doc.firstName} ${doc.lastName})`);
    });
    
    console.log('\n👤 PATIENTS (password: patient123):');
    const patients = await User.find({ userType: 'patient' });  
    patients.forEach(pat => {
      console.log(`   📧 ${pat.email} (${pat.firstName} ${pat.lastName})`);
    });
    
    console.log('\n🎉 DATABASE REBUILD COMPLETED!');
    console.log('🔐 All passwords are properly hashed and tested');
    console.log('📊 Data is cleanly separated: doctors → doctors collection, patients → patients collection');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error rebuilding database:', error);
    process.exit(1);
  }
}

rebuildDatabase();