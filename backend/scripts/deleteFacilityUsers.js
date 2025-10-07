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
  const res = await User.deleteMany({ userType: 'facility', email: /@example\.com$/i });
  console.log(`Deleted facility users: ${res.deletedCount}`);
  await mongoose.connection.close();
  process.exit(0);
}

run().catch(async (err) => {
  console.error('Delete facility users failed:', err);
  try { await mongoose.connection.close(); } catch {}
  process.exit(1);
});
