import path from 'path';
import url from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
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

  // Find all facilities and their owners
  const facilities = await HealthcareFacility.find({}).populate('owner', 'email userType').select('name type owner').lean(false);

  const creds = [];
  const updatedUsers = new Set();

  for (const f of facilities) {
    if (!f.owner || !f.owner.email) continue;

    // Reset owner password only once per user
    const userId = f.owner._id.toString();
    if (!updatedUsers.has(userId)) {
      const userDoc = await User.findById(userId).select('+password');
      if (!userDoc) continue;
      userDoc.password = NEW_PASSWORD; // Will be hashed by pre-save hook
      await userDoc.save();
      updatedUsers.add(userId);
    }

    creds.push({
      name: f.name,
      type: f.type,
      facilityId: f._id.toString(),
      email: f.owner.email,
      password: NEW_PASSWORD,
    });
  }

  // Sort for readability
  creds.sort((a, b) => a.type === b.type ? a.name.localeCompare(b.name) : a.type.localeCompare(b.type));

  const payload = {
    generatedAt: new Date().toISOString(),
    note: 'Passwords for facility owners have been reset to the default shown here.',
    total: creds.length,
    credentials: creds,
  };

  fs.writeFileSync(OUT_FILE, JSON.stringify(payload, null, 2));
  console.log(`Reset ${updatedUsers.size} user passwords and wrote ${creds.length} credentials to ${OUT_FILE}`);

  await mongoose.connection.close();
  process.exit(0);
}

run().catch(async (err) => {
  console.error('Reset passwords failed:', err);
  try { await mongoose.connection.close(); } catch {}
  process.exit(1);
});
