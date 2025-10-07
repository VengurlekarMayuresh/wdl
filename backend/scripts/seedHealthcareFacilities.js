import path from 'path';
import url from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import { connectDatabase } from '../config/database.js';
import mongoose from 'mongoose';
import HealthcareFacility from '../models/HealthcareFacility.js';

// Resolve __dirname for ES modules
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from backend root explicitly
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const OUT_DIR = path.join(__dirname, '..', 'data');
const CREDS_FILE = path.join(OUT_DIR, 'facilityAdminCredentials.json');

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

function makeHours({ open="08:00", close="20:00", sundayOpen="10:00", sundayClose="16:00", allDay=false }) {
  if (allDay) {
    return DAYS.map(d => ({ day: d, isOpen: true, openTime: '00:00', closeTime: '23:59' }));
  }
  return DAYS.map(d => {
    if (d === 'sunday') return { day: d, isOpen: true, openTime: sundayOpen, closeTime: sundayClose };
    return { day: d, isOpen: true, openTime: open, closeTime: close };
  });
}

function uniqueImage(base, idx, type='interior') {
  const url = base || 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=1200&q=80';
  const sep = url.includes('?') ? '&' : '?';
  return { url: `${url}${sep}sig=${idx+1}`, caption: `${type} view`, type };
}

function randInRange(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randChoice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

const cities = [
  { city: 'New York', state: 'NY', pincodes: ['10001','10002','10003','10004','10005','10006','10007','10009','10010'] },
  { city: 'Brooklyn', state: 'NY', pincodes: ['11201','11203','11205','11206','11211','11215','11217','11219'] },
  { city: 'Queens', state: 'NY', pincodes: ['11101','11102','11103','11354','11355','11377'] },
  { city: 'Jersey City', state: 'NJ', pincodes: ['07302','07304','07305','07310'] },
];

const servicesByType = {
  hospital: [
    { name: 'Emergency Services', category: 'emergency' },
    { name: 'Cardiac Consultation', category: 'consultation', price: 1500, duration: 30 },
    { name: 'Surgery', category: 'treatment' },
    { name: 'Radiology', category: 'diagnostic', price: 900, duration: 25 },
  ],
  clinic: [
    { name: 'General Consultation', category: 'consultation', price: 600, duration: 20 },
    { name: 'Lab Tests', category: 'diagnostic', price: 400, duration: 15 },
    { name: 'Vaccination', category: 'treatment', price: 1200, duration: 15 },
  ],
  primary_care: [
    { name: 'Annual Physical Exams', category: 'consultation', price: 800, duration: 20 },
    { name: 'Preventive Care', category: 'consultation', price: 650, duration: 20 },
    { name: 'Health Screenings', category: 'diagnostic', price: 900, duration: 30 },
  ],
  pharmacy: [
    { name: 'Prescription Medicines', category: 'pharmacy' },
    { name: 'Health Check-ups', category: 'diagnostic', price: 500, duration: 30 },
    { name: 'Medicine Consultation', category: 'consultation', price: 100, duration: 15 },
  ],
};

const specialtiesPool = ['cardiology','neurology','orthopedics','pediatrics','gynecology','dermatology','ophthalmology','general_medicine','radiology'];

const clinicSubcats = ['general_clinic','specialty_clinic','urgent_care','walk_in_clinic'];
const hospSubcats = ['general_hospital','specialty_hospital','teaching_hospital','multi_specialty_hospital'];
const pharmSubcats = ['retail_pharmacy','hospital_pharmacy','online_pharmacy','specialty_pharmacy'];

function makeFacilityName(type, idx) {
  const bases = {
    hospital: ['Sunrise','Metropolitan','Unity','Liberty','Harbor','Valley','Summit','Riverside','Grand Central','Beacon'],
    clinic: ['City','Neighborhood','CarePoint','ClearView','Greenway','Bridge','Harbor','Skyline','Midtown','Parkside'],
    primary_care: ['Family','Wellness','Community','HealthFirst','PrimeCare','WholeCare','FirstLine','NorthStar','Union','Heritage'],
    pharmacy: ['QuickMeds','HealthPlus','MedHub','PharmaCare','CityMeds','WellRx','CareMeds','PrimePharmacy','UptownRx','MetroMeds'],
  };
  const tails = {
    hospital: ['Hospital','Medical Center','General Hospital','Multi-Specialty Hospital'],
    clinic: ['Clinic','Care Clinic','Health Clinic','Urgent Care'],
    primary_care: ['Primary Care','Family Medicine','Medical Practice','Health Center'],
    pharmacy: ['Pharmacy','Drug Store','Health Services'],
  };
  return `${randChoice(bases[type])} ${randChoice(tails[type])} #${idx+1}`;
}

function makeAddress() {
  const loc = randChoice(cities);
  return {
    street: `${randInRange(10, 9999)} ${randChoice(['Broadway','5th Ave','Madison Ave','Lexington Ave','Main St','Park Ave'])}`,
    area: randChoice(['Downtown','Uptown','Midtown','Chelsea','SoHo','Tribeca','DUMBO','Astoria']),
    city: loc.city,
    state: loc.state,
    pincode: randChoice(loc.pincodes),
    coordinates: { latitude: 0, longitude: 0 },
  };
}

function makeRating() {
  const overall = Math.round((4.2 + Math.random() * 0.8) * 10) / 10;
  return {
    overall,
    cleanliness: Math.max(3.8, Math.min(5, +(overall + (Math.random()*0.4-0.2)).toFixed(1))),
    staff: Math.max(3.8, Math.min(5, +(overall + (Math.random()*0.4-0.2)).toFixed(1))),
    facilities: Math.max(3.8, Math.min(5, +(overall + (Math.random()*0.4-0.2)).toFixed(1))),
    valueForMoney: Math.max(3.8, Math.min(5, +(overall + (Math.random()*0.4-0.2)).toFixed(1))),
    totalReviews: randInRange(80, 1500),
  };
}

function baseFacility(type, idx) {
  const address = makeAddress();
  const name = makeFacilityName(type, idx);
  const specialties = Array.from(new Set(Array.from({length: randInRange(2, 5)}, () => randChoice(specialtiesPool))));
  const services = (servicesByType[type] || []).map(s => ({
    name: s.name,
    description: s.description || s.name,
    price: s.price,
    duration: s.duration,
    category: s.category,
    isAvailable: true,
  }));
  const is24x7 = type === 'hospital' || type === 'pharmacy';

  const common = {
    name,
    type,
    providerType: type,
    subCategory: type === 'hospital' ? randChoice(hospSubcats)
               : type === 'clinic' ? randChoice(clinicSubcats)
               : type === 'pharmacy' ? randChoice(pharmSubcats)
               : 'general_clinic', // for primary_care use clinic-like categories
    description: `Auto-generated ${type} seeded for demo.`,
    contact: {
      phone: { primary: `+1-212-${randInRange(100,999)}-${randInRange(1000,9999)}` },
      email: `${name.toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0, 40)}@example.com`,
      website: 'https://example.org',
    },
    phone: `+1-212-${randInRange(100,999)}-${randInRange(1000,9999)}`,
    address,
    operatingHours: makeHours({ open: '08:00', close: '20:00', allDay: is24x7 }),
    is24x7,
    specialties,
    services,
    acceptedInsurance: type === 'primary_care' ? ['Blue Cross Blue Shield','Aetna','UnitedHealth','Medicare'] : (type === 'hospital' ? ['All major insurances','Medicare','Medicaid'] : ['Most major insurances','Medicare','Medicaid']),
    languages: ['English','Spanish'],
    facilities: ['parking','wheelchair_access','waiting_area','air_conditioning'],
    paymentMethods: ['cash','card','upi','insurance'].filter((_,i)=>i<randInRange(2,4)),
    media: {
      images: [
        uniqueImage('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d', idx, 'exterior'),
        uniqueImage('https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb', idx, 'interior'),
      ],
    },
    rating: makeRating(),
    verification: { isVerified: true },
    status: 'active',
    tags: ['seed-facilities'],
  };

  if (type === 'clinic') {
    // derive clinicType and appointmentRequired like frontend mock
    common.clinicType = common.subCategory === 'urgent_care' ? 'Urgent Care' : (common.subCategory === 'specialty_clinic' ? 'Specialty' : (common.subCategory === 'walk_in_clinic' ? 'Walk-in' : 'General'));
    common.appointmentRequired = common.subCategory !== 'urgent_care';
  }

  if (type === 'hospital') {
    common.hospitalFeatures = {
      bedCapacity: { general: randInRange(80, 300), icu: randInRange(10, 60), private: randInRange(20, 100), emergency: randInRange(5, 20) },
      emergencyServices: true,
      ambulanceService: true,
      onlineAppointment: true,
    };
    common.departments = [
      { name: 'Cardiology', head: 'Dr. John Doe', contactNumber: '+1-212-555-1212', services: ['ECG','Echo','Angiography'] },
      { name: 'Emergency', head: 'Dr. Jane Roe', contactNumber: '+1-212-555-1919', services: ['24x7 Emergency','Trauma Care'] },
    ];
  }

  if (type === 'pharmacy') {
    common.pharmacyFeatures = {
      homeDelivery: true,
      onlineOrdering: Math.random() > 0.3,
      prescriptionUpload: true,
      medicineReminder: Math.random() > 0.6,
    };
  }

  return common;
}

async function createFacility(type, idx, batchSuffix) {
  // Generate facility auth
  const name = makeFacilityName(type, idx);
  const slugBase = name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0, 25);
  const email = `${slugBase}-${idx+1}@example.com`;
  const password = (process.env.FACILITY_OWNER_DEFAULT_PASSWORD || 'Facility@2025');

  const facilityData = baseFacility(type, idx);
  facilityData.authEmail = email;
  facilityData.authPassword = password;
  // Build operatingHoursText legacy map
  const opText = {};
  for (const d of ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']) {
    const found = facilityData.operatingHours.find(x => x.day === d);
    if (!found || found.isOpen === false) {
      opText[d] = 'Closed';
    } else {
      const to12 = (t) => { const [hh, mm] = t.split(':'); let h = parseInt(hh,10); const ampm = h>=12?'PM':'AM'; h = h%12; if (h===0) h=12; return `${h}:${mm} ${ampm}`; };
      const is24h = (found.openTime === '00:00' && found.closeTime === '23:59') || facilityData.is24x7;
      opText[d] = is24h ? '24 hours' : `${to12(found.openTime)} - ${to12(found.closeTime)}`;
    }
  }
  facilityData.operatingHoursText = opText;

  facilityData.tags = [...(facilityData.tags || []), `seed-batch:${batchSuffix}`];

  // Create facility directly with email/password
  facilityData.email = email;
  facilityData.password = password;
  const facility = await HealthcareFacility.create(facilityData);
  return { facility, credentials: { name, type, facilityId: facility._id.toString(), email, password } };
}

async function run() {
  await connectDatabase();

  const batchSuffix = Date.now().toString();

  // Cleanup previous generated facilities by tag
  const prev = await HealthcareFacility.find({ tags: 'seed-facilities' }).select('_id');
  if (prev.length) {
    await HealthcareFacility.deleteMany({ _id: { $in: prev.map(p => p._id) } });
  }

  const perType = 50; // 50 of each type
  const types = ['hospital','clinic','primary_care','pharmacy'];

  const credentials = [];
  for (const type of types) {
    for (let i = 0; i < perType; i++) {
      const { credentials: cred } = await createFacility(type, i, batchSuffix);
      credentials.push(cred);
    }
  }

  // Write credentials file
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(CREDS_FILE, JSON.stringify({ generatedAt: new Date().toISOString(), total: credentials.length, credentials }, null, 2));

  console.log(`✅ Seeded facilities: ${credentials.length} (50 per type). Credentials written to ${CREDS_FILE}`);
  await mongoose.connection.close();
  process.exit(0);
}

run().catch(async (err) => {
  console.error('❌ Facilities seed failed:', err?.message || err);
  try { await mongoose.connection.close(); } catch {}
  process.exit(1);
});
