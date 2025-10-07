import dotenv from 'dotenv';
import path from 'path';
import url from 'url';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database.js';
import HealthcareFacility from '../models/HealthcareFacility.js';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function run() {
  await connectDatabase();

  const countBefore = await HealthcareFacility.countDocuments({});
  const res = await HealthcareFacility.deleteMany({});
  const countAfter = await HealthcareFacility.countDocuments({});

  console.log(`Deleted ${res.deletedCount} facilities. Before: ${countBefore}, After: ${countAfter}`);

  await mongoose.connection.close();
  process.exit(0);
}

run().catch(async (err) => {
  console.error('Delete all facilities failed:', err);
  try { await mongoose.connection.close(); } catch {}
  process.exit(1);
});
