import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

import HealthcareFacility from '../models/HealthcareFacility.js';

// Usage:
//   node scripts/updateFacilityImagesFromCloudinary.js <cloudinary_folder>
// The script pulls all images from the provided Cloudinary folder and assigns
// 2-3 images to every facility of types: hospital, clinic, pharmacy, primary_care.

async function connectDB() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) throw new Error('Missing MONGO_URI in backend/.env');
  await mongoose.connect(uri, { dbName: process.env.MONGO_DB || undefined });
}

function configureCloudinary() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error('Missing Cloudinary env: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
  }
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });
}

async function fetchAllFolderImages(folder) {
  const urls = [];
  let next_cursor = undefined;
  do {
    const res = await cloudinary.search
      .expression(`folder:${folder}`)
      .with_field('tags')
      .max_results(500)
      .next_cursor(next_cursor)
      .execute();
    (res.resources || []).forEach(r => {
      if (r.secure_url) urls.push(r.secure_url);
      else if (r.url) urls.push(r.url);
    });
    next_cursor = res.next_cursor;
  } while (next_cursor);
  return urls;
}

function pickN(urls, startIdx, n = 3) {
  const out = [];
  for (let k = 0; k < n; k++) {
    const idx = (startIdx + k) % urls.length;
    out.push(urls[idx]);
  }
  return out;
}

async function updateFacilitiesWithImages(urls, types) {
  if (!urls.length) throw new Error('No images found in the specified Cloudinary folder');

  const captions = ['exterior', 'interior', 'reception', 'ward', 'lobby'];
  const imageType = ['exterior', 'interior', 'reception'];

  let totalUpdated = 0;
  for (const t of types) {
    const facilities = await HealthcareFacility.find({ type: t }).lean();
    console.log(`Type=${t}: found ${facilities.length} facilities`);
    let i = 0;
    for (const f of facilities) {
      const chosen = pickN(urls, i, 3);
      const images = chosen.map((url, idx) => ({
        url,
        caption: captions[idx % captions.length],
        type: imageType[idx % imageType.length],
      }));
      await HealthcareFacility.updateOne({ _id: f._id }, { $set: { 'media.images': images } });
      totalUpdated++;
      i += 3;
    }
  }
  return totalUpdated;
}

async function run() {
  try {
    const folder = process.argv[2] || process.env.CLOUDINARY_DEFAULT_FOLDER;
    if (!folder) {
      console.error('Usage: node scripts/updateFacilityImagesFromCloudinary.js <cloudinary_folder>');
      process.exit(1);
    }

    console.log('Connecting to DB...');
    await connectDB();
    console.log('Configuring Cloudinary...');
    configureCloudinary();

    console.log(`Fetching images from Cloudinary folder: ${folder}`);
    const urls = await fetchAllFolderImages(folder);
    console.log(`Fetched ${urls.length} images`);

    const types = ['hospital', 'clinic', 'pharmacy', 'primary_care'];
    const updated = await updateFacilitiesWithImages(urls, types);

    console.log(`Updated ${updated} facilities with images from folder: ${folder}`);
    await mongoose.disconnect();
    console.log('Done');
  } catch (e) {
    console.error('Script failed:', e.message);
    process.exit(1);
  }
}

run();
