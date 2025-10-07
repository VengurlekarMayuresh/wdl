import path from 'path';
import url from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database.js';
import HealthcareFacility from '../models/HealthcareFacility.js';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

function to12h(time) {
  if (!time) return '';
  const [hStr, mStr] = time.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${ampm}`;
}

function deriveClinicType(subCategory) {
  switch (subCategory) {
    case 'urgent_care': return 'Urgent Care';
    case 'specialty_clinic': return 'Specialty';
    case 'general_clinic': return 'General';
    case 'walk_in_clinic': return 'Walk-in';
    default: return undefined;
  }
}

function defaultAcceptedInsurance(type) {
  if (type === 'primary_care') return ['Blue Cross Blue Shield', 'Aetna', 'UnitedHealth', 'Medicare'];
  if (type === 'hospital') return ['All major insurances', 'Medicare', 'Medicaid'];
  return ['Most major insurances', 'Medicare', 'Medicaid'];
}

function defaultLanguages() {
  return ['English', 'Spanish'];
}

async function run() {
  await connectDatabase();

  const facilities = await HealthcareFacility.find({}).lean(false);
  const bulk = [];

  for (const f of facilities) {
    const opText = {};
    if (Array.isArray(f.operatingHours) && f.operatingHours.length) {
      for (const d of DAYS) {
        const found = f.operatingHours.find(x => x.day === d);
        if (!found || found.isOpen === false) {
          opText[d] = 'Closed';
        } else {
          const is24h = (found.openTime === '00:00' && found.closeTime === '23:59') || f.is24x7;
          opText[d] = is24h ? '24 hours' : `${to12h(found.openTime)} - ${to12h(found.closeTime)}`;
        }
      }
    }

    const updates = {};

    // providerType mirrors type
    if (!f.providerType) updates.providerType = f.type;

    // top-level phone
    if (!f.phone && f.contact?.phone?.primary) updates.phone = f.contact.phone.primary;

    // operatingHoursText
    if (Object.keys(opText).length) updates.operatingHoursText = opText;

    // acceptedInsurance
    if (!Array.isArray(f.acceptedInsurance) || f.acceptedInsurance.length === 0) {
      updates.acceptedInsurance = defaultAcceptedInsurance(f.type);
    }

    // languages
    if (!Array.isArray(f.languages) || f.languages.length === 0) {
      updates.languages = defaultLanguages();
    }

    // clinicType & appointmentRequired
    if (f.type === 'clinic') {
      const ctype = deriveClinicType(f.subCategory);
      if (ctype) updates.clinicType = ctype;
      updates.appointmentRequired = f.subCategory !== 'urgent_care';
    } else if (f.type === 'primary_care') {
      updates.appointmentRequired = true;
    } else {
      updates.appointmentRequired = false;
    }

    if (Object.keys(updates).length > 0) {
      bulk.push({ updateOne: { filter: { _id: f._id }, update: { $set: updates } } });
    }
  }

  if (bulk.length) {
    const res = await HealthcareFacility.bulkWrite(bulk);
    console.log(`Updated facilities: ${res.modifiedCount}`);
  } else {
    console.log('No facilities required updates.');
  }

  await mongoose.connection.close();
  process.exit(0);
}

run().catch(async (err) => {
  console.error('Migration failed:', err);
  try { await mongoose.connection.close(); } catch {}
  process.exit(1);
});
