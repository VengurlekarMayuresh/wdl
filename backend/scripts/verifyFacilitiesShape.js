import path from 'path';
import url from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database.js';
import HealthcareFacility from '../models/HealthcareFacility.js';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function run() {
  await connectDatabase();

  const types = ['hospital','clinic','primary_care','pharmacy'];

  for (const t of types) {
    const count = await HealthcareFacility.countDocuments({ type: t });
    const sample = await HealthcareFacility.findOne({ type: t })
      .select('name type providerType phone languages acceptedInsurance clinicType appointmentRequired operatingHours operatingHoursText is24x7 address city subCategory media rating')
      .lean();

    console.log(`\n=== ${t.toUpperCase()} ===`);
    console.log(`Count: ${count}`);
    if (sample) {
      const preview = {
        _id: sample._id,
        name: sample.name,
        type: sample.type,
        providerType: sample.providerType,
        subCategory: sample.subCategory,
        phone: sample.phone,
        languages: sample.languages,
        acceptedInsurance: sample.acceptedInsurance,
        clinicType: sample.clinicType,
        appointmentRequired: sample.appointmentRequired,
        is24x7: sample.is24x7,
        operatingHoursText: sample.operatingHoursText,
        hasOperatingHours: Array.isArray(sample.operatingHours) && sample.operatingHours.length > 0,
        hasImages: Array.isArray(sample.media?.images) && sample.media.images.length > 0,
        rating: sample.rating,
      };
      console.log(JSON.stringify(preview, null, 2));
    } else {
      console.log('No sample found.');
    }
  }

  await mongoose.connection.close();
  process.exit(0);
}

run().catch(async (err) => {
  console.error('Verification failed:', err);
  try { await mongoose.connection.close(); } catch {}
  process.exit(1);
});
