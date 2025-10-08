import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

import Appointment from '../models/Appointment.js';
import Slot from '../models/Slot.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';

async function connectDB() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) throw new Error('Missing MONGO_URI in backend/.env');
  await mongoose.connect(uri, { dbName: process.env.MONGO_DB || undefined });
}

async function testReschedulingCleanup() {
  try {
    await connectDB();
    console.log('🔍 Testing appointment rescheduling cleanup...\n');
    
    // Get sample data
    const sampleDoctor = await Doctor.findOne().populate('userId');
    const samplePatient = await Patient.findOne().populate('userId');
    
    if (!sampleDoctor || !samplePatient) {
      console.log('❌ No sample doctor or patient found. Please ensure you have test data.');
      return;
    }
    
    console.log(`Doctor: ${sampleDoctor.userId?.firstName} ${sampleDoctor.userId?.lastName} (${sampleDoctor.primarySpecialty})`);
    console.log(`Patient: ${samplePatient.userId?.firstName} ${samplePatient.userId?.lastName}\n`);
    
    // Check for existing appointments and slots before cleanup
    const initialAppointments = await Appointment.find({
      doctorId: sampleDoctor._id,
      patientId: samplePatient._id
    });
    
    const initialSlots = await Slot.find({
      doctorId: sampleDoctor._id,
      patientId: samplePatient._id
    });
    
    console.log(`📊 BEFORE cleanup:`);
    console.log(`   Appointments for this doctor-patient pair: ${initialAppointments.length}`);
    console.log(`   Slots booked by this patient: ${initialSlots.length}`);
    
    // Show details of appointments
    if (initialAppointments.length > 0) {
      console.log(`\n   📋 Existing appointments:`);
      initialAppointments.forEach((apt, idx) => {
        console.log(`      ${idx + 1}. ID: ${apt._id.toString().substr(-6)}, Status: ${apt.status}, Date: ${apt.appointmentDate?.toISOString().split('T')[0]}, Reason: ${apt.reasonForVisit?.substring(0, 30)}...`);
      });
    }
    
    // Show details of slots
    if (initialSlots.length > 0) {
      console.log(`\n   🕐 Booked slots:`);
      initialSlots.forEach((slot, idx) => {
        console.log(`      ${idx + 1}. ID: ${slot._id.toString().substr(-6)}, Date: ${slot.dateTime?.toISOString().split('T')[0]}, Status: ${slot.status}, Booked: ${slot.isBooked}`);
      });
    }
    
    // Check for any 'rescheduled' status appointments that should have been deleted
    const rescheduledAppointments = await Appointment.find({
      doctorId: sampleDoctor._id,
      patientId: samplePatient._id,
      status: 'rescheduled'
    });
    
    console.log(`\n   ⚠️ Old 'rescheduled' status appointments (should be 0 with fix): ${rescheduledAppointments.length}`);
    
    if (rescheduledAppointments.length > 0) {
      console.log(`\n   🧹 Found old rescheduled appointments that should be cleaned up:`);
      rescheduledAppointments.forEach((apt, idx) => {
        console.log(`      ${idx + 1}. ID: ${apt._id.toString().substr(-6)}, Status: ${apt.status}, Date: ${apt.appointmentDate?.toISOString().split('T')[0]}`);
      });
      
      console.log(`\n   🗑️ Cleaning up old rescheduled appointments...`);
      const deleteResult = await Appointment.deleteMany({
        doctorId: sampleDoctor._id,
        patientId: samplePatient._id,
        status: 'rescheduled'
      });
      console.log(`   ✅ Deleted ${deleteResult.deletedCount} old rescheduled appointments`);
    }
    
    // Check for orphaned slots (slots without appointments)
    const orphanedSlots = await Slot.find({
      doctorId: sampleDoctor._id,
      isBooked: true,
      appointmentId: { $exists: true }
    });
    
    const validSlots = [];
    const invalidSlots = [];
    
    for (const slot of orphanedSlots) {
      const appointmentExists = await Appointment.findById(slot.appointmentId);
      if (appointmentExists) {
        validSlots.push(slot);
      } else {
        invalidSlots.push(slot);
      }
    }
    
    console.log(`\n   🔗 Slot validation:`);
    console.log(`      Valid slots (with existing appointments): ${validSlots.length}`);
    console.log(`      Orphaned slots (appointments deleted): ${invalidSlots.length}`);
    
    if (invalidSlots.length > 0) {
      console.log(`\n   🗑️ Cleaning up orphaned slots...`);
      for (const slot of invalidSlots) {
        await Slot.findByIdAndDelete(slot._id);
        console.log(`      ✅ Deleted orphaned slot ${slot._id.toString().substr(-6)}`);
      }
    }
    
    // Final count
    const finalAppointments = await Appointment.find({
      doctorId: sampleDoctor._id,
      patientId: samplePatient._id
    });
    
    const finalSlots = await Slot.find({
      doctorId: sampleDoctor._id,
      patientId: samplePatient._id
    });
    
    console.log(`\n📊 AFTER cleanup:`);
    console.log(`   Appointments: ${finalAppointments.length}`);
    console.log(`   Booked slots: ${finalSlots.length}`);
    
    console.log(`\n✅ Testing completed! The rescheduling fix should now:`);
    console.log(`   1. Delete old appointments completely (not just mark as 'rescheduled')`);
    console.log(`   2. Delete old slots properly`);
    console.log(`   3. Create clean new appointments and slots`);
    console.log(`   4. Maintain proper referential integrity\n`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

testReschedulingCleanup();
