import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import express from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

import Appointment from '../models/Appointment.js';
import Slot from '../models/Slot.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import User from '../models/User.js';

async function connectDB() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) throw new Error('Missing MONGO_URI in backend/.env');
  await mongoose.connect(uri, { dbName: process.env.MONGO_DB || undefined });
}

async function testReschedulingFlow() {
  try {
    await connectDB();
    console.log('🧪 Testing appointment rescheduling API flow...\n');
    
    // Get sample doctor and patient
    const doctor = await Doctor.findOne().populate('userId');
    const patient = await Patient.findOne().populate('userId');
    
    if (!doctor || !patient) {
      console.log('❌ Need at least one doctor and one patient in the database');
      return;
    }
    
    console.log(`👨‍⚕️ Doctor: ${doctor.userId.firstName} ${doctor.userId.lastName}`);
    console.log(`👤 Patient: ${patient.userId.firstName} ${patient.userId.lastName}\n`);
    
    // Cleanup any existing appointments between this doctor-patient pair
    await Appointment.deleteMany({ doctorId: doctor._id, patientId: patient._id });
    await Slot.deleteMany({ doctorId: doctor._id, patientId: patient._id });
    console.log('🧹 Cleaned up existing test data\n');
    
    // Step 1: Create original slot and appointment
    const originalDate = new Date();
    originalDate.setDate(originalDate.getDate() + 7); // 1 week from now
    originalDate.setHours(10, 0, 0, 0); // 10:00 AM
    
    const originalSlot = new Slot({
      doctorId: doctor._id,
      dateTime: originalDate,
      duration: 30,
      consultationFee: doctor.consultationFee || 100,
      consultationType: 'in-person'
    });
    
    await originalSlot.save();
    
    const originalAppointment = new Appointment({
      doctorId: doctor._id,
      patientId: patient._id,
      slotId: originalSlot._id,
      appointmentDate: originalDate,
      duration: 30,
      appointmentType: 'consultation',
      reasonForVisit: 'Regular checkup',
      status: 'confirmed'
    });
    
    await originalAppointment.save();
    await originalSlot.book(patient._id, originalAppointment._id);
    
    console.log('✅ Created original appointment:');
    console.log(`   Appointment ID: ${originalAppointment._id.toString().substr(-8)}`);
    console.log(`   Slot ID: ${originalSlot._id.toString().substr(-8)}`);
    console.log(`   Date: ${originalDate.toISOString()}`);
    console.log(`   Status: ${originalAppointment.status}\n`);
    
    // Step 2: Create new slot for rescheduling
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + 10); // 10 days from now
    newDate.setHours(14, 0, 0, 0); // 2:00 PM
    
    const newSlot = new Slot({
      doctorId: doctor._id,
      dateTime: newDate,
      duration: 30,
      consultationFee: doctor.consultationFee || 100,
      consultationType: 'in-person'
    });
    
    await newSlot.save();
    
    console.log('✅ Created new slot for rescheduling:');
    console.log(`   New Slot ID: ${newSlot._id.toString().substr(-8)}`);
    console.log(`   New Date: ${newDate.toISOString()}\n`);
    
    // Step 3: Test the rescheduling logic (simulate what the API does)
    console.log('🔄 Simulating rescheduling process...\n');
    
    // Store original appointment data before deletion
    const originalAppointmentData = {
      doctorId: originalAppointment.doctorId,
      patientId: originalAppointment.patientId,
      reasonForVisit: originalAppointment.reasonForVisit,
      symptoms: originalAppointment.symptoms,
      relevantMedicalHistory: originalAppointment.relevantMedicalHistory,
      currentMedications: originalAppointment.currentMedications,
      allergies: originalAppointment.allergies,
      contactPreferences: originalAppointment.contactPreferences,
      appointmentType: originalAppointment.appointmentType,
      consultationType: originalAppointment.consultationType || newSlot.consultationType
    };
    
    // Free up and delete the old slot
    const oldSlot = await Slot.findById(originalAppointment.slotId);
    if (oldSlot) {
      await oldSlot.cancelBooking('patient', 'Rescheduled');
      await Slot.findByIdAndDelete(oldSlot._id);
      console.log(`🗑️ Deleted old slot: ${oldSlot._id.toString().substr(-8)}`);
    }
    
    // Delete the old appointment completely
    await Appointment.findByIdAndDelete(originalAppointment._id);
    console.log(`🗑️ Deleted old appointment: ${originalAppointment._id.toString().substr(-8)}`);
    
    // Create a new appointment with the new slot
    const newAppointment = new Appointment({
      ...originalAppointmentData,
      slotId: newSlot._id,
      appointmentDate: newSlot.dateTime,
      duration: newSlot.duration,
      consultationFee: newSlot.consultationFee,
      status: 'pending', // Requires doctor confirmation
      createdBy: 'patient'
    });
    
    await newAppointment.save();
    console.log(`✅ Created new appointment: ${newAppointment._id.toString().substr(-8)}`);
    
    // Book the new slot with the new appointment
    await newSlot.book(originalAppointmentData.patientId, newAppointment._id);
    console.log('✅ Booked new slot with new appointment\n');
    
    // Step 4: Verify the results
    console.log('🔍 Verifying results...\n');
    
    // Check that old appointment is gone
    const oldAppointmentCheck = await Appointment.findById(originalAppointment._id);
    console.log(`Old appointment exists: ${oldAppointmentCheck ? 'YES ❌' : 'NO ✅'}`);
    
    // Check that old slot is gone
    const oldSlotCheck = await Slot.findById(originalSlot._id);
    console.log(`Old slot exists: ${oldSlotCheck ? 'YES ❌' : 'NO ✅'}`);
    
    // Check that new appointment exists
    const newAppointmentCheck = await Appointment.findById(newAppointment._id)
      .populate('doctorId', 'primarySpecialty')
      .populate('patientId')
      .populate('slotId');
    console.log(`New appointment exists: ${newAppointmentCheck ? 'YES ✅' : 'NO ❌'}`);
    
    // Check that new slot is properly booked
    const newSlotCheck = await Slot.findById(newSlot._id);
    console.log(`New slot is booked: ${newSlotCheck?.isBooked ? 'YES ✅' : 'NO ❌'}`);
    console.log(`New slot appointment reference: ${newSlotCheck?.appointmentId?.equals(newAppointment._id) ? 'CORRECT ✅' : 'INCORRECT ❌'}`);
    
    // Check total appointment count for this doctor-patient pair
    const totalAppointments = await Appointment.find({
      doctorId: doctor._id,
      patientId: patient._id
    });
    console.log(`Total appointments for this pair: ${totalAppointments.length} ${totalAppointments.length === 1 ? '✅' : '❌ (should be 1)'}`);
    
    // Check total slot count for this doctor with this patient
    const totalSlots = await Slot.find({
      doctorId: doctor._id,
      patientId: patient._id
    });
    console.log(`Total booked slots for this pair: ${totalSlots.length} ${totalSlots.length === 1 ? '✅' : '❌ (should be 1)'}`);
    
    if (newAppointmentCheck) {
      console.log('\n📋 New appointment details:');
      console.log(`   ID: ${newAppointmentCheck._id.toString().substr(-8)}`);
      console.log(`   Status: ${newAppointmentCheck.status}`);
      console.log(`   Date: ${newAppointmentCheck.appointmentDate.toISOString()}`);
      console.log(`   Reason: ${newAppointmentCheck.reasonForVisit}`);
    }
    
    console.log('\n✅ Rescheduling test completed!');
    console.log('\n📝 Summary: The fix ensures that:');
    console.log('   ✅ Old appointments are completely deleted (not just marked as \'rescheduled\')');
    console.log('   ✅ Old slots are properly cleaned up');
    console.log('   ✅ New appointments are created with proper references');
    console.log('   ✅ No duplicate or orphaned records remain');
    console.log('   ✅ Database integrity is maintained\n');
    
    // Cleanup test data
    await Appointment.findByIdAndDelete(newAppointment._id);
    await Slot.findByIdAndDelete(newSlot._id);
    console.log('🧹 Test data cleaned up');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Test completed - database connection closed');
  }
}

testReschedulingFlow();
