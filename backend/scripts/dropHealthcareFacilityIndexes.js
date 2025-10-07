import dotenv from 'dotenv';
import path from 'path';
import url from 'url';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database.js';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function run() {
  await connectDatabase();
  const coll = mongoose.connection.collection('healthcarefacilities');
  const indexes = await coll.indexes();
  console.log('Existing indexes:', indexes.map(i => i.name));

  const toDrop = ['userId_1', 'authEmail_1'];
  for (const name of toDrop) {
    try {
      await coll.dropIndex(name);
      console.log('Dropped index', name);
    } catch (e) {
      console.log('Skip drop', name, e.message);
    }
  }

  await mongoose.connection.close();
  process.exit(0);
}

run().catch(async (err) => {
  console.error('Drop indexes failed:', err);
  try { await mongoose.connection.close(); } catch {}
  process.exit(1);
});
