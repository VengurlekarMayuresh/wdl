import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import CareProvider from '../models/CareProvider.js';
import dotenv from 'dotenv';

dotenv.config();

// Sample data arrays
const firstNames = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'David', 'Elizabeth',
  'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Christopher', 'Karen',
  'Charles', 'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Betty', 'Anthony', 'Helen', 'Mark', 'Sandra',
  'Donald', 'Donna', 'Steven', 'Carol', 'Paul', 'Ruth', 'Andrew', 'Sharon', 'Joshua', 'Michelle',
  'Kenneth', 'Laura', 'Kevin', 'Sarah', 'Brian', 'Kimberly', 'George', 'Deborah', 'Edward', 'Dorothy',
  'Ronald', 'Amy', 'Timothy', 'Angela', 'Jason', 'Ashley', 'Jeffrey', 'Brenda', 'Ryan', 'Emma',
  'Jacob', 'Olivia', 'Gary', 'Cynthia', 'Nicholas', 'Marie', 'Eric', 'Janet', 'Jonathan', 'Catherine',
  'Stephen', 'Frances', 'Larry', 'Christine', 'Justin', 'Samantha', 'Scott', 'Debra', 'Brandon', 'Rachel',
  'Benjamin', 'Carolyn', 'Samuel', 'Janet', 'Gregory', 'Virginia', 'Alexander', 'Maria', 'Patrick', 'Heather',
  'Frank', 'Diane', 'Raymond', 'Julie', 'Jack', 'Joyce', 'Dennis', 'Victoria', 'Jerry', 'Kelly'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts',
  'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker', 'Cruz', 'Edwards', 'Collins', 'Reyes',
  'Stewart', 'Morris', 'Morales', 'Murphy', 'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper',
  'Peterson', 'Bailey', 'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim', 'Cox', 'Ward', 'Richardson',
  'Watson', 'Brooks', 'Chavez', 'Wood', 'James', 'Bennett', 'Gray', 'Mendoza', 'Ruiz', 'Hughes',
  'Price', 'Alvarez', 'Castillo', 'Sanders', 'Patel', 'Myers', 'Long', 'Ross', 'Foster', 'Jimenez'
];

const specialties = [
  'Cardiology', 'Dermatology', 'Emergency Medicine', 'Endocrinology', 'Family Medicine',
  'Gastroenterology', 'General Surgery', 'Gynecology', 'Hematology', 'Infectious Disease',
  'Internal Medicine', 'Neurology', 'Neurosurgery', 'Obstetrics', 'Oncology',
  'Ophthalmology', 'Orthopedics', 'Otolaryngology', 'Pediatrics', 'Psychiatry',
  'Pulmonology', 'Radiology', 'Rheumatology', 'Urology'
];

const hospitals = [
  'Mayo Clinic', 'Cleveland Clinic', 'Johns Hopkins Hospital', 'UCLA Medical Center', 
  'Mount Sinai Hospital', 'Cedars-Sinai Medical Center', 'Massachusetts General Hospital',
  'NewYork-Presbyterian Hospital', 'UCSF Medical Center', 'Stanford Health Care',
  'Houston Methodist Hospital', 'Brigham and Women\'s Hospital', 'Duke University Hospital',
  'Northwestern Memorial Hospital', 'Barnes-Jewish Hospital', 'Rush University Medical Center',
  'Vanderbilt University Medical Center', 'University of Michigan Hospitals', 'Yale New Haven Hospital',
  'Jefferson Health', 'Penn Medicine', 'Kaiser Permanente', 'Scripps Health', 'Sutter Health',
  'HCA Healthcare', 'Intermountain Healthcare', 'Adventist Health', 'Dignity Health'
];

const states = [
  'CA', 'NY', 'FL', 'TX', 'PA', 'IL', 'OH', 'GA', 'NC', 'MI',
  'NJ', 'VA', 'WA', 'AZ', 'MA', 'TN', 'IN', 'MO', 'MD', 'WI',
  'CO', 'MN', 'SC', 'AL', 'LA', 'KY', 'OR', 'OK', 'CT', 'IA'
];

const cities = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio',
  'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus',
  'Charlotte', 'San Francisco', 'Indianapolis', 'Seattle', 'Denver', 'Washington',
  'Boston', 'El Paso', 'Nashville', 'Detroit', 'Oklahoma City', 'Portland', 'Las Vegas',
  'Memphis', 'Louisville', 'Baltimore', 'Milwaukee', 'Albuquerque', 'Tucson', 'Fresno',
  'Sacramento', 'Mesa', 'Kansas City', 'Atlanta', 'Long Beach', 'Colorado Springs'
];

const insuranceProviders = [
  'Aetna', 'Blue Cross Blue Shield', 'Cigna', 'UnitedHealthcare', 'Humana',
  'Kaiser Permanente', 'Anthem', 'Molina Healthcare', 'Centene Corporation',
  'WellCare', 'Medicare', 'Medicaid'
];

const languages = [
  { language: 'English', proficiency: 'native' },
  { language: 'Spanish', proficiency: 'fluent' },
  { language: 'French', proficiency: 'conversational' },
  { language: 'German', proficiency: 'basic' },
  { language: 'Italian', proficiency: 'conversational' },
  { language: 'Portuguese', proficiency: 'fluent' },
  { language: 'Mandarin', proficiency: 'basic' },
  { language: 'Hindi', proficiency: 'conversational' },
  { language: 'Arabic', proficiency: 'fluent' },
  { language: 'Japanese', proficiency: 'basic' }
];

const careProviderTypes = [
  'nurse', 'nursing_assistant', 'home_health_aide', 'physical_therapist',
  'occupational_therapist', 'speech_therapist', 'respiratory_therapist',
  'social_worker', 'case_manager', 'pharmacist', 'nutritionist',
  'mental_health_counselor', 'family_caregiver', 'professional_caregiver',
  'volunteer', 'other'
];

const careServices = [
  'medication_management', 'wound_care', 'vital_signs_monitoring',
  'mobility_assistance', 'personal_care', 'meal_preparation', 'transportation',
  'companionship', 'physical_therapy', 'occupational_therapy', 'speech_therapy',
  'respiratory_care', 'pain_management', 'chronic_disease_management',
  'mental_health_support', 'family_support', 'care_coordination',
  'medication_administration', 'injection_services', 'iv_therapy',
  'catheter_care', 'ostomy_care', 'diabetes_management'
];

const workSchedules = [
  'day_shift', 'night_shift', 'evening_shift', 'rotating', 'weekends', 'on_call', 'flexible'
];

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

// Generate random data helpers
function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

function generatePhoneNumber() {
  const area = randomInt(200, 999);
  const exchange = randomInt(200, 999);
  const number = randomInt(1000, 9999);
  return `(${area}) ${exchange}-${number}`;
}

function generateEmail(firstName, lastName) {
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'email.com'];
  const domain = randomChoice(domains);
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;
}

function generateAddress() {
  const streetNumber = randomInt(100, 9999);
  const streetNames = ['Main St', 'Oak Ave', 'Park Dr', 'First St', 'Second St', 'Third Ave', 'Cedar Ln', 'Elm St', 'Maple Ave', 'Washington St'];
  const streetName = randomChoice(streetNames);
  const city = randomChoice(cities);
  const state = randomChoice(states);
  const zipCode = randomInt(10000, 99999);
  
  return {
    street: `${streetNumber} ${streetName}`,
    city: city,
    state: state,
    zipCode: zipCode.toString(),
    country: 'USA'
  };
}

function generateMedicalLicenseNumber() {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
}

function generateNPINumber() {
  return randomInt(1000000000, 9999999999).toString();
}

function generateProfilePictureUrl(firstName, lastName) {
  // Use various avatar services for different looking profiles
  const services = [
    `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random&size=300`,
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${lastName}`,
    `https://api.dicebear.com/7.x/personas/svg?seed=${firstName}${lastName}`,
    `https://api.dicebear.com/7.x/lorelei/svg?seed=${firstName}${lastName}`,
    `https://robohash.org/${firstName}${lastName}?set=set4&size=300x300`
  ];
  return randomChoice(services);
}

async function generateSampleDoctors() {
  console.log('🏥 Generating 100 sample doctors...');
  
  const doctors = [];
  const users = [];
  
  for (let i = 0; i < 100; i++) {
    const firstName = randomChoice(firstNames);
    const lastName = randomChoice(lastNames);
    const email = generateEmail(firstName, lastName);
    const phone = generatePhoneNumber();
    const address = generateAddress();
    
    // Create user first
    const hashedPassword = await bcryptjs.hash('doctor123', 12);
    
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      address,
      userType: 'doctor',
      dateOfBirth: new Date(randomInt(1960, 1985), randomInt(0, 11), randomInt(1, 28)),
      profilePicture: generateProfilePictureUrl(firstName, lastName),
      bio: `Experienced ${randomChoice(specialties)} specialist with ${randomInt(5, 25)} years of practice.`,
      isActive: true,
      emailVerified: true,
      phoneVerified: true
    });
    
    users.push(user);
    
    // Create doctor profile
    const primarySpecialty = randomChoice(specialties);
    const yearsOfExperience = randomInt(5, 30);
    const graduationYear = new Date().getFullYear() - yearsOfExperience - randomInt(4, 8);
    
    const doctor = new Doctor({
      userId: user._id,
      medicalLicenseNumber: generateMedicalLicenseNumber(),
      licenseState: randomChoice(states),
      licenseExpiryDate: new Date(2025, randomInt(0, 11), randomInt(1, 28)),
      primarySpecialty,
      secondarySpecialties: Math.random() > 0.7 ? [randomChoice(specialties.filter(s => s !== primarySpecialty))] : [],
      subspecialties: Math.random() > 0.8 ? [`${primarySpecialty} Subspecialty`] : [],
      yearsOfExperience,
      npiNumber: generateNPINumber(),
      
      // Education
      education: [{
        institution: `${randomChoice(['Harvard', 'Stanford', 'Yale', 'Johns Hopkins', 'UCLA', 'UCSF', 'Mayo Clinic', 'Mount Sinai'])} Medical School`,
        degree: randomChoice(['MD', 'DO']),
        fieldOfStudy: 'Medicine',
        graduationYear,
        honors: Math.random() > 0.6 ? randomChoice(['Cum Laude', 'Magna Cum Laude', 'Summa Cum Laude', 'Dean\'s List']) : undefined
      }],
      
      // Residency
      residency: [{
        hospital: randomChoice(hospitals),
        specialty: primarySpecialty,
        startYear: graduationYear + 1,
        endYear: graduationYear + randomInt(3, 5),
        location: {
          city: randomChoice(cities),
          state: randomChoice(states),
          country: 'USA'
        }
      }],
      
      // Fellowship (30% chance)
      fellowship: Math.random() > 0.7 ? [{
        hospital: randomChoice(hospitals),
        specialty: `${primarySpecialty} Fellowship`,
        startYear: graduationYear + randomInt(4, 6),
        endYear: graduationYear + randomInt(5, 7),
        location: {
          city: randomChoice(cities),
          state: randomChoice(states),
          country: 'USA'
        }
      }] : [],
      
      // Hospital affiliations
      hospitalAffiliations: [{
        hospital: randomChoice(hospitals),
        position: randomChoice(['Attending Physician', 'Senior Physician', 'Medical Director', 'Chief of Staff']),
        department: primarySpecialty,
        startDate: new Date(randomInt(2010, 2020), randomInt(0, 11), randomInt(1, 28)),
        isCurrentlyAffiliated: true,
        privileges: ['Surgery', 'Consultation', 'Emergency Care']
      }],
      
      // Languages
      languagesSpoken: [
        languages[0], // English
        ...(Math.random() > 0.6 ? [randomChoice(languages.slice(1))] : [])
      ],
      
      // Financial
      consultationFee: randomInt(150, 500),
      acceptsInsurance: true,
      insurancesAccepted: [
        randomChoice(insuranceProviders),
        randomChoice(insuranceProviders),
        randomChoice(insuranceProviders)
      ],
      
      // Ratings
      averageRating: parseFloat(randomFloat(3.5, 5.0).toFixed(1)),
      totalReviews: randomInt(10, 200),
      
      // Status
      isVerified: true,
      verificationDate: new Date(randomInt(2020, 2024), randomInt(0, 11), randomInt(1, 28)),
      status: 'approved',
      isAcceptingNewPatients: Math.random() > 0.2,
      
      // Telemedicine
      telemedicineEnabled: Math.random() > 0.4,
      telemedicinePlatforms: Math.random() > 0.4 ? [randomChoice(['zoom', 'teams', 'webex'])] : [],
      
      // Board certifications
      boardCertifications: [{
        board: `American Board of ${primarySpecialty}`,
        specialty: primarySpecialty,
        certificationDate: new Date(graduationYear + randomInt(4, 8), randomInt(0, 11), randomInt(1, 28)),
        expiryDate: new Date(2030, randomInt(0, 11), randomInt(1, 28)),
        status: 'active'
      }]
    });
    
    doctors.push(doctor);
    
    if ((i + 1) % 10 === 0) {
      console.log(`✅ Generated ${i + 1} doctors...`);
    }
  }
  
  return { users, doctors };
}

async function generateSamplePatients() {
  console.log('👥 Generating 100 sample patients...');
  
  const patients = [];
  const users = [];
  
  for (let i = 0; i < 100; i++) {
    const firstName = randomChoice(firstNames);
    const lastName = randomChoice(lastNames);
    const email = generateEmail(firstName, lastName);
    const phone = generatePhoneNumber();
    const address = generateAddress();
    
    const hashedPassword = await bcryptjs.hash('patient123', 12);
    
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      address,
      userType: 'patient',
      dateOfBirth: new Date(randomInt(1940, 2010), randomInt(0, 11), randomInt(1, 28)),
      profilePicture: generateProfilePictureUrl(firstName, lastName),
      bio: `Patient seeking quality healthcare.`,
      isActive: true,
      emailVerified: true,
      phoneVerified: true
    });
    
    users.push(user);
    
    const patient = new Patient({
      userId: user._id,
      emergencyContact: {
        name: `${randomChoice(firstNames)} ${randomChoice(lastNames)}`,
        relationship: randomChoice(['spouse', 'parent', 'sibling', 'child', 'friend']),
        phone: generatePhoneNumber(),
        email: generateEmail(randomChoice(firstNames), randomChoice(lastNames))
      },
      medicalHistory: {
        allergies: Math.random() > 0.7 ? [
          { allergen: 'Penicillin', severity: 'moderate' },
          { allergen: 'Peanuts', severity: 'severe' }
        ] : [],
        chronicConditions: Math.random() > 0.6 ? [randomChoice(['Diabetes', 'Hypertension', 'Asthma', 'Arthritis'])] : [],
        currentMedications: Math.random() > 0.5 ? [
          { name: 'Lisinopril', dosage: '10mg', frequency: 'daily' }
        ] : []
      },
      insurance: {
        provider: randomChoice(insuranceProviders),
        policyNumber: Math.random().toString(36).substr(2, 12).toUpperCase(),
        groupNumber: Math.random().toString(36).substr(2, 8).toUpperCase()
      }
    });
    
    patients.push(patient);
  }
  
  return { users, patients };
}

async function generateSampleCareProviders() {
  console.log('👨‍⚕️ Generating 100 sample care providers...');
  
  const careProviders = [];
  const users = [];
  
  for (let i = 0; i < 100; i++) {
    const firstName = randomChoice(firstNames);
    const lastName = randomChoice(lastNames);
    const email = generateEmail(firstName, lastName);
    const phone = generatePhoneNumber();
    const address = generateAddress();
    
    const hashedPassword = await bcryptjs.hash('careprovider123', 12);
    
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      address,
      userType: 'careprovider',
      dateOfBirth: new Date(randomInt(1970, 2000), randomInt(0, 11), randomInt(1, 28)),
      profilePicture: generateProfilePictureUrl(firstName, lastName),
      bio: `Experienced care provider specializing in ${randomChoice(careServices).replace('_', ' ')}.`,
      isActive: true,
      isEmailVerified: true
    });
    
    users.push(user);
    
    // Create care provider profile
    const providerType = randomChoice(careProviderTypes);
    const yearsOfExperience = randomInt(1, 20);
    const services = [];
    
    // Add 2-5 random services
    const numServices = randomInt(2, 5);
    const shuffledServices = [...careServices].sort(() => 0.5 - Math.random());
    for (let j = 0; j < numServices; j++) {
      services.push(shuffledServices[j]);
    }
    
    // Select random available days (3-6 days)
    const numDays = randomInt(3, 6);
    const availableDays = [];
    const shuffledDays = [...days].sort(() => 0.5 - Math.random());
    for (let j = 0; j < numDays; j++) {
      availableDays.push(shuffledDays[j]);
    }
    
    const careProvider = new CareProvider({
      userId: user._id,
      providerType,
      
      // Credentials (for professional caregivers)
      credentials: {
        isLicensed: !['family_caregiver', 'volunteer'].includes(providerType),
        licenseNumber: !['family_caregiver', 'volunteer'].includes(providerType) 
          ? Math.random().toString(36).substr(2, 10).toUpperCase() 
          : undefined,
        licenseState: !['family_caregiver', 'volunteer'].includes(providerType) 
          ? randomChoice(states) 
          : undefined,
        licenseExpiryDate: !['family_caregiver', 'volunteer'].includes(providerType)
          ? new Date(randomInt(2025, 2027), randomInt(0, 11), randomInt(1, 28))
          : undefined,
        licenseType: !['family_caregiver', 'volunteer'].includes(providerType)
          ? randomChoice(['RN', 'LPN', 'CNA', 'PTA', 'OTA', 'SLP', 'RRT', 'LSW', 'LCSW', 'Other'])
          : undefined,
        certifications: Math.random() > 0.6 ? [{
          name: `${providerType.replace('_', ' ')} Certification`,
          issuingOrganization: randomChoice(['American Nurses Association', 'National Association', 'State Board', 'Professional Council']),
          certificationDate: new Date(randomInt(2018, 2023), randomInt(0, 11), randomInt(1, 28)),
          expiryDate: new Date(randomInt(2025, 2028), randomInt(0, 11), randomInt(1, 28)),
          status: 'active'
        }] : []
      },
      
      // Education
      education: Math.random() > 0.3 ? [{
        institution: `${randomChoice(['Metro', 'City', 'State', 'Community', 'Regional'])} ${randomChoice(['College', 'University', 'Institute'])}`,
        program: `${providerType.replace('_', ' ')} Program`,
        degree: randomChoice(['Certificate', 'Associates', 'Bachelors', 'Masters']),
        graduationYear: randomInt(2010, 2023),
        gpa: Math.random() > 0.5 ? parseFloat((3.0 + Math.random() * 1.0).toFixed(2)) : undefined
      }] : [],
      
      // Experience
      experience: {
        yearsOfExperience,
        specializations: Math.random() > 0.7 ? [services[0].replace('_', ' ')] : [],
        settings: [
          randomChoice(['hospital', 'clinic', 'home_health', 'nursing_home', 'assisted_living', 'rehabilitation_center'])
        ],
        populations: [
          randomChoice(['pediatric', 'adult', 'geriatric', 'chronic_conditions', 'acute_care'])
        ]
      },
      
      // Employment
      employment: {
        status: randomChoice(['employed', 'self_employed', 'contract']),
        employer: Math.random() > 0.4 ? randomChoice(hospitals) : undefined,
        position: `${providerType.replace('_', ' ')}`,
        employmentType: randomChoice(['full_time', 'part_time', 'per_diem', 'contract']),
        startDate: new Date(randomInt(2020, 2024), randomInt(0, 11), randomInt(1, 28)),
        isCurrentPosition: true
      },
      
      // Availability
      availability: {
        workSchedule: randomChoice(workSchedules),
        hoursPerWeek: randomInt(20, 40),
        availableDays,
        timeSlots: availableDays.map(day => ({
          day,
          startTime: randomChoice(['08:00', '09:00', '10:00']),
          endTime: randomChoice(['16:00', '17:00', '18:00'])
        })),
        isAvailableForEmergency: Math.random() > 0.7
      },
      
      // Services
      services,
      
      // Skills
      skills: {
        clinicalSkills: services.slice(0, 3).map(skill => ({
          skill: skill.replace('_', ' '),
          proficiencyLevel: randomChoice(['intermediate', 'advanced', 'expert']),
          lastAssessed: new Date(randomInt(2022, 2024), randomInt(0, 11), randomInt(1, 28))
        })),
        languages: [
          languages[0], // English
          ...(Math.random() > 0.6 ? [randomChoice(languages.slice(1))] : [])
        ],
        specialTraining: Math.random() > 0.5 ? [{
          training: `${services[0].replace('_', ' ')} Training`,
          completionDate: new Date(randomInt(2022, 2024), randomInt(0, 11), randomInt(1, 28)),
          expiryDate: new Date(randomInt(2025, 2027), randomInt(0, 11), randomInt(1, 28)),
          isActive: true
        }] : []
      },
      
      // Background
      background: {
        backgroundCheckDate: new Date(randomInt(2023, 2024), randomInt(0, 11), randomInt(1, 28)),
        backgroundCheckStatus: randomChoice(['cleared', 'cleared', 'cleared', 'pending']), // Bias towards cleared
        hasDriversLicense: Math.random() > 0.2,
        hasVehicle: Math.random() > 0.3,
        hasInsurance: Math.random() > 0.1,
        emergencyContact: {
          name: `${randomChoice(firstNames)} ${randomChoice(lastNames)}`,
          relationship: randomChoice(['spouse', 'parent', 'sibling', 'friend']),
          phone: generatePhoneNumber(),
          email: generateEmail(randomChoice(firstNames), randomChoice(lastNames))
        }
      },
      
      // Ratings
      ratings: {
        averageRating: parseFloat(randomFloat(3.5, 5.0).toFixed(1)),
        totalReviews: randomInt(0, 50),
        categories: {
          professionalism: parseFloat(randomFloat(3.5, 5.0).toFixed(1)),
          reliability: parseFloat(randomFloat(3.5, 5.0).toFixed(1)),
          communication: parseFloat(randomFloat(3.5, 5.0).toFixed(1)),
          careQuality: parseFloat(randomFloat(3.5, 5.0).toFixed(1))
        }
      },
      
      // Verification
      verification: {
        isVerified: Math.random() > 0.15, // 85% verified
        verificationDate: new Date(randomInt(2023, 2024), randomInt(0, 11), randomInt(1, 28)),
        verifiedBy: 'System Admin',
        verificationDocuments: !['family_caregiver', 'volunteer'].includes(providerType) ? [{
          documentType: 'license',
          fileName: 'license.pdf',
          filePath: '/documents/licenses/license.pdf',
          uploadDate: new Date(randomInt(2023, 2024), randomInt(0, 11), randomInt(1, 28)),
          verified: true
        }] : [],
        references: Math.random() > 0.5 ? [{
          name: `${randomChoice(firstNames)} ${randomChoice(lastNames)}`,
          relationship: 'Supervisor',
          organization: randomChoice(hospitals),
          phone: generatePhoneNumber(),
          email: generateEmail(randomChoice(firstNames), randomChoice(lastNames)),
          yearsKnown: randomInt(1, 5),
          contactDate: new Date(randomInt(2023, 2024), randomInt(0, 11), randomInt(1, 28)),
          status: 'verified'
        }] : []
      },
      
      // Preferences
      preferences: {
        workRadius: randomInt(10, 50), // miles
        hourlyRate: {
          min: randomInt(15, 25),
          max: randomInt(30, 50),
          currency: 'USD'
        },
        paymentMethods: [
          randomChoice(['cash', 'check', 'direct_deposit', 'paypal']),
          randomChoice(['cash', 'check', 'direct_deposit', 'paypal'])
        ],
        communicationPreference: randomChoice(['email', 'phone', 'text']),
        acceptsNewClients: Math.random() > 0.25, // 75% accepting new clients
        clientPreferences: {
          ageGroups: [
            randomChoice(['children', 'adults', 'seniors'])
          ],
          conditionsComfortable: services.slice(0, 2).map(s => s.replace('_', ' ')),
          servicesWillingToProvide: services
        }
      },
      
      // Status
      status: Math.random() > 0.1 ? 'approved' : 'pending', // 90% approved
      lastActiveDate: new Date(randomInt(2024, 2024), randomInt(0, 11), randomInt(1, 28))
    });
    
    careProviders.push(careProvider);
    
    if ((i + 1) % 10 === 0) {
      console.log(`✅ Generated ${i + 1} care providers...`);
    }
  }
  
  return { users, careProviders };
}

async function generateAppointments(doctors, patients) {
  console.log('📅 Generating sample appointments...');
  
  // Create Appointment schema if it doesn't exist
  const appointmentSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    appointmentDate: { type: Date, required: true },
    appointmentTime: { type: String, required: true },
    duration: { type: Number, default: 30 }, // in minutes
    type: { 
      type: String, 
      enum: ['consultation', 'follow-up', 'checkup', 'procedure', 'telemedicine'],
      default: 'consultation'
    },
    status: {
      type: String,
      enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'],
      default: 'scheduled'
    },
    reason: String,
    notes: String,
    consultationFee: Number,
    isTelemedicine: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });
  
  const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);
  
  const appointments = [];
  const appointmentTypes = ['consultation', 'follow-up', 'checkup', 'procedure', 'telemedicine'];
  const appointmentStatuses = ['scheduled', 'confirmed', 'completed'];
  const timeSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];
  const reasons = [
    'Annual checkup', 'Follow-up visit', 'New patient consultation', 'Medication review',
    'Symptom evaluation', 'Preventive care', 'Specialist referral', 'Lab results review',
    'Treatment planning', 'Second opinion', 'Routine screening', 'Health assessment'
  ];
  
  // Generate appointments for each doctor
  for (const doctor of doctors) {
    const numAppointments = randomInt(5, 20);
    
    for (let i = 0; i < numAppointments; i++) {
      const patient = randomChoice(patients);
      const appointmentDate = new Date();
      appointmentDate.setDate(appointmentDate.getDate() + randomInt(-30, 60)); // Past 30 days to next 60 days
      
      const appointment = new Appointment({
        patientId: patient._id,
        doctorId: doctor._id,
        appointmentDate,
        appointmentTime: randomChoice(timeSlots),
        duration: randomChoice([30, 45, 60]),
        type: randomChoice(appointmentTypes),
        status: randomChoice(appointmentStatuses),
        reason: randomChoice(reasons),
        notes: Math.random() > 0.7 ? 'Patient reported improvement in symptoms' : '',
        consultationFee: doctor.consultationFee,
        isTelemedicine: Math.random() > 0.7 && doctor.telemedicineEnabled
      });
      
      appointments.push(appointment);
    }
  }
  
  return appointments;
}

async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthcare-db');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function clearExistingData() {
  console.log('🗑️  Clearing existing sample data...');
  
  // Clear existing doctors, patients, care providers, and their users
  await Doctor.deleteMany({});
  await Patient.deleteMany({});
  await CareProvider.deleteMany({});
  await User.deleteMany({ userType: { $in: ['doctor', 'patient', 'careprovider'] } });
  
  // Clear appointments if the model exists
  if (mongoose.models.Appointment) {
    await mongoose.models.Appointment.deleteMany({});
  }
  
  console.log('✅ Existing data cleared');
}

async function saveData(users, doctors, patients, careProviders, appointments) {
  console.log('💾 Saving data to database...');
  
  // Save users first
  await User.insertMany(users);
  console.log('✅ Users saved');
  
  // Save doctors, patients, and care providers
  await Doctor.insertMany(doctors);
  console.log('✅ Doctors saved');
  
  await Patient.insertMany(patients);
  console.log('✅ Patients saved');
  
  await CareProvider.insertMany(careProviders);
  console.log('✅ Care providers saved');
  
  // Save appointments
  if (mongoose.models.Appointment) {
    await mongoose.models.Appointment.insertMany(appointments);
    console.log('✅ Appointments saved');
  }
}

async function generateAllSampleData() {
  try {
    await connectToDatabase();
    await clearExistingData();
    
    const { users: doctorUsers, doctors } = await generateSampleDoctors();
    const { users: patientUsers, patients } = await generateSamplePatients();
    const { users: careProviderUsers, careProviders } = await generateSampleCareProviders();
    
    const allUsers = [...doctorUsers, ...patientUsers, ...careProviderUsers];
    const appointments = await generateAppointments(doctors, patients);
    
    await saveData(allUsers, doctors, patients, careProviders, appointments);
    
    console.log('🎉 Sample data generation completed successfully!');
    console.log(`📊 Generated:`);
    console.log(`   👨‍⚕️ ${doctors.length} doctors`);
    console.log(`   👥 ${patients.length} patients`);
    console.log(`   👨‍⚕️ ${careProviders.length} care providers`);
    console.log(`   📅 ${appointments.length} appointments`);
    
  } catch (error) {
    console.error('❌ Error generating sample data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

export default generateAllSampleData;

// Run if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  generateAllSampleData();
}