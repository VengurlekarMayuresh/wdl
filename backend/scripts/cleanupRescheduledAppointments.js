import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

import Appointment from '../models/Appointment.js';
import Slot from '../models/Slot.js';

async function connectDB() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) throw new Error('Missing MONGO_URI in backend/.env');
  await mongoose.connect(uri, { dbName: process.env.MONGO_DB || undefined });
}

async function cleanupRescheduledAppointments() {
  try {
    await connectDB();
    console.log('🧹 Cleaning up old rescheduled appointments...\n');
    
    // Find all appointments with 'rescheduled' status
    const rescheduledAppointments = await Appointment.find({ status: 'rescheduled' });
    
    console.log(`Found ${rescheduledAppointments.length} appointments with 'rescheduled' status`);
    
    if (rescheduledAppointments.length === 0) {
      console.log('✅ No cleanup needed - no rescheduled appointments found');
      return;
    }
    
    let deletedCount = 0;
    let orphanedSlotsDeleted = 0;
    
    for (const appointment of rescheduledAppointments) {
      console.log(`\n🔍 Processing appointment ${appointment._id.toString().substr(-8)}:`);
      console.log(`   Original Date: ${appointment.rescheduledFrom?.originalDate?.toISOString().split('T')[0] || 'Unknown'}`);
      console.log(`   New Date: ${appointment.appointmentDate?.toISOString().split('T')[0] || 'Unknown'}`);
      console.log(`   Rescheduled By: ${appointment.rescheduledFrom?.rescheduledBy || 'Unknown'}`);
      
      // Check if this appointment has been replaced by a newer one
      const newerAppointment = await Appointment.findOne({
        doctorId: appointment.doctorId,
        patientId: appointment.patientId,
        _id: { $ne: appointment._id },
        createdAt: { $gt: appointment.updatedAt },
        status: { $in: ['pending', 'confirmed', 'completed'] }
      });
      
      if (newerAppointment) {
        console.log(`   ✅ Found newer appointment ${newerAppointment._id.toString().substr(-8)} - safe to delete this rescheduled one`);
        
        // Check if the old slot associated with this appointment is still around and orphaned
        if (appointment.slotId) {
          const slot = await Slot.findById(appointment.slotId);
          if (slot && slot.appointmentId?.equals(appointment._id)) {
            console.log(`   🗑️ Deleting orphaned slot ${slot._id.toString().substr(-8)}`);
            await Slot.findByIdAndDelete(slot._id);
            orphanedSlotsDeleted++;
          }
        }
        
        // Delete the rescheduled appointment
        await Appointment.findByIdAndDelete(appointment._id);
        console.log(`   🗑️ Deleted rescheduled appointment`);
        deletedCount++;
      } else {
        console.log(`   ⚠️ No newer appointment found - keeping this one but changing status to 'confirmed'`);
        appointment.status = 'confirmed';
        await appointment.save();
      }
    }
    
    console.log(`\n📊 Cleanup Summary:`);
    console.log(`   🗑️ Deleted ${deletedCount} rescheduled appointments`);
    console.log(`   🗑️ Deleted ${orphanedSlotsDeleted} orphaned slots`);
    console.log(`   ✅ Updated ${rescheduledAppointments.length - deletedCount} appointments to 'confirmed' status`);
    
    console.log('\n✅ Cleanup completed successfully!');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Database connection closed');
  }
}

cleanupRescheduledAppointments();