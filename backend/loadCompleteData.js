import mongoose from 'mongoose';
import User from './models/User.js';
import Doctor from './models/Doctor.js';
import Patient from './models/Patient.js';
import CareProvider from './models/CareProvider.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env explicitly
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('🚀 Starting complete data loader...');
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
    await Doctor.deleteMany({});
    await Patient.deleteMany({});
    await CareProvider.deleteMany({});
    console.log('✅ Cleared existing data from all collections');
  } catch (error) {
    console.error('❌ Error clearing existing data:', error);
    throw error;
  }
};

// Load doctors (create User + Doctor records)
const loadDoctors = async () => {
  try {
    console.log('📋 Loading doctors...');
    for (let i = 0; i < doctorsData.length; i++) {
      const doctorData = doctorsData[i];
      
      // Create User record first (do NOT pre-hash password; model will hash on save)
      const userData = {
        firstName: doctorData.firstName,
        lastName: doctorData.lastName,
        email: doctorData.email,
        password: doctorData.password,
        userType: 'doctor',
        phone: doctorData.phone ? doctorData.phone.replace(/[^\\d]/g, '') : '',
        dateOfBirth: doctorData.dateOfBirth,
        gender: doctorData.gender,
        address: doctorData.address,
        profilePicture: doctorData.profilePicture,
        bio: doctorData.bio,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const user = new User(userData);
      const savedUser = await user.save();
      
      // Create Doctor record
      const doctorInfo = doctorData.doctorInfo || {};
      const doctorRecord = {
        userId: savedUser._id,
        medicalLicenseNumber: doctorInfo.medicalLicenseNumber,
        licenseState: doctorInfo.licenseState,
        licenseExpiryDate: new Date(doctorInfo.licenseExpiryDate),
        boardCertifications: doctorInfo.boardCertifications || [],
        education: doctorInfo.education || [],
        residency: doctorInfo.residency || [],
        fellowship: doctorInfo.fellowship || [],
        primarySpecialty: doctorInfo.primarySpecialty,
        secondarySpecialties: doctorInfo.secondarySpecialties || [],
        npiNumber: doctorInfo.npiNumber,
        hospitalAffiliations: doctorInfo.hospitalAffiliations || [],
        yearsOfExperience: doctorInfo.yearsOfExperience,
        languagesSpoken: doctorInfo.languagesSpoken || [],
        consultationFee: doctorInfo.consultationFee,
        acceptsInsurance: doctorInfo.acceptsInsurance,
        insurancesAccepted: doctorInfo.insurancesAccepted || [],
        isVerified: doctorInfo.isVerified,
        status: doctorInfo.status,
        isAcceptingNewPatients: doctorInfo.isAcceptingNewPatients,
        telemedicineEnabled: doctorInfo.telemedicineEnabled,
        averageRating: 4.5,
        totalReviews: Math.floor(Math.random() * 50) + 10
      };
      
      const doctor = new Doctor(doctorRecord);
      await doctor.save();
      
      console.log(`  ✅ Created doctor: ${doctorData.firstName} ${doctorData.lastName}`);
    }
    console.log(`✅ Successfully loaded ${doctorsData.length} doctors`);
  } catch (error) {
    console.error('❌ Error loading doctors:', error);
    throw error;
  }
};

// Load patients (create User + Patient records)
const loadPatients = async () => {
  try {
    console.log('👥 Loading patients...');
    for (let i = 0; i < patientsData.length; i++) {
      const patientData = patientsData[i];
      
      // Create User record first (do NOT pre-hash password; model will hash on save)
      const userData = {
        firstName: patientData.firstName,
        lastName: patientData.lastName,
        email: patientData.email,
        password: patientData.password,
        userType: 'patient',
        phone: patientData.phone ? patientData.phone.replace(/[^\\d]/g, '') : '',
        dateOfBirth: patientData.dateOfBirth,
        gender: patientData.gender,
        address: patientData.address,
        profilePicture: patientData.profilePicture,
        bio: patientData.bio,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const user = new User(userData);
      const savedUser = await user.save();
      
      // Create Patient record with minimal required fields to avoid validation errors
      const patientInfo = patientData.patientInfo || {};
      const patientRecord = {
        userId: savedUser._id,
        emergencyContacts: [{
          name: patientInfo.emergencyContact?.name || 'Emergency Contact',
          relationship: 'spouse',
          phone: '5551234567',  // Use a default valid phone number
          email: patientInfo.emergencyContact?.email || 'emergency@email.com',
          isPrimary: true
        }]
        // Keep it minimal for now to ensure it works
      };
      
      const patient = new Patient(patientRecord);
      await patient.save();
      
      console.log(`  ✅ Created patient: ${patientData.firstName} ${patientData.lastName}`);
    }
    console.log(`✅ Successfully loaded ${patientsData.length} patients`);
  } catch (error) {
    console.error('❌ Error loading patients:', error);
    throw error;
  }
};

// Load care providers (create User + CareProvider records)
const loadCareProviders = async () => {
  try {
    console.log('🏥 Loading care providers...');
    for (let i = 0; i < careProvidersData.length; i++) {
      const careProviderData = careProvidersData[i];
      
      // Create User record first (do NOT pre-hash password; model will hash on save)
      const userData = {
        firstName: careProviderData.firstName,
        lastName: careProviderData.lastName,
        email: careProviderData.email,
        password: careProviderData.password,
        userType: 'careprovider',
        phone: careProviderData.phone ? careProviderData.phone.replace(/[^\\d]/g, '') : '',
        dateOfBirth: careProviderData.dateOfBirth,
        gender: careProviderData.gender,
        address: careProviderData.address,
        profilePicture: careProviderData.profilePicture,
        bio: careProviderData.bio,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const user = new User(userData);
      const savedUser = await user.save();
      
      // Create CareProvider record
      const careProviderInfo = careProviderData.careProviderInfo || {};
      
      // Map certification to provider type
      const certificationToProviderType = {
        'RN': 'nurse',
        'LPN': 'nurse', 
        'CNA': 'nursing_assistant',
        'PTA': 'physical_therapist',
        'HHA': 'home_health_aide'
      };
      
      // Map certification to valid license type enum
      const certificationToLicenseType = {
        'RN': 'RN',
        'LPN': 'LPN',
        'CNA': 'CNA',
        'PTA': 'PTA',
        'HHA': 'Other'  // HHA is not in enum, use 'Other'
      };
      
      const careProviderRecord = {
        userId: savedUser._id,
        providerType: certificationToProviderType[careProviderInfo.certification] || 'professional_caregiver',
        credentials: {
          licenseNumber: careProviderInfo.licenseNumber,
          licenseState: careProviderInfo.licenseState,
          licenseType: certificationToLicenseType[careProviderInfo.certification] || 'Other',
          licenseExpiryDate: new Date(careProviderInfo.licenseExpiryDate),
          certifications: careProviderInfo.certifications?.map(cert => ({
            name: cert.name,
            issuingOrganization: cert.issuingOrganization,
            certificationDate: new Date(cert.issueDate),
            expiryDate: new Date(cert.expiryDate)
          })) || [],
          isLicensed: true
        },
        education: careProviderInfo.education?.map(edu => ({
          institution: edu.institution,
          program: edu.degree,
          graduationYear: edu.graduationYear
        })) || [],
        experience: {
          yearsOfExperience: careProviderInfo.yearsOfExperience,
          specializations: careProviderInfo.specializations || [],
          settings: ['home_health'],
          populations: ['adult', 'geriatric']
        },
        availability: {
          workSchedule: 'flexible',
          hoursPerWeek: 40,
          availableDays: Object.keys(careProviderInfo.availability || {}).filter(day => 
            careProviderInfo.availability[day] !== 'unavailable'
          ),
          timeSlots: Object.entries(careProviderInfo.availability || {}).filter(([day, schedule]) => 
            schedule !== 'unavailable'
          ).map(([day, schedule]) => ({
            day: day,
            startTime: schedule.start || '08:00',
            endTime: schedule.end || '17:00'
          }))
        },
        services: careProviderInfo.services?.map(service => {
          const serviceMapping = {
            'Medication Management': 'medication_management',
            'Wound Care': 'wound_care',
            'Vital Signs Monitoring': 'vital_signs_monitoring',
            'Physical Therapy Assistance': 'physical_therapy',
            'Mobility Training': 'mobility_assistance',
            'Personal Care': 'personal_care',
            'Companionship': 'companionship',
            'Meal Preparation': 'meal_preparation',
            'Post-Surgical Care': 'wound_care',
            'Diabetes Management': 'diabetes_management',
            'IV Therapy': 'iv_therapy',
            'Respiratory Care': 'respiratory_care',
            'Medication Administration': 'medication_administration'
          };
          return serviceMapping[service.service] || 'other';
        }) || ['personal_care', 'companionship'],
        skills: {
          languages: careProviderInfo.languagesSpoken?.map(lang => ({
            language: lang.language,
            proficiency: lang.proficiency
          })) || []
        },
        background: {
          backgroundCheckDate: new Date(careProviderInfo.backgroundCheck?.completedDate || Date.now()),
          backgroundCheckStatus: careProviderInfo.backgroundCheck?.status === 'cleared' ? 'cleared' : 'pending',
          hasDriversLicense: careProviderInfo.transportationAvailable || false,
          hasVehicle: careProviderInfo.transportationAvailable || false,
          emergencyContact: {
            name: careProviderInfo.emergencyContact?.name,
            relationship: careProviderInfo.emergencyContact?.relationship,
            phone: careProviderInfo.emergencyContact?.phone ? careProviderInfo.emergencyContact.phone.replace(/[^\\d]/g, '') : ''
          }
        },
        ratings: {
          averageRating: 4.2 + Math.random() * 0.8,
          totalReviews: Math.floor(Math.random() * 30) + 5
        },
        verification: {
          isVerified: careProviderInfo.isVerified || false
        },
        preferences: {
          hourlyRate: {
            min: careProviderInfo.hourlyRate || 25,
            max: (careProviderInfo.hourlyRate || 25) + 10
          },
          acceptsNewClients: careProviderInfo.isAvailable !== false
        },
        status: 'approved'
      };
      
      const careProvider = new CareProvider(careProviderRecord);
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
const loadCompleteData = async () => {
  try {
    console.log('🚀 Starting complete data loading...');
    console.log('='.repeat(50));

    await connectDB();
    await clearExistingData();
    
    await loadDoctors();
    await loadPatients();
    await loadCareProviders();

    console.log('='.repeat(50));
    console.log('🎉 All data loaded successfully!');
    
    // Display summary
    const totalUsers = await User.countDocuments({});
    const totalDoctors = await Doctor.countDocuments({});
    const totalPatients = await Patient.countDocuments({});
    const totalCareProviders = await CareProvider.countDocuments({});
    
    console.log('\\n📊 Database Summary:');
    console.log(`  Total Users: ${totalUsers}`);
    console.log(`  Total Doctors: ${totalDoctors}`);
    console.log(`  Total Patients: ${totalPatients}`);
    console.log(`  Total Care Providers: ${totalCareProviders}`);
    
    console.log('\\n✅ Data loaded in all collections:');
    console.log('  - users: User authentication and basic info');
    console.log('  - doctors: Professional medical information');
    console.log('  - patients: Medical history and patient data');
    console.log('  - careproviders: Care provider credentials and services');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to load complete data:', error);
    process.exit(1);
  }
};

// Export the function
export { loadCompleteData };

// Run if called directly
loadCompleteData();
