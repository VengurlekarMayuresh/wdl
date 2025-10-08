import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';

// Resolve backend directory and load .env explicitly (same as server.js)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function main() {
  const args = process.argv.slice(2);
  const confirmed = args.includes('--confirm');

  if (!confirmed) {
    console.error('Refusing to proceed: add --confirm to actually delete all doctors and patients.');
    console.error('Usage: node scripts/deleteAllDoctorsAndPatients.js --confirm');
    process.exit(1);
  }

  try {
    await connectDatabase();

    // Sanity check connection
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not connected');
    }

    console.log('⚠️  Deleting ALL Doctors and Patients...');

    const [{ deletedCount: doctorsDeleted } = { deletedCount: 0 }] = await Promise.all([
      Doctor.deleteMany({})
    ]);

    const { deletedCount: patientsDeleted } = await Patient.deleteMany({});

    console.log(`✅ Done. Deleted ${doctorsDeleted} doctor(s) and ${patientsDeleted} patient(s).`);
  } catch (err) {
    console.error('❌ Error during deletion:', err?.message || err);
    process.exitCode = 1;
  } finally {
    try {
      await mongoose.connection.close();
      console.log('🔒 MongoDB connection closed');
    } catch {}
  }
}

main();
