const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Import models
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/healthcare', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('📁 Connected to MongoDB!');
    rebuildAllAccounts();
});

async function rebuildAllAccounts() {
    try {
        console.log('🚀 STARTING COMPLETE DATABASE REBUILD...\n');
        
        // Clear existing data
        console.log('🗑️ Clearing existing collections...');
        await User.deleteMany({});
        await Doctor.deleteMany({});
        await Patient.deleteMany({});
        console.log('✅ Collections cleared!\n');

        // Load sample data
        const doctorsPath = path.join(__dirname, '../data/doctors.json');
        const patientsPath = path.join(__dirname, '../data/patients.json');
        
        if (!fs.existsSync(doctorsPath)) {
            throw new Error(`Doctors data file not found: ${doctorsPath}`);
        }
        if (!fs.existsSync(patientsPath)) {
            throw new Error(`Patients data file not found: ${patientsPath}`);
        }

        const doctorsData = JSON.parse(fs.readFileSync(doctorsPath, 'utf8'));
        const patientsData = JSON.parse(fs.readFileSync(patientsPath, 'utf8'));
        
        console.log(`📊 Found ${doctorsData.length} doctors and ${patientsData.length} patients in sample data\n`);

        // Process doctors
        console.log('👨‍⚕️ Creating doctor accounts...');
        let doctorCount = 0;
        
        for (const doctorData of doctorsData) {
            try {
                // Hash password
                const hashedPassword = await bcrypt.hash(doctorData.password, 10);
                
                // Create user record
                const user = new User({
                    firstName: doctorData.firstName,
                    lastName: doctorData.lastName,
                    email: doctorData.email,
                    password: hashedPassword,
                    phone: doctorData.phone,
                    dateOfBirth: new Date(doctorData.dateOfBirth),
                    gender: doctorData.gender,
                    address: doctorData.address,
                    profilePicture: doctorData.profilePicture,
                    userType: 'doctor',
                    isActive: true,
                    isLocked: false,
                    failedLoginAttempts: 0,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                
                await user.save();
                
                // Create doctor profile
                const doctor = new Doctor({
                    user: user._id,
                    bio: doctorData.bio,
                    medicalLicenseNumber: doctorData.doctorInfo.medicalLicenseNumber,
                    licenseState: doctorData.doctorInfo.licenseState,
                    licenseExpiryDate: new Date(doctorData.doctorInfo.licenseExpiryDate),
                    primarySpecialty: doctorData.doctorInfo.primarySpecialty,
                    secondarySpecialties: doctorData.doctorInfo.secondarySpecialties || [],
                    yearsOfExperience: doctorData.doctorInfo.yearsOfExperience,
                    npiNumber: doctorData.doctorInfo.npiNumber,
                    education: doctorData.doctorInfo.education || [],
                    residency: doctorData.doctorInfo.residency || [],
                    hospitalAffiliations: doctorData.doctorInfo.hospitalAffiliations || [],
                    boardCertifications: doctorData.doctorInfo.boardCertifications || [],
                    languagesSpoken: doctorData.doctorInfo.languagesSpoken || [],
                    consultationFee: doctorData.doctorInfo.consultationFee,
                    acceptsInsurance: doctorData.doctorInfo.acceptsInsurance,
                    insurancesAccepted: doctorData.doctorInfo.insurancesAccepted || [],
                    isVerified: doctorData.doctorInfo.isVerified !== false,
                    status: doctorData.doctorInfo.status || 'approved',
                    isAcceptingNewPatients: doctorData.doctorInfo.isAcceptingNewPatients !== false,
                    telemedicineEnabled: doctorData.doctorInfo.telemedicineEnabled || false,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                
                await doctor.save();
                doctorCount++;
                
                if (doctorCount % 10 === 0) {
                    console.log(`   ✅ Created ${doctorCount} doctors so far...`);
                }
                
            } catch (error) {
                console.error(`❌ Error creating doctor ${doctorData.email}:`, error.message);
            }
        }
        
        console.log(`✅ Successfully created ${doctorCount} doctor accounts!\n`);

        // Process patients
        console.log('👥 Creating patient accounts...');
        let patientCount = 0;
        
        for (const patientData of patientsData) {
            try {
                // Hash password
                const hashedPassword = await bcrypt.hash(patientData.password, 10);
                
                // Create user record
                const user = new User({
                    firstName: patientData.firstName,
                    lastName: patientData.lastName,
                    email: patientData.email,
                    password: hashedPassword,
                    phone: patientData.phone,
                    dateOfBirth: new Date(patientData.dateOfBirth),
                    gender: patientData.gender,
                    address: patientData.address,
                    profilePicture: patientData.profilePicture,
                    userType: 'patient',
                    isActive: true,
                    isLocked: false,
                    failedLoginAttempts: 0,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                
                await user.save();
                
                // Create patient profile
                const patient = new Patient({
                    user: user._id,
                    emergencyContact: patientData.patientInfo?.emergencyContact || {
                        name: 'Emergency Contact',
                        phone: '555-0000',
                        relationship: 'Family'
                    },
                    bloodType: patientData.patientInfo?.bloodType || 'O+',
                    allergies: patientData.patientInfo?.allergies || [],
                    chronicConditions: patientData.patientInfo?.chronicConditions || [],
                    currentMedications: patientData.patientInfo?.currentMedications || [],
                    insuranceInfo: patientData.patientInfo?.insuranceInfo || {
                        provider: 'Insurance Provider',
                        policyNumber: 'POL12345',
                        groupNumber: 'GRP001'
                    },
                    preferredDoctors: [],
                    medicalHistory: patientData.patientInfo?.medicalHistory || [],
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                
                await patient.save();
                patientCount++;
                
                if (patientCount % 10 === 0) {
                    console.log(`   ✅ Created ${patientCount} patients so far...`);
                }
                
            } catch (error) {
                console.error(`❌ Error creating patient ${patientData.email}:`, error.message);
            }
        }
        
        console.log(`✅ Successfully created ${patientCount} patient accounts!\n`);

        // Test some sample logins
        console.log('🧪 Testing sample account logins...');
        const testAccounts = [
            'ashley.smith39@healthcenter.com',
            'andrew.williams40@healthcenter.com',
            'john.hernandez0@healthcenter.com'
        ];

        for (const email of testAccounts) {
            try {
                const user = await User.findOne({ email });
                if (user) {
                    const isPasswordValid = await bcrypt.compare('doctor123', user.password);
                    console.log(`   ${email}: ${isPasswordValid ? '✅ LOGIN OK' : '❌ LOGIN FAILED'}`);
                    
                    // Check profile exists
                    let profile;
                    if (user.userType === 'doctor') {
                        profile = await Doctor.findOne({ user: user._id });
                    } else {
                        profile = await Patient.findOne({ user: user._id });
                    }
                    console.log(`   ${email}: ${profile ? '✅ PROFILE OK' : '❌ PROFILE MISSING'}`);
                } else {
                    console.log(`   ${email}: ❌ USER NOT FOUND`);
                }
            } catch (error) {
                console.log(`   ${email}: ❌ TEST ERROR - ${error.message}`);
            }
        }

        console.log('\n🎉 DATABASE REBUILD COMPLETE!');
        console.log(`📊 Summary:`);
        console.log(`   👨‍⚕️ Doctors: ${doctorCount}`);
        console.log(`   👥 Patients: ${patientCount}`);
        console.log(`   📧 All accounts use password: doctor123`);
        console.log('\n✨ You can now login with any doctor/patient email from the sample data!');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ REBUILD FAILED:', error);
        process.exit(1);
    }
}