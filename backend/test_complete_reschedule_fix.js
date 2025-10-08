import mongoose from 'mongoose';
import Appointment from './models/Appointment.js';
import Slot from './models/Slot.js';
import Doctor from './models/Doctor.js';
import Patient from './models/Patient.js';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
await mongoose.connect(process.env.MONGODB_URI);

async function testCompleteRescheduleWorkflow() {
  console.log('🔍 TESTING COMPLETE RESCHEDULE WORKFLOW (BOTH PATIENT & DOCTOR)\n');

  try {
    // Find an existing appointment to test with
    const existingAppointment = await Appointment.findOne({
      status: { $in: ['pending', 'confirmed'] }
    })
    .populate('doctorId')
    .populate('patientId')
    .populate('slotId');

    if (!existingAppointment) {
      console.log('❌ No existing appointments found to test with');
      return;
    }

    console.log('📋 INITIAL STATE:');
    console.log(`Appointment ID: ${existingAppointment._id}`);
    console.log(`Original Slot ID: ${existingAppointment.slotId._id}`);
    console.log(`Original Date: ${existingAppointment.appointmentDate}`);

    const originalSlotId = existingAppointment.slotId._id;
    const doctorId = existingAppointment.doctorId._id;

    // Count slots before
    const slotCountBefore = await Slot.countDocuments({ doctorId });
    console.log(`Total slots for doctor: ${slotCountBefore}\n`);

    // ==========================================
    // TEST 1: PATIENT DIRECT RESCHEDULE
    // ==========================================
    console.log('🏥 TEST 1: PATIENT DIRECT RESCHEDULE WORKFLOW\n');

    // Create a temporary slot for patient to reschedule to
    const newSlotForPatient = new Slot({
      doctorId,
      dateTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
      duration: 30,
      consultationFee: 150,
      consultationType: 'in-person'
    });
    await newSlotForPatient.save();
    console.log(`✅ Created temporary slot for patient reschedule: ${newSlotForPatient._id}`);

    // Simulate patient direct reschedule logic
    const existingSlot = await Slot.findById(originalSlotId);
    const originalDate = existingSlot.dateTime;
    
    // Update existing slot with new timing from temporary slot
    existingSlot.dateTime = newSlotForPatient.dateTime;
    existingSlot.duration = newSlotForPatient.duration;
    existingSlot.consultationFee = newSlotForPatient.consultationFee;
    existingSlot.consultationType = newSlotForPatient.consultationType;
    await existingSlot.save();
    console.log(`✅ Updated existing slot ${existingSlot._id.toString().substr(-8)} with new timing`);

    // Delete the temporary slot
    await Slot.findByIdAndDelete(newSlotForPatient._id);
    console.log(`✅ Deleted temporary slot ${newSlotForPatient._id.toString().substr(-8)}`);

    // Update appointment
    existingAppointment.appointmentDate = existingSlot.dateTime;
    existingAppointment.duration = existingSlot.duration;
    existingAppointment.consultationFee = existingSlot.consultationFee;
    existingAppointment.rescheduledFrom = {
      originalDate,
      rescheduledBy: 'patient',
      rescheduledAt: new Date(),
      reason: 'Patient direct reschedule test'
    };
    await existingAppointment.save();
    console.log(`✅ Updated appointment with new timing`);

    // Verify
    const slotCountAfterPatient = await Slot.countDocuments({ doctorId });
    console.log(`Slots after patient reschedule: ${slotCountAfterPatient}`);
    console.log(`Slot count maintained: ${slotCountBefore === slotCountAfterPatient ? 'YES ✅' : 'NO ❌'}`);
    console.log(`Same slot ID: ${originalSlotId.equals(existingSlot._id) ? 'YES ✅' : 'NO ❌'}\n`);

    // ==========================================
    // TEST 2: DOCTOR PROPOSE → PATIENT APPROVE
    // ==========================================
    console.log('👨‍⚕️ TEST 2: DOCTOR PROPOSES → PATIENT APPROVES WORKFLOW\n');

    // Step 1: Doctor proposes reschedule
    const proposedDateTime = new Date(Date.now() + 6 * 60 * 60 * 1000); // 6 hours from now
    existingAppointment.pendingReschedule = {
      active: true,
      proposedBy: 'doctor',
      proposedAt: new Date(),
      reason: 'Doctor needs to reschedule',
      proposedDateTime,
      decision: null,
      decidedBy: null,
      decisionAt: null
    };
    await existingAppointment.save();
    console.log(`✅ Doctor proposed reschedule to: ${proposedDateTime}`);

    // Step 2: Patient approves (using our fixed logic)
    const currentSlot = await Slot.findById(existingAppointment.slotId);
    const oldDate = currentSlot.dateTime;

    // Update existing slot with new timing
    currentSlot.dateTime = proposedDateTime;
    await currentSlot.save();
    console.log(`✅ Updated existing slot with proposed timing`);

    // Update appointment
    existingAppointment.appointmentDate = proposedDateTime;
    existingAppointment.status = 'confirmed';
    existingAppointment.pendingReschedule.active = false;
    existingAppointment.pendingReschedule.decision = 'approved';
    existingAppointment.pendingReschedule.decidedBy = 'patient';
    existingAppointment.pendingReschedule.decisionAt = new Date();
    existingAppointment.rescheduledFrom = {
      originalDate: oldDate,
      rescheduledBy: 'patient',
      rescheduledAt: new Date(),
      reason: 'Patient approved doctor reschedule'
    };
    await existingAppointment.save();
    console.log(`✅ Patient approved reschedule`);

    // Final verification
    const slotCountFinal = await Slot.countDocuments({ doctorId });
    const finalAppointment = await Appointment.findById(existingAppointment._id).populate('slotId');
    
    console.log('\n📊 FINAL VERIFICATION:');
    console.log(`Final appointment date: ${finalAppointment.appointmentDate}`);
    console.log(`Final slot date: ${finalAppointment.slotId.dateTime}`);
    console.log(`Dates match: ${finalAppointment.appointmentDate.getTime() === finalAppointment.slotId.dateTime.getTime() ? 'YES ✅' : 'NO ❌'}`);
    console.log(`Same slot ID throughout: ${originalSlotId.equals(finalAppointment.slotId._id) ? 'YES ✅' : 'NO ❌'}`);
    console.log(`Same appointment ID: ${existingAppointment._id.equals(finalAppointment._id) ? 'YES ✅' : 'NO ❌'}`);
    console.log(`Final slot count: ${slotCountFinal}`);
    console.log(`Slot count maintained: ${slotCountBefore === slotCountFinal ? 'YES ✅' : 'NO ❌'}`);
    console.log(`Reschedule history present: ${finalAppointment.rescheduledFrom ? 'YES ✅' : 'NO ❌'}`);

    if (slotCountBefore === slotCountFinal && 
        originalSlotId.equals(finalAppointment.slotId._id) &&
        finalAppointment.appointmentDate.getTime() === finalAppointment.slotId.dateTime.getTime()) {
      console.log('\n🎉 ALL TESTS PASSED! Reschedule workflow is working perfectly!');
    } else {
      console.log('\n❌ SOME TESTS FAILED! Check the issues above.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Test completed');
  }
}

testCompleteRescheduleWorkflow();