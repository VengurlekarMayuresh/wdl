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

async function deleteOldRescheduledAppointments() {
  try {
    await connectDB();
    console.log('🔍 Finding and deleting old appointments that were rescheduled...\n');
    
    // Find doctor-patient pairs with multiple appointments
    const duplicatePairs = await Appointment.aggregate([
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
              reasonForVisit: '$reasonForVisit',
              rescheduledFrom: '$rescheduledFrom'
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
    
    console.log(`Found ${duplicatePairs.length} doctor-patient pairs with multiple appointments\n`);
    
    let deletedAppointments = 0;
    let deletedSlots = 0;
    
    for (const pair of duplicatePairs) {
      const doctor = await Doctor.findById(pair._id.doctorId).populate('userId');
      const patient = await Patient.findById(pair._id.patientId).populate('userId');
      
      console.log(`👨‍⚕️ Doctor: ${doctor?.userId?.firstName || 'Unknown'} ${doctor?.userId?.lastName || 'Unknown'}`);
      console.log(`👤 Patient: ${patient?.userId?.firstName || 'Unknown'} ${patient?.userId?.lastName || 'Unknown'}`);
      console.log(`   Found ${pair.count} appointments:`);
      
      // Sort appointments by date
      const sortedAppointments = pair.appointments.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
      
      sortedAppointments.forEach((apt, index) => {
        console.log(`      ${index + 1}. ${apt.appointmentDate?.toISOString().split('T')[0]} ${apt.appointmentDate?.toTimeString().split(' ')[0]} - ${apt.status} - ${apt.reasonForVisit?.substring(0, 30)}...`);
      });
      
      // Logic: If there are multiple appointments, keep the latest one and delete the older ones
      // But first check if any appointment has rescheduledFrom data indicating it was rescheduled
      const rescheduledAppointments = sortedAppointments.filter(apt => apt.rescheduledFrom);
      const regularAppointments = sortedAppointments.filter(apt => !apt.rescheduledFrom);
      
      let appointmentsToDelete = [];
      let appointmentToKeep = null;
      
      if (rescheduledAppointments.length > 0) {
        // If there are rescheduled appointments, keep the latest rescheduled one
        appointmentToKeep = rescheduledAppointments[rescheduledAppointments.length - 1];
        appointmentsToDelete = [...regularAppointments, ...rescheduledAppointments.slice(0, -1)];
        console.log(`   🎯 Strategy: Keep latest rescheduled appointment (${appointmentToKeep.appointmentDate?.toISOString().split('T')[0]})`);
      } else {
        // If no rescheduled appointments, keep the latest one
        appointmentToKeep = sortedAppointments[sortedAppointments.length - 1];
        appointmentsToDelete = sortedAppointments.slice(0, -1);
        console.log(`   🎯 Strategy: Keep latest appointment (${appointmentToKeep.appointmentDate?.toISOString().split('T')[0]})`);
      }
      
      console.log(`   🗑️ Will delete ${appointmentsToDelete.length} older appointments:`);
      
      for (const aptToDelete of appointmentsToDelete) {
        console.log(`      ❌ Deleting: ${aptToDelete.appointmentDate?.toISOString().split('T')[0]} - ${aptToDelete.reasonForVisit?.substring(0, 30)}...`);
        
        // Find and delete associated slot
        const appointment = await Appointment.findById(aptToDelete.appointmentId);
        if (appointment && appointment.slotId) {
          const slot = await Slot.findById(appointment.slotId);
          if (slot) {
            console.log(`         🗑️ Deleting associated slot ${slot._id.toString().substr(-8)}`);
            await Slot.findByIdAndDelete(slot._id);
            deletedSlots++;
          }
        }
        
        // Delete the appointment
        await Appointment.findByIdAndDelete(aptToDelete.appointmentId);
        deletedAppointments++;
      }
      
      console.log(`   ✅ Kept appointment: ${appointmentToKeep.appointmentDate?.toISOString().split('T')[0]} - ${appointmentToKeep.reasonForVisit?.substring(0, 30)}...\n`);
    }
    
    console.log(`📊 Summary:`);
    console.log(`   🗑️ Deleted ${deletedAppointments} old appointments`);
    console.log(`   🗑️ Deleted ${deletedSlots} associated slots`);
    console.log(`   ✅ Cleaned up ${duplicatePairs.length} doctor-patient pairs`);
    
    // Verify the cleanup worked
    console.log(`\n🔍 Verification - checking for remaining duplicates...`);
    
    const remainingDuplicates = await Appointment.aggregate([
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
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);
    
    console.log(`   ${remainingDuplicates.length} doctor-patient pairs still have multiple appointments ${remainingDuplicates.length === 0 ? '✅' : '❌'}`);
    
    if (remainingDuplicates.length === 0) {
      console.log(`\n🎉 SUCCESS! All duplicate appointments have been cleaned up!`);
    } else {
      console.log(`\n⚠️ Some duplicates remain - manual review may be needed`);
    }
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Database connection closed');
  }
}

deleteOldRescheduledAppointments();
