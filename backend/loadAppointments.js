import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

// Import models
import User from './models/User.js';
import Patient from './models/Patient.js';
import Appointment from './models/Appointment.js';
import Slot from './models/Slot.js';

// Simple patient data
const patients = [
  {
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@email.com",
    password: "patient123",
    phone: "+15554567890"
  },
  {
    firstName: "Maria",
    lastName: "Garcia", 
    email: "maria.garcia@email.com",
    password: "patient123",
    phone: "+15555678901"
  },
  {
    firstName: "Robert",
    lastName: "Williams",
    email: "robert.williams@email.com",
    password: "patient123", 
    phone: "+15556789012"
  }
];

async function loadPatientsAndAppointments() {
  try {
    console.log('🚀 Loading sample patients and appointments...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Check if we have doctors
    const doctors = await User.find({ userType: 'doctor' });
    if (doctors.length === 0) {
      console.log('❌ No doctors found! Please run loadDoctors.js first.');
      return;
    }
    
    console.log(`Found ${doctors.length} doctors\n`);
    
    // Clear existing patients and appointments
    await Patient.deleteMany({});
    await User.deleteMany({ userType: 'patient' });
    await Appointment.deleteMany({});
    
    // Create patients
    console.log('👥 Creating patients...');
    const createdPatients = [];
    
    for (const patientData of patients) {
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
        
        // Create basic Patient profile
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
    
    // Get available slots
    const availableSlots = await Slot.find({ isAvailable: true, isBooked: false }).limit(12);
    
    if (availableSlots.length === 0) {
      console.log('❌ No available slots found!');
      return;
    }
    
    console.log(`Found ${availableSlots.length} available slots`);
    
    // Create appointments for each combination of patient and available slots
    for (let i = 0; i < Math.min(availableSlots.length, 12); i++) {
      const patient = createdPatients[i % createdPatients.length];
      const slot = availableSlots[i];
      const status = statuses[i % statuses.length];
      
      // Find the doctor for this slot
      const doctor = await User.findById(slot.doctorId);
      if (!doctor) continue;
      
      const appointment = new Appointment({
        patientId: patient._id,
        doctorId: doctor._id,
        slotId: slot._id,
        appointmentDate: slot.dateTime,
        duration: 30,
        status: status,
        appointmentType: 'consultation',
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
      
      // Mark slot as booked if appointment is confirmed/completed
      if (status === 'confirmed' || status === 'completed') {
        slot.isBooked = true;
        slot.isAvailable = false;
        await slot.save();
      }
    }
    
    await Appointment.insertMany(appointments);
    console.log(`✅ Created ${appointments.length} sample appointments`);
    
    // Show breakdown
    const appointmentCounts = await Appointment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    console.log('\n📊 Appointment breakdown:');
    appointmentCounts.forEach(({ _id, count }) => {
      console.log(`   ${_id}: ${count}`);
    });
    
    console.log('\n✅ Sample data ready! You now have:');
    console.log(`   👨‍⚕️ ${doctors.length} doctors`);
    console.log(`   👥 ${createdPatients.length} patients`);
    console.log(`   📋 ${appointments.length} appointments`);
    console.log(`   📅 ${availableSlots.length} slots total`);
    
    console.log('\n🔑 Test Login Credentials:');
    console.log('DOCTORS:');
    for (const doctor of doctors) {
      console.log(`   📧 ${doctor.email} | 🔐 doctor123`);
    }
    
    console.log('\nPATIENTS:');
    for (const patient of createdPatients) {
      console.log(`   📧 ${patient.email} | 🔐 patient123`);
    }
    
  } catch (error) {
    console.error('❌ Error loading data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

loadPatientsAndAppointments();