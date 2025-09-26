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
import Appointment from './models/Appointment.js';
import Slot from './models/Slot.js';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to format phone numbers
function formatPhoneNumber(phone) {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // For validator.isMobilePhone, we need proper format
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }
  
  // If it already has country code, just add +
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  }
  
  // Default format that should pass validation
  return `+1${cleaned.substring(0, 10)}`;
}

// Helper function to create slots for doctors
async function createSlotsForDoctor(doctorUserId, doctorId) {
  console.log(`📅 Creating slots for doctor ${doctorId}...`);
  
  const slots = [];
  const today = new Date();
  
  // Create slots for next 30 days
  for (let i = 1; i <= 30; i++) {
    const slotDate = new Date(today);
    slotDate.setDate(today.getDate() + i);
    
    // Skip weekends
    if (slotDate.getDay() === 0 || slotDate.getDay() === 6) continue;
    
    // Create 3 slots per day (9 AM, 2 PM, 4 PM)
    const timeSlots = ['09:00', '14:00', '16:00'];
    
    for (const time of timeSlots) {
      const [hours, minutes] = time.split(':');
      const slotDateTime = new Date(slotDate);
      slotDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      // Calculate end time
      const endDateTime = new Date(slotDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + 30);
      const endTimeString = endDateTime.toTimeString().substring(0, 5); // HH:MM format
      
      const slot = new Slot({
        doctorId: doctorUserId,
        dateTime: slotDateTime,
        endTime: endTimeString,
        duration: 30, // 30 minutes
        type: 'consultation',
        consultationType: Math.random() > 0.5 ? 'in-person' : 'telemedicine',
        consultationFee: 150 + Math.floor(Math.random() * 200), // $150-350
        isAvailable: true,
        isBooked: false
      });
      
      slots.push(slot);
    }
  }
  
  try {
    await Slot.insertMany(slots);
    console.log(`✅ Created ${slots.length} slots for doctor`);
  } catch (error) {
    console.error(`❌ Error creating slots:`, error.message);
  }
}

// Helper function to create appointments
async function createSampleAppointments() {
  console.log('\n📋 Creating sample appointments...');
  
  try {
    // Get some doctors and patients
    const doctors = await User.find({ userType: 'doctor' }).limit(3);
    const patients = await User.find({ userType: 'patient' }).limit(5);
    
    if (doctors.length === 0 || patients.length === 0) {
      console.log('⚠️ No doctors or patients found, skipping appointments');
      return;
    }
    
    const appointments = [];
    const statuses = ['pending', 'confirmed', 'completed', 'cancelled', 'rejected'];
    
    // Create 15 sample appointments
    for (let i = 0; i < 15; i++) {
      const doctor = doctors[i % doctors.length];
      const patient = patients[i % patients.length];
      
      // Get a random slot for this doctor
      const doctorSlots = await Slot.find({ 
        doctorId: doctor._id,
        isAvailable: true,
        isBooked: false 
      }).limit(10);
      
      if (doctorSlots.length === 0) continue;
      
      const slot = doctorSlots[Math.floor(Math.random() * doctorSlots.length)];
      const status = statuses[i % statuses.length];
      
      const appointment = new Appointment({
        patientId: patient._id,
        doctorId: doctor._id,
        slotId: slot._id,
        appointmentDate: slot.dateTime,
        status: status,
        reasonForVisit: [
          'Regular checkup',
          'Follow-up appointment', 
          'Consultation for chest pain',
          'Annual physical exam',
          'Blood pressure monitoring',
          'Medication review',
          'Skin examination',
          'Headache consultation'
        ][i % 8],
        notes: status === 'completed' ? 'Patient examined, all vitals normal.' : '',
        diagnosis: status === 'completed' ? 'No acute issues found.' : '',
        treatmentPlan: status === 'completed' ? 'Continue current medications, follow up in 6 months.' : '',
        rejectionReason: status === 'rejected' ? 'Schedule conflict, please reschedule.' : undefined,
        cancellationReason: status === 'cancelled' ? 'Patient requested cancellation.' : undefined
      });
      
      appointments.push(appointment);
      
      // Mark slot as booked if appointment is confirmed
      if (status === 'confirmed' || status === 'completed') {
        slot.isBooked = true;
        slot.isAvailable = false;
        await slot.save();
      }
    }
    
    await Appointment.insertMany(appointments);
    console.log(`✅ Created ${appointments.length} sample appointments`);
    
    // Show appointment breakdown by status
    const appointmentCounts = await Appointment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    console.log('📊 Appointment breakdown:');
    appointmentCounts.forEach(({ _id, count }) => {
      console.log(`   ${_id}: ${count}`);
    });
    
  } catch (error) {
    console.error('❌ Error creating appointments:', error.message);
  }
}

async function loadSampleData() {
  try {
    console.log('🚀 Starting sample data loading...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Doctor.deleteMany({}), 
      Patient.deleteMany({}),
      Appointment.deleteMany({}),
      Slot.deleteMany({})
    ]);
    console.log('✅ Cleared existing data\n');
    
    // Load doctors data
    console.log('👨‍⚕️ Loading doctors...');
    const doctorsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/doctors.json'), 'utf-8'));
    
    for (let i = 0; i < doctorsData.length; i++) {
      const doctorData = doctorsData[i];
      
      try {
        // Hash password
        const hashedPassword = await bcrypt.hash(doctorData.password, 12);
        
        // Create User
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
          averageRating: 4.0 + Math.random(), // Random rating between 4.0-5.0
          totalReviews: Math.floor(Math.random() * 50) + 10 // 10-60 reviews
        });
        
        await doctor.save();
        
        console.log(`✅ Created doctor: Dr. ${user.firstName} ${user.lastName} (${doctor.primarySpecialty})`);
        
        // Create slots for this doctor
        await createSlotsForDoctor(user._id, doctor._id);
        
      } catch (error) {
        console.error(`❌ Error creating doctor ${doctorData.firstName} ${doctorData.lastName}:`, error.message);
      }
    }
    
    // Load patients data
    console.log('\n👥 Loading patients...');
    const patientsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/patients.json'), 'utf-8'));
    
    for (let i = 0; i < Math.min(patientsData.length, 10); i++) { // Limit to 10 patients
      const patientData = patientsData[i];
      
      try {
        // Hash password
        const hashedPassword = await bcrypt.hash(patientData.password, 12);
        
        // Create User
        const user = new User({
          firstName: patientData.firstName,
          lastName: patientData.lastName,
          email: patientData.email,
          password: hashedPassword,
          userType: 'patient',
          phone: formatPhoneNumber(patientData.phone),
          dateOfBirth: new Date(patientData.dateOfBirth),
          gender: patientData.gender,
          address: patientData.address,
          profilePicture: patientData.profilePicture,
          bio: patientData.bio,
          isEmailVerified: true,
          isActive: true
        });
        
        await user.save();
        
        // Create Patient profile
        const patient = new Patient({
          userId: user._id,
          emergencyContact: patientData.patientInfo.emergencyContact,
          insurance: patientData.patientInfo.insurance,
          bloodType: patientData.patientInfo.bloodType,
          height: patientData.patientInfo.height,
          weight: patientData.patientInfo.weight,
          medicalHistory: patientData.patientInfo.medicalHistory || [],
          allergies: patientData.patientInfo.allergies || [],
          currentMedications: patientData.patientInfo.currentMedications || [],
          familyHistory: patientData.patientInfo.familyHistory || [],
          socialHistory: patientData.patientInfo.socialHistory || {},
          isActive: true
        });
        
        await patient.save();
        
        console.log(`✅ Created patient: ${user.firstName} ${user.lastName}`);
        
      } catch (error) {
        console.error(`❌ Error creating patient ${patientData.firstName} ${patientData.lastName}:`, error.message);
      }
    }
    
    // Create sample appointments
    await createSampleAppointments();
    
    console.log('\n📊 Data loading complete! Summary:');
    const userCounts = await User.aggregate([
      { $group: { _id: '$userType', count: { $sum: 1 } } }
    ]);
    
    for (const { _id, count } of userCounts) {
      console.log(`   ${_id}s: ${count}`);
    }
    
    const slotCount = await Slot.countDocuments();
    const appointmentCount = await Appointment.countDocuments();
    
    console.log(`   Slots: ${slotCount}`);
    console.log(`   Appointments: ${appointmentCount}`);
    
    // Show login credentials
    console.log('\n🔑 Sample Login Credentials:');
    console.log('DOCTORS:');
    const sampleDoctors = await User.find({ userType: 'doctor' }).limit(3);
    for (const doctor of sampleDoctors) {
      console.log(`   📧 ${doctor.email} | 🔐 doctor123`);
    }
    
    console.log('\nPATIENTS:');
    const samplePatients = await User.find({ userType: 'patient' }).limit(3);
    for (const patient of samplePatients) {
      console.log(`   📧 ${patient.email} | 🔐 patient123`);
    }
    
    console.log('\n✅ Sample data loaded successfully!');
    console.log('🌐 You can now login with the credentials above');
    
  } catch (error) {
    console.error('❌ Error loading sample data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the data loader
loadSampleData();