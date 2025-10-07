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
  const pwd = process.env.FACILITY_OWNER_DEFAULT_PASSWORD || 'Facility@2025';

  const facilities = await HealthcareFacility.find({}).select('+authPassword name authEmail').limit(10);
  let okCount = 0;
  for (const f of facilities) {
    const ok = await f.compareAuthPassword(pwd);
    console.log(`${f.name} | ${f.authEmail} -> compare=${ok}`);
    if (ok) okCount++;
  }
  console.log(`OK matches: ${okCount}/${facilities.length}`);
  await mongoose.connection.close();
  process.exit(0);
}

run().catch(async (err) => {
  console.error('Verify failed:', err);
  try { await mongoose.connection.close(); } catch {}
  process.exit(1);
});
