import fs from 'fs';
import path from 'path';
import url from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database.js';
import User from '../models/User.js';
import CareProvider from '../models/CareProvider.js';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from backend root explicitly
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const dataDir = path.join(__dirname, '..', 'data');

const readAllCareProviders = () => {
  const files = fs.readdirSync(dataDir).filter(f => f.toLowerCase().endsWith('.json'));
  let all = [];
  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(dataDir, file), 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) all = all.concat(parsed);
      else if (Array.isArray(parsed?.careProviders)) all = all.concat(parsed.careProviders);
    } catch (e) {
      console.warn(`Skipping invalid JSON file: ${file}: ${e.message}`);
    }
  }
  return all;
};

const mapCertificationToProviderType = (cert = '') => {
  const c = (cert || '').toUpperCase();
  if (c.includes('RN') || c.includes('LPN') || c.includes('LPN')) return 'nurse';
  if (c.includes('CNA')) return 'nursing_assistant';
  if (c.includes('PTA') || c.includes('PT')) return 'physical_therapist';
  if (c.includes('SLP')) return 'speech_therapist';
  if (c.includes('RRT')) return 'respiratory_therapist';
  if (c.includes('HHA')) return 'home_health_aide';
  return 'professional_caregiver';
};

const ensureDistinctImage = (urlStr, idx) => {
  if (!urlStr) return `https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=300&h=300&fit=crop&crop=faces&sig=${idx}`;
  // Add a cache-busting sig so even identical base URLs remain unique
  const sep = urlStr.includes('?') ? '&' : '?';
  return `${urlStr}${sep}sig=${idx + 1}`;
};

const mapDegree = (deg = '') => {
  const d = deg.toLowerCase();
  if (d.includes('associate')) return 'Associates';
  if (d.includes('bachelor')) return 'Bachelors';
  if (d.includes('master')) return 'Masters';
  if (d.includes('doctor') || d.includes('phd')) return 'Doctorate';
  if (d.includes('certificate')) return 'Certificate';
  return 'Other';
};

const mapService = (s = '') => {
  const value = s.toLowerCase();
  if (value.includes('medication administration')) return 'medication_administration';
  if (value.includes('medication')) return 'medication_management';
  if (value.includes('wound')) return 'wound_care';
  if (value.includes('vital')) return 'vital_signs_monitoring';
  if (value.includes('mobility')) return 'mobility_assistance';
  if (value.includes('personal care')) return 'personal_care';
  if (value.includes('meal')) return 'meal_preparation';
  if (value.includes('transport')) return 'transportation';
  if (value.includes('companion')) return 'companionship';
  if (value.includes('physical')) return 'physical_therapy';
  if (value.includes('occupational')) return 'occupational_therapy';
  if (value.includes('speech')) return 'speech_therapy';
  if (value.includes('respiratory')) return 'respiratory_care';
  if (value.includes('pain')) return 'pain_management';
  if (value.includes('chronic') || value.includes('disease')) return 'chronic_disease_management';
  if (value.includes('mental')) return 'mental_health_support';
  if (value.includes('family')) return 'family_support';
  if (value.includes('coordination')) return 'care_coordination';
  if (value.includes('injection')) return 'injection_services';
  if (value.includes('iv')) return 'iv_therapy';
  if (value.includes('catheter')) return 'catheter_care';
  if (value.includes('ostomy')) return 'ostomy_care';
  if (value.includes('diabetes')) return 'diabetes_management';
  return 'other';
};

const mapLicenseType = (code = '') => {
  const c = (code || '').toUpperCase();
  const allowed = ['RN','LPN','CNA','PTA','OTA','SLP','RRT','LSW','LCSW','PHARMD','RD','LPC','OTHER'];
  return allowed.includes(c) ? c : 'Other';
};

async function seed() {
  await connectDatabase();
  const items = readAllCareProviders();

  let created = 0;
  let skippedUserExists = 0;
  let updatedExisting = 0;
  let createdProfilesForExistingUsers = 0;
  let failed = 0;

  for (let i = 0; i < items.length; i++) {
    const it = items[i];

    try {
      const email = (it.email || '').toLowerCase();
      if (!email) { failed++; continue; }

      let user = await User.findOne({ email });
      if (user) {
        // Ensure distinct image for existing users too
        const newPic = ensureDistinctImage(it.profilePicture || user.profilePicture, i);
        if (newPic && newPic !== user.profilePicture) {
          user.profilePicture = newPic;
          await user.save();
          updatedExisting++;
        }
      } else {
        user = new User({
          firstName: it.firstName,
          lastName: it.lastName,
          email,
          password: it.password || 'caregiver123',
          userType: 'careprovider',
          phone: (it.phone || '').replace(/[^0-9]/g, '').slice(-12),
          dateOfBirth: it.dateOfBirth ? new Date(it.dateOfBirth) : undefined,
          gender: it.gender || 'other',
          address: it.address || {},
          profilePicture: ensureDistinctImage(it.profilePicture, i),
          bio: it.bio || ''
        });
        await user.save();
        created++;
      }

      // Create care provider profile if missing
      let careProvider = await CareProvider.findOne({ userId: user._id });
      if (careProvider) {
        skippedUserExists++;
        continue;
      }

      const cpInfo = it.careProviderInfo || {};

      careProvider = new CareProvider({
        userId: user._id,
        providerType: mapCertificationToProviderType(cpInfo.certification),
        credentials: {
          licenseNumber: cpInfo.licenseNumber,
          licenseState: cpInfo.licenseState,
          licenseType: mapLicenseType(cpInfo.certification),
          licenseExpiryDate: cpInfo.licenseExpiryDate ? new Date(cpInfo.licenseExpiryDate) : undefined,
          certifications: (cpInfo.certifications || []).map(c => ({
            name: c.name,
            issuingOrganization: c.issuingOrganization,
            certificationDate: c.issueDate ? new Date(c.issueDate) : undefined,
            expiryDate: c.expiryDate ? new Date(c.expiryDate) : undefined,
            status: 'active'
          })),
          isLicensed: !!cpInfo.certification
        },
        education: (cpInfo.education || []).map(e => ({
          institution: e.institution,
          program: e.program || e.degree,
          degree: mapDegree(e.degree || e.program),
          graduationYear: e.graduationYear
        })),
        experience: {
          yearsOfExperience: cpInfo.yearsOfExperience || 0,
          specializations: cpInfo.specializations || []
        },
        availability: {
          workSchedule: 'flexible',
          hoursPerWeek: 30,
          availableDays: ['monday','tuesday','wednesday','thursday','friday'],
          timeSlots: [
            { day: 'monday', startTime: '09:00', endTime: '17:00' },
            { day: 'wednesday', startTime: '09:00', endTime: '17:00' },
            { day: 'friday', startTime: '09:00', endTime: '17:00' },
          ],
          isAvailableForEmergency: true,
        },
        services: (cpInfo.services || []).map(s => (
          mapService(s.service || '')
        )),
        ratings: {
          averageRating: Math.round((4 + Math.random()) * 10) / 10 - 4, // adjusted below
          totalReviews: Math.floor(Math.random() * 40)
        },
        verification: {
          isVerified: cpInfo.isVerified ?? true,
          verificationDate: new Date(),
          verifiedBy: 'seed-script'
        },
        preferences: {
          workRadius: 25,
          hourlyRate: { min: 20, max: 60, currency: 'USD' },
          paymentMethods: ['cash', 'direct_deposit'],
          communicationPreference: 'email',
          acceptsNewClients: true
        },
        status: 'approved'
      });

      // Give a realistic rating between 4.2 and 5.0
      careProvider.ratings.averageRating = Math.round((4.2 + Math.random() * 0.8) * 10) / 10;

      await careProvider.save();
      createdProfilesForExistingUsers++;

    } catch (err) {
      console.error(`⚠️  Failed to import record #${i+1} (${items[i]?.email || 'no-email'}): ${err?.message}`);
      failed++;
      continue;
    }
  }

  console.log(`✅ CareProviders seeding finished. Users created: ${created}, Profiles created for existing: ${createdProfilesForExistingUsers}, Users updated image: ${updatedExisting}, Skipped existing profiles: ${skippedUserExists}, Failed: ${failed}`);
  await mongoose.connection.close();
  process.exit(0);
}

seed().catch(async (err) => {
  console.error('❌ Seeding failed:', err);
  try { await mongoose.connection.close(); } catch {}
  process.exit(1);
});
