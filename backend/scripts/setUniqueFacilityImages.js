import path from 'path';
import url from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database.js';
import HealthcareFacility from '../models/HealthcareFacility.js';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const imageSets = {
  hospital: [
    'https://images.unsplash.com/photo-1586773860418-d37222d8fce3',
    'https://images.unsplash.com/photo-1584433144859-1fc3ab64a957',
    'https://images.unsplash.com/photo-1585842378054-ee2e52f94ba6',
    'https://images.unsplash.com/photo-1585580687542-3baf0b96f1ed'
  ],
  clinic: [
    'https://images.unsplash.com/photo-1576765608610-cb84c3a3e1ac',
    'https://images.unsplash.com/photo-1587300003388-59208cc962cb',
    'https://images.unsplash.com/photo-1579154204601-01588f351e67',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b'
  ],
  primary_care: [
    'https://images.unsplash.com/photo-1587502537745-84b4053f79c4',
    'https://images.unsplash.com/photo-1600959907703-125ba1374a3f',
    'https://images.unsplash.com/photo-1584988299601-8f1d1d1e88c5'
  ],
  pharmacy: [
    'https://images.unsplash.com/photo-1587854692152-9b16b54c0a3b',
    'https://images.unsplash.com/photo-1584367369853-8d4d8a7b1f5b',
    'https://images.unsplash.com/photo-1560264357-8d9202250f21'
  ]
};

function pickImage(type, index) {
  const set = imageSets[type] || imageSets.hospital;
  const base = set[index % set.length];
  return `${base}?auto=format&fit=crop&w=1200&q=80&sig=${index + 1}`;
}

async function run() {
  await connectDatabase();
  const facilities = await HealthcareFacility.find({}).select('_id type media name');
  let updated = 0;

  for (let i = 0; i < facilities.length; i++) {
    const f = facilities[i];
    const img1 = pickImage(f.type, i);
    const img2 = pickImage(f.type, i + facilities.length);
    const media = {
      images: [
        { url: img1, caption: 'exterior', type: 'exterior' },
        { url: img2, caption: 'interior', type: 'interior' }
      ]
    };
    await HealthcareFacility.updateOne({ _id: f._id }, { $set: { media } });
    updated++;
  }

  console.log(`Updated ${updated} facilities with unique images`);
  await mongoose.connection.close();
  process.exit(0);
}

run().catch(async (e) => {
  console.error('Failed to set images:', e);
  try { await mongoose.connection.close(); } catch {}
  process.exit(1);
});
