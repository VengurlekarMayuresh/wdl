import path from 'path';
import url from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database.js';
import User from '../models/User.js';
import HealthcareFacility from '../models/HealthcareFacility.js';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const DEFAULT_PASSWORD = process.env.FACILITY_OWNER_DEFAULT_PASSWORD || 'Facility@2025';

async function run() {
  await connectDatabase();
  const facilities = await HealthcareFacility.find({}).select('_id name email phone userId');
  let createdUsers = 0;
  let linked = 0;
  let updatedTypes = 0;

  for (const f of facilities) {
    try {
      let user = null;
      if (f.userId) {
        user = await User.findById(f.userId);
      }
      if (!user) {
        user = await User.findOne({ email: f.email });
      }
      if (!user) {
        user = new User({
          firstName: (f.name || 'Facility').split(' ')[0],
          lastName: (f.name || '').split(' ').slice(1).join(' ') || 'Account',
          email: f.email,
          password: DEFAULT_PASSWORD,
          userType: 'facility',
          phone: (f.phone || '').replace(/[^0-9]/g, '').slice(-12),
          isActive: true,
        });
        await user.save();
        createdUsers++;
      } else if (user.userType !== 'facility') {
        user.userType = 'facility';
        await user.save();
        updatedTypes++;
      }

      if (!f.userId || f.userId.toString() !== user._id.toString()) {
        await HealthcareFacility.updateOne({ _id: f._id }, { $set: { userId: user._id } });
        linked++;
      }
    } catch (e) {
      console.error('Failed to link facility', f?._id?.toString(), e.message);
    }
  }

  console.log(`Linked facilities to users. New users: ${createdUsers}, Links added/updated: ${linked}, UserType fixes: ${updatedTypes}`);
  await mongoose.connection.close();
  process.exit(0);
}

run().catch(async (err) => {
  console.error('Backfill failed:', err);
  try { await mongoose.connection.close(); } catch {}
  process.exit(1);
});
