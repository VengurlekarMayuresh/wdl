import dotenv from 'dotenv';
import path from 'path';
import url from 'url';
import fs from 'fs';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database.js';
import HealthcareFacility from '../models/HealthcareFacility.js';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const OUT_FILE = path.join(__dirname, '..', 'data', 'facilityAdminCredentials.json');
const DEFAULT_PASSWORD = process.env.FACILITY_OWNER_DEFAULT_PASSWORD || 'Facility@2025';

async function run() {
  await connectDatabase();

  const facilities = await HealthcareFacility.find({}).select('name type email');
  const creds = facilities.filter(f => !!f.email).map(f => ({
    name: f.name,
    type: f.type,
    facilityId: f._id.toString(),
    email: f.email,
    password: DEFAULT_PASSWORD,
  }));

  creds.sort((a,b)=> a.type===b.type ? a.name.localeCompare(b.name) : a.type.localeCompare(b.type));

  fs.writeFileSync(OUT_FILE, JSON.stringify({ generatedAt: new Date().toISOString(), total: creds.length, credentials: creds }, null, 2));
  console.log(`Wrote facility (authEmail) credentials to ${OUT_FILE}`);

  await mongoose.connection.close();
  process.exit(0);
}

run().catch(async (err) => {
  console.error('Write facility credentials failed:', err);
  try { await mongoose.connection.close(); } catch {}
  process.exit(1);
});
