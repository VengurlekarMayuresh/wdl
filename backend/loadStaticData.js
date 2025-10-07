import mongoose from 'mongoose';
import User from './models/User.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env explicitly
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('🚀 Starting static data loader...');
console.log(`Current directory: ${__dirname}`);
console.log(`MongoDB URI: ${process.env.MONGODB_URI ? 'Found' : 'Not found'}`);

// Load static data files (prefer combined data.json if present)
let doctorsData, patientsData, careProvidersData;
try {
  console.log('📂 Loading data files...');
  const combinedPath = path.join(__dirname, 'data/data.json');
  if (fs.existsSync(combinedPath)) {
    const combined = JSON.parse(fs.readFileSync(combinedPath, 'utf8'));
    doctorsData = combined.doctors || [];
    patientsData = combined.patients || [];
    careProvidersData = combined.careProviders || [];
  } else {
    doctorsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/doctors.json'), 'utf8'));
    patientsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/patients.json'), 'utf8'));
    careProvidersData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/careProviders.json'), 'utf8'));
  }
  console.log(`✅ Loaded ${doctorsData.length} doctors, ${patientsData.length} patients, ${careProvidersData.length} care providers`);
} catch (error) {
  console.error('❌ Error loading data files:', error);
  process.exit(1);
}

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log('🔌 Attempting to connect to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthcare-management');
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

// Clear existing data
const clearExistingData = async () => {
  try {
    await User.deleteMany({});
    console.log('✅ Cleared existing data');
  } catch (error) {
    console.error('❌ Error clearing existing data:', error);
    throw error;
  }
};

// Load doctors
const loadDoctors = async () => {
  try {
    console.log('📋 Loading doctors...');
    for (let i = 0; i < doctorsData.length; i++) {
      const doctorData = doctorsData[i];
      // Do NOT pre-hash; User model will hash on save
      doctorData.userType = 'doctor';
      // Convert phone format from (555) 123-4567 to 5551234567
      if (doctorData.phone) {
        doctorData.phone = doctorData.phone.replace(/[^\d]/g, '');
      }
      doctorData.createdAt = new Date();
      doctorData.updatedAt = new Date();

      const doctor = new User(doctorData);
      await doctor.save();
      console.log(`  ✅ Created doctor: ${doctorData.firstName} ${doctorData.lastName}`);
    }
    console.log(`✅ Successfully loaded ${doctorsData.length} doctors`);
  } catch (error) {
    console.error('❌ Error loading doctors:', error);
    throw error;
  }
};

// Load patients
const loadPatients = async () => {
  try {
    console.log('👥 Loading patients...');
    for (let i = 0; i < patientsData.length; i++) {
      const patientData = patientsData[i];
      // Do NOT pre-hash; User model will hash on save
      patientData.userType = 'patient';
      // Convert phone format from (555) 123-4567 to 5551234567
      if (patientData.phone) {
        patientData.phone = patientData.phone.replace(/[^\d]/g, '');
      }
      patientData.createdAt = new Date();
      patientData.updatedAt = new Date();

      const patient = new User(patientData);
      await patient.save();
      console.log(`  ✅ Created patient: ${patientData.firstName} ${patientData.lastName}`);
    }
    console.log(`✅ Successfully loaded ${patientsData.length} patients`);
  } catch (error) {
    console.error('❌ Error loading patients:', error);
    throw error;
  }
};

// Load care providers
const loadCareProviders = async () => {
  try {
    console.log('🏥 Loading care providers...');
    for (let i = 0; i < careProvidersData.length; i++) {
      const careProviderData = careProvidersData[i];
      // Do NOT pre-hash; User model will hash on save
      careProviderData.userType = 'careprovider';
      // Convert phone format from (555) 123-4567 to 5551234567
      if (careProviderData.phone) {
        careProviderData.phone = careProviderData.phone.replace(/[^\d]/g, '');
      }
      careProviderData.createdAt = new Date();
      careProviderData.updatedAt = new Date();

      const careProvider = new User(careProviderData);
      await careProvider.save();
      console.log(`  ✅ Created care provider: ${careProviderData.firstName} ${careProviderData.lastName}`);
    }
    console.log(`✅ Successfully loaded ${careProvidersData.length} care providers`);
  } catch (error) {
    console.error('❌ Error loading care providers:', error);
    throw error;
  }
};

// Main loading function
const loadStaticData = async () => {
  try {
    console.log('🚀 Starting static data loading...');
    console.log('='.repeat(50));

    await connectDB();
    await clearExistingData();
    
    await loadDoctors();
    await loadPatients();
    await loadCareProviders();

    console.log('='.repeat(50));
    console.log('🎉 All static data loaded successfully!');
    
    // Display summary
    const totalUsers = await User.countDocuments({});
    const totalDoctors = await User.countDocuments({ userType: 'doctor' });
    const totalPatients = await User.countDocuments({ userType: 'patient' });
    const totalCareProviders = await User.countDocuments({ userType: 'careprovider' });
    
    console.log('\n📊 Database Summary:');
    console.log(`  Total Users: ${totalUsers}`);
    console.log(`  Doctors: ${totalDoctors}`);
    console.log(`  Patients: ${totalPatients}`);
    console.log(`  Care Providers: ${totalCareProviders}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to load static data:', error);
    process.exit(1);
  }
};

// Export the function
export { loadStaticData };

// Run if called directly
loadStaticData();
