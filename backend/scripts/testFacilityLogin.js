import dotenv from 'dotenv';
import path from 'path';
import url from 'url';
import fetch from 'node-fetch';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database.js';
import HealthcareFacility from '../models/HealthcareFacility.js';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function run() {
  const API = process.env.API_BASE_URL || 'http://localhost:5000/api';
  await connectDatabase();

  const fac = await HealthcareFacility.findOne({}).select('authEmail name');
  if (!fac || !fac.authEmail) {
    console.log('No facility with authEmail found');
    process.exit(0);
  }

  const body = { authEmail: fac.authEmail, password: process.env.FACILITY_OWNER_DEFAULT_PASSWORD || 'Facility@2025' };
  console.log('Testing login for:', fac.name, fac.authEmail);

  const resp = await fetch(`${API}/healthcare-facilities/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const text = await resp.text();
  console.log('HTTP', resp.status, resp.statusText);
  console.log(text);

  await mongoose.connection.close();
}

run().catch(async (err) => {
  console.error('Test failed:', err);
  try { await mongoose.connection.close(); } catch {}
  process.exit(1);
});
