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
  const userIds = users.map(u => u._id);

  const existing = await CareProvider.find({ userId: { $in: userIds } }).select('userId').lean();
  const existingIds = new Set(existing.map(e => e.userId.toString()));

  let created = 0;
  for (const u of users) {
    if (!existingIds.has(u._id.toString())) {
      await CareProvider.create({
        userId: u._id,
        providerType: 'other',
        experience: { yearsOfExperience: 0 },
        preferences: { acceptsNewClients: true, hourlyRate: { min: 0, currency: 'USD' } },
        services: [],
      });
      created++;
    }
  }

  console.log(`Backfill complete. Created ${created} missing CareProvider profiles.`);
  await mongoose.connection.close();
  process.exit(0);
}

run().catch(async (err) => {
  console.error('Backfill failed:', err);
  try { await mongoose.connection.close(); } catch {}
  process.exit(1);
});
