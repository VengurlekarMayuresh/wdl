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

function reconstructPasswordFromEmail(email) {
  // Emails look like: some-slug-<N>@example.com, where N is 1..50 per type
  const m = email.match(/-(\d+)@example\.com$/i);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  if (!Number.isFinite(n)) return null;
  // Seed used Facility@{1000 + (n-1)}
  return `Facility@${1000 + (n - 1)}`;
}

async function run() {
  await connectDatabase();

  const facilities = await HealthcareFacility.find({ tags: 'seed-facilities' })
    .populate('owner', 'email userType')
    .select('name type providerType owner')
    .lean();

  const creds = [];
  for (const f of facilities) {
    const email = f.owner?.email;
    if (!email) continue;
    let password = null;
    if (/@example\.com$/i.test(email)) {
      password = reconstructPasswordFromEmail(email);
    }
    creds.push({
      name: f.name,
      type: f.type,
      facilityId: f._id?.toString?.() || String(f._id),
      email,
      password
    });
  }

  // Sort by type then name
  creds.sort((a, b) => {
    if (a.type === b.type) return a.name.localeCompare(b.name);
    return a.type.localeCompare(b.type);
  });

  const payload = {
    generatedAt: new Date().toISOString(),
    total: creds.length,
    credentials: creds
  };

  fs.writeFileSync(OUT_FILE, JSON.stringify(payload, null, 2));
  console.log(`Updated credentials written to ${OUT_FILE} (total: ${creds.length})`);

  await mongoose.connection.close();
  process.exit(0);
}

run().catch(async (err) => {
  console.error('Rebuild credentials failed:', err);
  try { await mongoose.connection.close(); } catch {}
  process.exit(1);
});
