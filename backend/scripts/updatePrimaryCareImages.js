import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

import HealthcareFacility from '../models/HealthcareFacility.js';

const PRIMARY_CARE_IMAGES = [
  'https://images.unsplash.com/photo-1587502537745-84b4053f79c4?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1583912086096-7f6c2b4b9cf3?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1576765607924-b211db2fc0f1?auto=format&fit=crop&w=1200&q=80'
];

function pickImages(seed = 0) {
  const a = PRIMARY_CARE_IMAGES[seed % PRIMARY_CARE_IMAGES.length];
  const b = PRIMARY_CARE_IMAGES[(seed + 1) % PRIMARY_CARE_IMAGES.length];
  return [a, b];
}

async function run() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error('Missing MONGO_URI in backend/.env');
    process.exit(1);
  }
  await mongoose.connect(uri, { dbName: process.env.MONGO_DB || undefined });
  console.log('Connected to MongoDB');

  const query = { type: 'primary_care' };
  const facilities = await HealthcareFacility.find(query).lean();
  console.log(`Found ${facilities.length} primary care facilities`);

  let updated = 0;
  for (let i = 0; i < facilities.length; i++) {
    const f = facilities[i];
    const hasImages = Array.isArray(f.media?.images) && f.media.images.length >= 2;
    if (hasImages) continue;

    const [img1, img2] = pickImages(i);
    await HealthcareFacility.updateOne(
      { _id: f._id },
      {
        $set: {
          media: {
            ...(f.media || {}),
            images: [
              { url: img1, caption: 'exterior', type: 'exterior' },
              { url: img2, caption: 'interior', type: 'interior' }
            ]
          }
        }
      }
    );
    updated++;
  }

  console.log(`Updated ${updated} facilities with primary care images`);
  await mongoose.disconnect();
  console.log('Done');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
