import fs from 'fs';
import path from 'path';
import url from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fetch from 'node-fetch';
import { connectDatabase } from '../config/database.js';
import User from '../models/User.js';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function verify() {
  const credPath = path.join(__dirname, '..', 'data', 'facilityAdminCredentials.json');
  const raw = fs.readFileSync(credPath, 'utf-8');
  const json = JSON.parse(raw);
  await connectDatabase();

  let missing = 0;
  for (let i = 0; i < json.credentials.length; i++) {
    const email = json.credentials[i].email;
    const u = await User.findOne({ email: email.toLowerCase() }).select('_id email userType');
    if (!u) {
      console.log('MISSING IN DB:', email);
      missing++;
    }
  }

  console.log(`Checked ${json.credentials.length} entries. Missing in DB: ${missing}`);
  await mongoose.connection.close();

  // Try login test with first entry
  const API = process.env.API_BASE_URL || 'http://localhost:5000/api';
  const first = json.credentials[0];
  const resp = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: first.email, password: first.password })
  });
  const text = await resp.text();
  console.log('Test login HTTP', resp.status, resp.statusText);
  console.log(text);
}

verify().catch(async (err) => {
  console.error('Verification failed:', err);
  try { await mongoose.connection.close(); } catch {}
  process.exit(1);
});
