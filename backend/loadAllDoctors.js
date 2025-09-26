import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
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

// Helper function to format phone numbers for validation
function formatPhoneNumber(phone) {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }
  return `+1${cleaned.substring(0, 10)}`;
}

// Helper function to create slots for doctors
async function createSlotsForDoctor(doctorUserId) {
  console.log(`📅 Creating slots...`);
  
  const slots = [];
  const today = new Date();
  
  // Create slots for next 14 days
  for (let i = 1; i <= 14; i++) {
    const slotDate = new Date(today);
    slotDate.setDate(today.getDate() + i);
    
    // Skip weekends
    if (slotDate.getDay() === 0 || slotDate.getDay() === 6) continue;
    
    // Create 3 slots per day
    const timeSlots = ['09:00', '14:00', '16:30'];
    
    for (const time of timeSlots) {
      const [hours, minutes] = time.split(':');
      const slotDateTime = new Date(slotDate);
      slotDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      const slot = new Slot({
        doctorId: doctorUserId,
        dateTime: slotDateTime,
        duration: 30,
        consultationType: Math.random() > 0.5 ? 'in-person' : 'telemedicine',
        consultationFee: 150 + Math.floor(Math.random() * 200),
        isAvailable: true,
        isBooked: false
      });
      
      slots.push(slot);
    }
  }
  
  try {
    await Slot.insertMany(slots);
    console.log(`✅ Created ${slots.length} slots`);
  } catch (error) {
    console.error(`❌ Error creating slots:`, error.message);
  }
}

// Sample patients for appointments
const samplePatients = [
  { firstName: "John", lastName: "Smith", email: "john.smith@email.com", phone: "+15554567890" },
  { firstName: "Maria", lastName: "Garcia", email: "maria.garcia@email.com", phone: "+15555678901" },
  { firstName: "Robert", lastName: "Williams", email: "robert.williams@email.com", phone: "+15556789012" },
  { firstName: "Sarah", lastName: "Davis", email: "sarah.davis@email.com", phone: "+15557890123" },
  { firstName: "David", lastName: "Miller", email: "david.miller@email.com", phone: "+15558901234" }
];

async function loadAllData() {
  try {
    console.log('🚀 Loading comprehensive healthcare data...\n');
    
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
    console.log('✅ Cleared existing data\n');
    
    // Load all doctors from sample data
    console.log('👨‍⚕️ Loading doctors from sample data...');
    const doctorsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/doctors.json'), 'utf-8'));
    
    const createdDoctors = [];
    
    for (const doctorData of doctorsData) {
      try {
        // Hash password
        const hashedPassword = await bcrypt.hash(doctorData.password, 12);
        
        // Create User with proper phone formatting
        const user = new User({
          firstName: doctorData.firstName,
          lastName: doctorData.lastName,
          email: doctorData.email,
          password: hashedPassword,
          userType: 'doctor',
          phone: formatPhoneNumber(doctorData.phone),
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
          averageRating: 4.0 + Math.random(),
          totalReviews: Math.floor(Math.random() * 50) + 10
        });
        
        await doctor.save();
        
        console.log(`✅ Created: Dr. ${user.firstName} ${user.lastName} (${doctor.primarySpecialty})`);
        
        // Create slots
        await createSlotsForDoctor(user._id);
        
        createdDoctors.push({ user, doctor });
        
      } catch (error) {
        console.error(`❌ Error creating doctor ${doctorData.firstName} ${doctorData.lastName}:`, error.message);
        // Continue with next doctor
      }
    }
    
    // Create sample patients
    console.log('\n👥 Creating sample patients...');
    const createdPatients = [];
    
    for (const patientData of samplePatients) {
      try {
        const hashedPassword = await bcrypt.hash('patient123', 12);
        
        const user = new User({
          firstName: patientData.firstName,
          lastName: patientData.lastName,
          email: patientData.email,
          password: hashedPassword,
          userType: 'patient',
          phone: patientData.phone,
          dateOfBirth: new Date('1990-01-01'),
          gender: 'male',
          address: {
            street: '456 Patient St',
            city: 'Phoenix',
            state: 'AZ',
            zipCode: '85002',
            country: 'USA'
          },
          isEmailVerified: true,
          isActive: true
        });
        
        await user.save();
        
        const patient = new Patient({
          userId: user._id,
          bloodType: 'O+',
          height: { feet: 5, inches: 10 },
          weight: 175,
          isActive: true
        });
        
        await patient.save();
        
        console.log(`✅ Created patient: ${user.firstName} ${user.lastName}`);
        createdPatients.push(user);
        
      } catch (error) {
        console.error(`❌ Error creating patient ${patientData.firstName}:`, error.message);
      }
    }
    
    // Create sample appointments
    console.log('\n📋 Creating sample appointments...');
    const appointments = [];
    const statuses = ['pending', 'pending', 'pending', 'confirmed', 'completed', 'rejected'];
    
    const availableSlots = await Slot.find({ isAvailable: true, isBooked: false }).limit(20);
    
    for (let i = 0; i < Math.min(availableSlots.length, 18); i++) {
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
          'Medication review'
        ][i % 6],
        consultationFee: 200,
        doctorNotes: status === 'completed' ? 'Patient examined, all vitals normal.' : '',
        diagnosis: status === 'completed' ? {
          primary: 'No acute issues found.'
        } : undefined,
        rejectionReason: status === 'rejected' ? 'Schedule conflict, please book a different time.' : undefined
      });
      
      appointments.push(appointment);
      
      if (status === 'confirmed' || status === 'completed') {
        slot.isBooked = true;
        slot.isAvailable = false;
        await slot.save();
      }
    }
    
    await Appointment.insertMany(appointments);
    console.log(`✅ Created ${appointments.length} sample appointments`);
    
    // Final summary
    console.log('\n📊 Data loading complete! Summary:');
    console.log(`   👨‍⚕️ Doctors: ${createdDoctors.length}`);
    console.log(`   👥 Patients: ${createdPatients.length}`);
    console.log(`   📅 Slots: ${await Slot.countDocuments()}`);
    console.log(`   📋 Appointments: ${appointments.length}`);
    
    // Appointment breakdown
    const appointmentCounts = await Appointment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    console.log('\n📊 Appointment breakdown:');
    appointmentCounts.forEach(({ _id, count }) => {
      console.log(`   ${_id}: ${count}`);
    });
    
    console.log('\n🔑 Login Credentials:');
    console.log('DOCTORS:');
    for (const { user } of createdDoctors.slice(0, 3)) {
      console.log(`   📧 ${user.email} | 🔐 doctor123`);
    }
    
    console.log('\nPATIENTS:');
    for (const patient of createdPatients.slice(0, 3)) {
      console.log(`   📧 ${patient.email} | 🔐 patient123`);
    }
    
    console.log('\n✅ Healthcare platform ready with comprehensive data!');
    console.log('🌐 Doctors page will now show all available doctors');
    console.log('📱 Slot management should work correctly');
    console.log('📋 Appointments system is fully functional');
    
  } catch (error) {
    console.error('❌ Error loading data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

loadAllData();