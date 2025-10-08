import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

import HealthcareFacility from '../models/HealthcareFacility.js';

async function connectDB() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) throw new Error('Missing MONGO_URI in backend/.env');
  await mongoose.connect(uri, { dbName: process.env.MONGO_DB || undefined });
}

async function verifyImages() {
  try {
    await connectDB();
    
    console.log('Verifying facility images...\n');
    
    const types = ['hospital', 'clinic', 'pharmacy', 'primary_care'];
    
    for (const type of types) {
      console.log(`=== ${type.toUpperCase()} FACILITIES ===`);
      
      // Get count of facilities with images
      const totalCount = await HealthcareFacility.countDocuments({ type });
      const withImagesCount = await HealthcareFacility.countDocuments({ 
        type, 
        'media.images.0': { $exists: true } 
      });
      
      console.log(`Total ${type} facilities: ${totalCount}`);
      console.log(`Facilities with images: ${withImagesCount}`);
      
      // Get a sample facility with images
      const sampleFacility = await HealthcareFacility.findOne({ 
        type, 
        'media.images.0': { $exists: true } 
      });
      
      if (sampleFacility) {
        console.log(`Sample: ${sampleFacility.name}`);
        console.log(`Images count: ${sampleFacility.media.images.length}`);
        sampleFacility.media.images.forEach((img, i) => {
          console.log(`  ${i+1}. ${img.type} - ${img.caption}: ${img.url.substring(0, 60)}...`);
        });
      }
      console.log('');
    }
    
    await mongoose.disconnect();
    console.log('Verification complete!');
  } catch (error) {
    console.error('Verification failed:', error.message);
    process.exit(1);
  }
}

verifyImages();