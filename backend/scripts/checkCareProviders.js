import path from 'path';
import url from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database.js';
import User from '../models/User.js';
import CareProvider from '../models/CareProvider.js';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function run() {
  await connectDatabase();

  const users = await User.find({ userType: 'careprovider' }).select('_id email').lean();
  const userIds = users.map(u => u._id.toString());
  const cpDocs = await CareProvider.find({}).select('userId providerType').lean();

  const cpByUser = new Set(cpDocs.map(c => c.userId?.toString()));
  const missing = users.filter(u => !cpByUser.has(u._id.toString()));

  console.log(`Careprovider users: ${users.length}`);
  console.log(`CareProvider docs: ${cpDocs.length}`);
  console.log(`Missing profiles: ${missing.length}`);
  if (missing.length) {
    console.log('First few missing emails:', missing.slice(0, 5).map(m => m.email));
  }

  // Show a sample that exists
  const existing = users.find(u => cpByUser.has(u._id.toString()));
  if (existing) {
    console.log('Example existing careprovider user:', existing.email);
  }

  await mongoose.connection.close();
  process.exit(0);
}

run().catch(async (err) => {
  console.error('Check failed:', err);
  try { await mongoose.connection.close(); } catch {}
  process.exit(1);
});
