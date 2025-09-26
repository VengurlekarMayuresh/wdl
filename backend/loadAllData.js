import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Import models
import User from './models/User.js';
import Doctor from './models/Doctor.js';
import Patient from './models/Patient.js';
import Slot from './models/Slot.js';
import Appointment from './models/Appointment.js';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to parse phone numbers into country code and phone
function parsePhoneNumber(phone) {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // For 10-digit numbers, assume US (+1)
  if (cleaned.length === 10) {
    return {
      countryCode: '+1',
      phone: cleaned
    };
  }
  
  // For 11-digit numbers starting with 1, assume US
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return {
      countryCode: '+1',
      phone: cleaned.substring(1) // Remove the leading 1
    };
  }
  
  // Default fallback for any other format
  return {
    countryCode: '+1',
    phone: cleaned.substring(0, 10)
  };
}

// Create slots for each doctor
async function createSlotsForDoctor(doctorUserId, doctorName) {
  console.log(`📅 Creating slots for ${doctorName}...`);
  
  const slots = [];
  const today = new Date();
  
  // Create slots for next 21 days (3 weeks)
  for (let i = 1; i <= 21; i++) {
    const slotDate = new Date(today);
    slotDate.setDate(today.getDate() + i);
    
    // Skip weekends
    if (slotDate.getDay() === 0 || slotDate.getDay() === 6) continue;
    
    // Create 4 slots per day (morning and afternoon)
    const timeSlots = ['09:00', '11:00', '14:00', '16:00'];
    
    for (const time of timeSlots) {
      const [hours, minutes] = time.split(':');
      const slotDateTime = new Date(slotDate);
      slotDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      const slot = new Slot({
        doctorId: doctorUserId,
        dateTime: slotDateTime,
        duration: 30,
        consultationType: Math.random() > 0.7 ? 'telemedicine' : 'in-person',
        consultationFee: 150 + Math.floor(Math.random() * 300), // $150-450
        isAvailable: true,
        isBooked: false
      });
      
      slots.push(slot);
    }
  }
  
  try {
    await Slot.insertMany(slots);
    console.log(`✅ Created ${slots.length} slots for ${doctorName}`);
    return slots.length;
  } catch (error) {
    console.error(`❌ Error creating slots for ${doctorName}:`, error.message);
    return 0;
  }
}

async function loadAllData() {
  try {
    console.log('🚀 Loading all healthcare data (50 doctors + 50 patients)...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Doctor.deleteMany({}),
      Patient.deleteMany({}),
      Slot.deleteMany({}),
      Appointment.deleteMany({})
    ]);
    console.log('✅ Cleared all existing data\n');
    
    // Load 50 doctors
    console.log('👨‍⚕️ Loading 50 doctors from doctors.json...');
    const doctorsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/doctors.json'), 'utf-8'));
    
    const createdDoctors = [];
    let totalSlots = 0;
    
    for (let i = 0; i < doctorsData.length; i++) {
      const doctorData = doctorsData[i];
      
      try {
        // Hash password
        const hashedPassword = await bcrypt.hash(doctorData.password, 12);
        
        // Parse phone number
        const phoneData = parsePhoneNumber(doctorData.phone);
        
        // Create User
        const user = new User({
          firstName: doctorData.firstName,
          lastName: doctorData.lastName,
          email: doctorData.email,
          password: hashedPassword,
          userType: 'doctor',
          countryCode: phoneData.countryCode,
          phone: phoneData.phone,
          dateOfBirth: new Date(doctorData.dateOfBirth),
          gender: doctorData.gender,
          address: doctorData.address,
          profilePicture: doctorData.profilePicture,
          bio: doctorData.bio,
          isEmailVerified: true,
          isActive: true
        });
        
        await user.save();
        
        // Create Doctor profile
        const doctor = new Doctor({
          userId: user._id,
          medicalLicenseNumber: doctorData.doctorInfo.medicalLicenseNumber,
          licenseState: doctorData.doctorInfo.licenseState,
          licenseExpiryDate: new Date(doctorData.doctorInfo.licenseExpiryDate),
          primarySpecialty: doctorData.doctorInfo.primarySpecialty,
          secondarySpecialties: doctorData.doctorInfo.secondarySpecialties || [],
          yearsOfExperience: doctorData.doctorInfo.yearsOfExperience,
          npiNumber: doctorData.doctorInfo.npiNumber,
          education: doctorData.doctorInfo.education || [],
          residency: doctorData.doctorInfo.residency || [],
          fellowship: doctorData.doctorInfo.fellowship || [],
          hospitalAffiliations: doctorData.doctorInfo.hospitalAffiliations || [],
          boardCertifications: doctorData.doctorInfo.boardCertifications || [],
          languages: doctorData.doctorInfo.languagesSpoken?.map(lang => 
            typeof lang === 'string' ? lang : lang.language
          ) || ['English'],
          consultationFee: doctorData.doctorInfo.consultationFee || 200,
          acceptsInsurance: doctorData.doctorInfo.acceptsInsurance,
          insurancesAccepted: doctorData.doctorInfo.insurancesAccepted || [],
          isVerified: true,
          status: 'approved',
          isAcceptingNewPatients: doctorData.doctorInfo.isAcceptingNewPatients,
          telemedicineEnabled: doctorData.doctorInfo.telemedicineEnabled,
          averageRating: 3.5 + Math.random() * 1.5, // 3.5-5.0 rating
          totalReviews: Math.floor(Math.random() * 100) + 5 // 5-105 reviews
        });
        
        await doctor.save();
        
        const doctorName = `Dr. ${user.firstName} ${user.lastName}`;
        console.log(`✅ ${i + 1}/50 Created: ${doctorName} (${doctor.primarySpecialty})`);
        
        // Create slots for this doctor
        const slotsCreated = await createSlotsForDoctor(user._id, doctorName);
        totalSlots += slotsCreated;
        
        createdDoctors.push({ user, doctor });
        
        // Add a small delay to avoid overwhelming the database
        if (i > 0 && i % 10 === 0) {
          console.log(`   📊 Progress: ${i}/50 doctors processed...`);
        }
        
      } catch (error) {
        console.error(`❌ Error creating doctor ${doctorData.firstName} ${doctorData.lastName}:`, error.message);
      }
    }
    
    // Load 50 patients
    console.log(`\n👥 Loading 50 patients from patients.json...`);
    const patientsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/patients.json'), 'utf-8'));
    
    const createdPatients = [];
    
    for (let i = 0; i < patientsData.length; i++) {
      const patientData = patientsData[i];
      
      try {
        // Hash password
        const hashedPassword = await bcrypt.hash(patientData.password, 12);
        
        // Parse phone number
        const phoneData = parsePhoneNumber(patientData.phone);
        
        // Create User
        const user = new User({
          firstName: patientData.firstName,
          lastName: patientData.lastName,
          email: patientData.email,
          password: hashedPassword,
          userType: 'patient',
          countryCode: phoneData.countryCode,
          phone: phoneData.phone,
          dateOfBirth: new Date(patientData.dateOfBirth),
          gender: patientData.gender,
          address: patientData.address,
          profilePicture: patientData.profilePicture,
          bio: patientData.bio,
          isEmailVerified: true,
          isActive: true
        });
        
        await user.save();
        
        // Create basic Patient profile (simplified to avoid validation issues)
        const patient = new Patient({
          userId: user._id,
          bloodType: patientData.patientInfo?.bloodType || 'O+',
          height: patientData.patientInfo?.height || { feet: 5, inches: 8 },
          weight: patientData.patientInfo?.weight || 150,
          isActive: true
        });
        
        await patient.save();
        
        console.log(`✅ ${i + 1}/50 Created patient: ${user.firstName} ${user.lastName}`);
        createdPatients.push(user);
        
        // Progress indicator
        if (i > 0 && i % 15 === 0) {
          console.log(`   📊 Progress: ${i}/50 patients processed...`);
        }
        
      } catch (error) {
        console.error(`❌ Error creating patient ${patientData.firstName} ${patientData.lastName}:`, error.message);
      }
    }
    
    // Create sample appointments between patients and doctors
    console.log(`\n📋 Creating sample appointments...`);
    const appointments = [];
    const statuses = ['pending', 'pending', 'pending', 'pending', 'confirmed', 'completed', 'rejected'];
    
    // Get some available slots for appointments
    const availableSlots = await Slot.find({ isAvailable: true, isBooked: false }).limit(40);
    console.log(`Found ${availableSlots.length} available slots for appointments`);
    
    for (let i = 0; i < Math.min(availableSlots.length, 35); i++) {
      const patient = createdPatients[i % createdPatients.length];
      const slot = availableSlots[i];
      const status = statuses[i % statuses.length];
      
      const doctor = await User.findById(slot.doctorId);
      if (!doctor) continue;
      
      const appointment = new Appointment({
        patientId: patient._id,
        doctorId: doctor._id,
        slotId: slot._id,
        appointmentDate: slot.dateTime,
        duration: 30,
        status: status,
        appointmentType: ['consultation', 'follow-up', 'check-up'][i % 3],
        consultationType: 'in-person',
        reasonForVisit: [
          'Regular checkup',
          'Follow-up appointment',
          'Consultation for chest pain',
          'Annual physical exam',
          'Blood pressure monitoring',
          'Medication review',
          'Skin examination',
          'Back pain consultation',
          'Headache evaluation',
          'Allergy consultation'
        ][i % 10],
        consultationFee: slot.consultationFee || 200,
        doctorNotes: status === 'completed' ? 'Patient examined, vital signs normal.' : '',
        diagnosis: status === 'completed' ? {
          primary: 'No acute issues found.'
        } : undefined,
        rejectionReason: status === 'rejected' ? 'Doctor schedule conflict, please reschedule.' : undefined
      });
      
      appointments.push(appointment);
      
      // Mark slot as booked if confirmed/completed
      if (status === 'confirmed' || status === 'completed') {
        slot.isBooked = true;
        slot.isAvailable = false;
        await slot.save();
      }
    }
    
    await Appointment.insertMany(appointments);
    console.log(`✅ Created ${appointments.length} sample appointments`);
    
    // Final summary
    console.log(`\n🎉 Healthcare platform loaded successfully!`);
    console.log(`📊 Final Summary:`);
    console.log(`   👨‍⚕️ Doctors: ${createdDoctors.length}/50`);
    console.log(`   👥 Patients: ${createdPatients.length}/50`);
    console.log(`   📅 Slots: ${totalSlots}`);
    console.log(`   📋 Appointments: ${appointments.length}`);
    
    // Appointment breakdown
    const appointmentCounts = await Appointment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    console.log(`\n📊 Appointment Status Breakdown:`);
    appointmentCounts.forEach(({ _id, count }) => {
      console.log(`   ${_id}: ${count}`);
    });
    
    // Show some sample login credentials
    console.log(`\n🔑 Sample Login Credentials:`);
    console.log(`DOCTORS (${createdDoctors.length} total):`);
    for (let i = 0; i < Math.min(5, createdDoctors.length); i++) {
      const { user, doctor } = createdDoctors[i];
      console.log(`   📧 ${user.email} | 🔐 doctor123 | 🏥 ${doctor.primarySpecialty}`);
    }
    
    console.log(`\nPATIENTS (${createdPatients.length} total):`);
    for (let i = 0; i < Math.min(5, createdPatients.length); i++) {
      const patient = createdPatients[i];
      console.log(`   📧 ${patient.email} | 🔐 patient123`);
    }
    
    console.log(`\n✅ Ready to use! Your Find Care page will show all ${createdDoctors.length} doctors!`);
    
  } catch (error) {
    console.error('❌ Error loading data:', error);
  } finally {
    await mongoose.disconnect();
    console.log(`\n🔌 Disconnected from MongoDB`);
    process.exit(0);
  }
}

loadAllData();