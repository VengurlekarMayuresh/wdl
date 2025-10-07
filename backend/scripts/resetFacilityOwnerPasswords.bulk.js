import path from 'path';
import url from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDatabase } from '../config/database.js';
import HealthcareFacility from '../models/HealthcareFacility.js';
import User from '../models/User.js';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const OUT_FILE = path.join(__dirname, '..', 'data', 'facilityAdminCredentials.json');
const NEW_PASSWORD = process.env.FACILITY_OWNER_DEFAULT_PASSWORD || 'Facility@2025';

async function run() {
  await connectDatabase();

  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
  const hash = await bcrypt.hash(NEW_PASSWORD, saltRounds);

  // Collect distinct owner user IDs
  const owners = await HealthcareFacility.aggregate([
    { $match: {} },
    { $project: { owner: 1, name: 1, type: 1 } },
    { $match: { owner: { $ne: null } } },
    { $group: { _id: '$owner' } },
  ]);

  const ownerIds = owners.map(o => o._id).filter(Boolean);

  // Reset passwords in bulk
  if (ownerIds.length) {
    await User.updateMany(
      { _id: { $in: ownerIds } },
      { 
        $set: { password: hash },
        $unset: { lockUntil: 1 },
        $setOnInsert: {}
      }
    );
  }

  // Build credentials list (facility -> owner email)
  const facilities = await HealthcareFacility.find({})
    .populate('owner', 'email')
    .select('name type owner')
    .lean();

  const creds = facilities
    .filter(f => f.owner?.email)
    .map(f => ({ name: f.name, type: f.type, facilityId: f._id.toString(), email: f.owner.email, password: NEW_PASSWORD }));

  creds.sort((a, b) => a.type === b.type ? a.name.localeCompare(b.name) : a.type.localeCompare(b.type));

  fs.writeFileSync(OUT_FILE, JSON.stringify({ generatedAt: new Date().toISOString(), total: creds.length, credentials: creds }, null, 2));
  console.log(`Reset ${ownerIds.length} owner passwords and updated ${OUT_FILE}`);

  await mongoose.connection.close();
  process.exit(0);
}

run().catch(async (err) => {
  console.error('Reset passwords (bulk) failed:', err);
  try { await mongoose.connection.close(); } catch {}
  process.exit(1);
});
