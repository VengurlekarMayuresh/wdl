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

async function fixDuplicateRescheduleAppointments() {
  try {
    await connectDB();
    console.log('🔍 Finding and fixing duplicate reschedule appointments...\n');
    
    // Find all appointments that start with "Reschedule request for appointment"
    const rescheduleRequestAppointments = await Appointment.find({
      reasonForVisit: { $regex: /^Reschedule request for appointment/i }
    }).populate('doctorId').populate('patientId');
    
    console.log(`Found ${rescheduleRequestAppointments.length} reschedule request appointments:`);
    
    if (rescheduleRequestAppointments.length === 0) {
      console.log('✅ No reschedule request appointments found - no cleanup needed');
      return;
    }
    
    let deletedCount = 0;
    let cleanedSlots = 0;
    
    for (const rescheduleApp of rescheduleRequestAppointments) {
      console.log(`\n🔍 Processing reschedule request appointment:`);
      console.log(`   ID: ${rescheduleApp._id.toString().substr(-8)}`);
      console.log(`   Date: ${rescheduleApp.appointmentDate?.toISOString().split('T')[0] || 'Unknown'}`);
      console.log(`   Time: ${rescheduleApp.appointmentDate?.toTimeString().split(' ')[0] || 'Unknown'}`);
      console.log(`   Status: ${rescheduleApp.status}`);
      console.log(`   Reason: ${rescheduleApp.reasonForVisit?.substring(0, 50)}...`);
      
      // Extract original appointment ID from the reason text
      const match = rescheduleApp.reasonForVisit.match(/appointment\\s*([a-f0-9]{24})/i);
      const originalAppointmentId = match ? match[1] : null;
      
      if (originalAppointmentId) {
        console.log(`   🔗 References original appointment: ${originalAppointmentId.substr(-8)}`);
        
        // Check if the original appointment still exists
        const originalAppointment = await Appointment.findById(originalAppointmentId);
        
        if (originalAppointment) {
          console.log(`   📋 Original appointment still exists - this is a duplicate`);
          console.log(`   🗑️ Deleting duplicate reschedule request appointment...`);
          
          // Clean up the slot associated with this duplicate appointment
          if (rescheduleApp.slotId) {
            const slot = await Slot.findById(rescheduleApp.slotId);
            if (slot && slot.appointmentId?.equals(rescheduleApp._id)) {
              console.log(`   🗑️ Cleaning up associated slot ${slot._id.toString().substr(-8)}`);
              await Slot.findByIdAndDelete(slot._id);
              cleanedSlots++;
            }
          }
          
          // Delete the duplicate appointment
          await Appointment.findByIdAndDelete(rescheduleApp._id);
          deletedCount++;
          console.log(`   ✅ Deleted duplicate appointment`);
        } else {
          console.log(`   ⚠️ Original appointment not found - this might be the only one left`);
          console.log(`   🔄 Converting to regular appointment...`);
          
          // Convert this to a regular appointment by cleaning up the reason
          rescheduleApp.reasonForVisit = 'Consultation'; // Generic reason
          await rescheduleApp.save();
          console.log(`   ✅ Converted to regular appointment`);
        }
      } else {
        console.log(`   ⚠️ Could not extract original appointment ID from reason text`);
        console.log(`   🔄 Converting to regular appointment...`);
        
        // Convert to regular appointment
        rescheduleApp.reasonForVisit = 'Consultation';
        await rescheduleApp.save();
        console.log(`   ✅ Converted to regular appointment`);
      }
    }
    
    console.log(`\n📊 Cleanup Summary:`);
    console.log(`   🗑️ Deleted ${deletedCount} duplicate reschedule request appointments`);
    console.log(`   🗑️ Cleaned up ${cleanedSlots} associated slots`);
    console.log(`   🔄 Converted ${rescheduleRequestAppointments.length - deletedCount} appointments to regular appointments`);
    
    // Now let's look for any doctor-patient pairs that have multiple appointments on different dates
    console.log(`\n🔍 Checking for remaining duplicate appointments by doctor-patient pairs...\n`);
    
    const allAppointments = await Appointment.aggregate([
      {
        $match: {
          status: { $in: ['pending', 'confirmed', 'completed'] }
        }
      },
      {
        $group: {
          _id: {
            doctorId: '$doctorId',
            patientId: '$patientId'
          },
          appointments: {
            $push: {
              appointmentId: '$_id',
              appointmentDate: '$appointmentDate',
              status: '$status',
              reasonForVisit: '$reasonForVisit'
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);
    
    console.log(`Found ${allAppointments.length} doctor-patient pairs with multiple appointments:`);
    
    for (const pair of allAppointments) {
      const doctor = await Doctor.findById(pair._id.doctorId).populate('userId');
      const patient = await Patient.findById(pair._id.patientId).populate('userId');
      
      console.log(`\n👨‍⚕️ Doctor: ${doctor?.userId?.firstName || 'Unknown'} ${doctor?.userId?.lastName || 'Unknown'}`);
      console.log(`👤 Patient: ${patient?.userId?.firstName || 'Unknown'} ${patient?.userId?.lastName || 'Unknown'}`);
      console.log(`   📋 ${pair.count} appointments:`);
      
      pair.appointments.forEach((apt, index) => {
        console.log(`      ${index + 1}. ${apt.appointmentDate?.toISOString().split('T')[0]} - ${apt.status} - ${apt.reasonForVisit?.substring(0, 30)}...`);
      });
    }
    
    console.log(`\n✅ Cleanup completed! Check the results above.`);
    console.log(`\n💡 To prevent this in the future:`);
    console.log(`   1. Always use the proper reschedule workflow (propose → approve)`);
    console.log(`   2. Don't create new appointments for reschedules`);
    console.log(`   3. Update existing appointments instead`);
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Database connection closed');
  }
}

fixDuplicateRescheduleAppointments();