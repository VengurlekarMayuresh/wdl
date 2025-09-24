#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const specialties = [
  'Cardiology','Dermatology','Emergency Medicine','Endocrinology','Family Medicine','Gastroenterology','General Surgery','Gynecology','Hematology','Infectious Disease','Internal Medicine','Neurology','Neurosurgery','Obstetrics','Oncology','Ophthalmology','Orthopedics','Otolaryngology','Pediatrics','Psychiatry','Pulmonology','Radiology','Rheumatology','Urology'
];

const cities = [
  { city: 'New York', state: 'NY' },
  { city: 'Los Angeles', state: 'CA' },
  { city: 'Chicago', state: 'IL' },
  { city: 'Houston', state: 'TX' },
  { city: 'Phoenix', state: 'AZ' },
  { city: 'Philadelphia', state: 'PA' },
  { city: 'San Antonio', state: 'TX' },
  { city: 'San Diego', state: 'CA' },
  { city: 'Dallas', state: 'TX' },
  { city: 'San Jose', state: 'CA' }
];

// RandomUser image helpers (stable working URLs)
function portrait(gender, idx) {
  const i = idx % 100; // 0..99
  const dir = gender === 'male' ? 'men' : 'women';
  return `https://randomuser.me/api/portraits/${dir}/${i}.jpg`;
}

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

const firstNamesM = ['James','Robert','John','Michael','William','David','Richard','Joseph','Thomas','Charles','Daniel','Matthew','Anthony','Mark','Donald','Steven','Paul','Andrew','Joshua','Kenneth'];
const firstNamesF = ['Mary','Patricia','Jennifer','Linda','Elizabeth','Barbara','Susan','Jessica','Sarah','Karen','Nancy','Lisa','Margaret','Betty','Sandra','Ashley','Kimberly','Emily','Donna','Michelle'];
const lastNames = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin'];

function makeEmail(first, last, domain, i) {
  return `${first.toLowerCase()}.${last.toLowerCase()}${i}@${domain}`;
}

function makePhone(i) {
  // digits only (backend normalizes anyway)
  const a = 100 + (i % 900);
  const b = 10 + (i % 90);
  const c = 10 + ((i * 7) % 90);
  return `555${a}${b}${c}`;
}

function makeAddress(i) {
  const loc = cities[i % cities.length];
  return {
    street: `${100 + i} Main St`,
    city: loc.city,
    state: loc.state,
    zipCode: `${90000 + (i % 9000)}`,
    country: 'USA'
  };
}

function makeDoctor(i) {
  const male = i % 2 === 0;
  const first = male ? rand(firstNamesM) : rand(firstNamesF);
  const last = rand(lastNames);
  const specialty = rand(specialties);
  const licenseState = rand(cities).state;

  // reasonable DOB spread
  const year = 1970 + (i % 25);
  const month = ((i % 12) + 1).toString().padStart(2, '0');
  const day = ((i % 28) + 1).toString().padStart(2, '0');

  return {
    firstName: first,
    lastName: last,
    email: makeEmail(first, last, 'healthcenter.com', i),
    password: 'doctor123',
    phone: makePhone(i),
    dateOfBirth: `${year}-${month}-${day}`,
    gender: male ? 'male' : 'female',
    address: makeAddress(i),
    profilePicture: portrait(male ? 'male' : 'female', i),
    bio: `Experienced ${specialty.toLowerCase()} specialist providing compassionate care.`,
    doctorInfo: {
      medicalLicenseNumber: `MD${100000 + i}`,
      licenseState,
      licenseExpiryDate: `${2026 + (i % 3)}-12-31`,
      primarySpecialty: specialty,
      secondarySpecialties: [rand(specialties)],
      yearsOfExperience: 5 + (i % 25),
      npiNumber: `${1000000000 + i}`,
      education: [
        { institution: 'State Medical University', degree: 'MD', graduationYear: 2000 + (i % 20) }
      ],
      residency: [
        { hospital: 'General Hospital', specialty, startYear: 2001 + (i % 18), endYear: 2004 + (i % 18) }
      ],
      hospitalAffiliations: [
        { hospital: `${rand(cities).city} Medical Center`, position: 'Attending Physician', department: specialty, isCurrentlyAffiliated: true }
      ],
      boardCertifications: [
        { board: 'American Board of Medical Specialties', specialty, certificationDate: `${2010 + (i % 10)}-06-01`, status: 'active' }
      ],
      languagesSpoken: [ { language: 'English', proficiency: 'native' } ],
      consultationFee: 150 + (i % 10) * 10,
      acceptsInsurance: true,
      insurancesAccepted: ['Aetna', 'Blue Cross Blue Shield', 'UnitedHealthcare'],
      isVerified: true,
      status: 'approved',
      isAcceptingNewPatients: i % 3 !== 0,
      telemedicineEnabled: i % 2 === 0
    }
  };
}

function makePatient(i) {
  const male = i % 2 !== 0;
  const first = male ? rand(firstNamesM) : rand(firstNamesF);
  const last = rand(lastNames);
  const year = 1980 + (i % 30);
  const month = ((i % 12) + 1).toString().padStart(2, '0');
  const day = ((i % 28) + 1).toString().padStart(2, '0');
  return {
    firstName: first,
    lastName: last,
    email: makeEmail(first, last, 'email.com', i),
    password: 'patient123',
    phone: makePhone(1000 + i),
    dateOfBirth: `${year}-${month}-${day}`,
    gender: male ? 'male' : 'female',
    address: makeAddress(1000 + i),
    profilePicture: portrait(male ? 'male' : 'female', 50 + i),
    bio: 'Patient focused on wellness and preventive care.',
    patientInfo: {
      emergencyContact: {
        name: male ? 'Jane Doe' : 'John Doe',
        relationship: 'Spouse',
        phone: makePhone(2000 + i),
        email: male ? `jane${i}@email.com` : `john${i}@email.com`
      }
    }
  };
}

function generate() {
  const doctors = Array.from({ length: 50 }, (_, i) => makeDoctor(i));
  const patients = Array.from({ length: 50 }, (_, i) => makePatient(i));
  const data = { doctors, patients, careProviders: [] };
  const outDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'data.json');
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
  console.log(`✅ Wrote ${doctors.length} doctors and ${patients.length} patients to ${outPath}`);
}

generate();
