import dotenv from 'dotenv';
import path from 'path';
import url from 'url';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database.js';
import User from '../models/User.js';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function run() {
  await connectDatabase();

  const query = { email: /@example\.com$/i, userType: 'careprovider' };
  const countBefore = await User.countDocuments(query);
  const res = await User.deleteMany(query);
  const countAfter = await User.countDocuments(query);

  console.log(`Deleted ${res.deletedCount} seeded owner users. Before: ${countBefore}, After: ${countAfter}`);

  await mongoose.connection.close();
  process.exit(0);
}

run().catch(async (err) => {
  console.error('Delete seeded owners failed:', err);
  try { await mongoose.connection.close(); } catch {}
  process.exit(1);
});
