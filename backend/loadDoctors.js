import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Load environment variables
dotenv.config();

// Import models
import User from './models/User.js';
import Doctor from './models/Doctor.js';
import Slot from './models/Slot.js';

// Sample doctors data with valid phone numbers
const doctors = [
  {
    firstName: "Sarah",
    lastName: "Johnson", 
    email: "sarah.johnson@healthcenter.com",
    password: "doctor123",
    phone: "+15551234567",
    specialty: "Cardiology",
    experience: 15,
    bio: "Board-certified cardiologist with 15 years of experience."
  },
  {
    firstName: "Michael",
    lastName: "Chen",
    email: "michael.chen@medcenter.com", 
    password: "doctor123",
    phone: "+15552345678",
    specialty: "Pediatrics",
    experience: 18,
    bio: "Pediatric surgeon specializing in minimally invasive procedures."
  },
  {
    firstName: "Emily",
    lastName: "Rodriguez",
    email: "emily.rodriguez@familymed.com",
    password: "doctor123", 
    phone: "+15553456789",
    specialty: "Family Medicine",
    experience: 12,
    bio: "Family medicine physician committed to comprehensive primary care."
  }
];

// Helper function to create slots for doctors
async function createSlotsForDoctor(doctorUserId) {
  console.log(`📅 Creating slots for doctor...`);
  
  const slots = [];
  const today = new Date();
  
  // Create slots for next 14 days
  for (let i = 1; i <= 14; i++) {
    const slotDate = new Date(today);
    slotDate.setDate(today.getDate() + i);
    
    // Skip weekends
    if (slotDate.getDay() === 0 || slotDate.getDay() === 6) continue;
    
    // Create 2 slots per day (10 AM, 2 PM)
    const timeSlots = ['10:00', '14:00'];
    
    for (const time of timeSlots) {
      const [hours, minutes] = time.split(':');
      const slotDateTime = new Date(slotDate);
      slotDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      const slot = new Slot({
        doctorId: doctorUserId,
        dateTime: slotDateTime,
        duration: 30,
        consultationType: 'in-person',
        consultationFee: 200,
        isAvailable: true,
        isBooked: false
      });
      
      slots.push(slot);
    }
  }
  
  try {
    await Slot.insertMany(slots);
    console.log(`✅ Created ${slots.length} slots`);
  } catch (error) {
    console.error(`❌ Error creating slots:`, error.message);
  }
}

async function loadDoctors() {
  try {
    console.log('🚀 Loading sample doctors...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Doctor.deleteMany({}),
      Slot.deleteMany({})
    ]);
    console.log('✅ Cleared existing data\n');
    
    // Create doctors
    console.log('👨‍⚕️ Creating doctors...');
    const createdDoctors = [];
    
    for (const doctorData of doctors) {
      try {
        // Hash password
        const hashedPassword = await bcrypt.hash(doctorData.password, 12);
        
        // Create User
        const user = new User({
          firstName: doctorData.firstName,
          lastName: doctorData.lastName,
          email: doctorData.email,
          password: hashedPassword,
          userType: 'doctor',
          phone: doctorData.phone,
          dateOfBirth: new Date('1980-01-01'),
          gender: 'female',
          address: {
            street: '123 Medical Center Dr',
            city: 'Phoenix', 
            state: 'AZ',
            zipCode: '85001',
            country: 'USA'
          },
          bio: doctorData.bio,
          isEmailVerified: true,
          isActive: true
        });
        
        await user.save();
        
        // Create Doctor profile
        const doctor = new Doctor({
          userId: user._id,
          medicalLicenseNumber: `MD${Math.floor(Math.random() * 900000) + 100000}`,
          licenseState: 'AZ',
          licenseExpiryDate: new Date('2026-12-31'),
          primarySpecialty: doctorData.specialty,
          yearsOfExperience: doctorData.experience,
          languages: ['English'],
          consultationFee: 200,
          acceptsInsurance: true,
          insurancesAccepted: ['Blue Cross Blue Shield', 'Aetna', 'UnitedHealthcare'],
          isVerified: true,
          status: 'approved',
          isAcceptingNewPatients: true,
          telemedicineEnabled: true,
          averageRating: 4.5,
          totalReviews: 25
        });
        
        await doctor.save();
        
        console.log(`✅ Created: Dr. ${user.firstName} ${user.lastName} (${doctor.primarySpecialty})`);
        
        // Create slots
        await createSlotsForDoctor(user._id);
        
        // Generate token for easy testing
        const token = jwt.sign(
          { 
            userId: user._id,
            userType: 'doctor',
            email: user.email
          },
          process.env.JWT_SECRET,
          { expiresIn: '30d' }
        );
        
        createdDoctors.push({
          user,
          doctor, 
          token
        });
        
      } catch (error) {
        console.error(`❌ Error creating doctor ${doctorData.firstName}:`, error.message);
      }
    }
    
    console.log('\n📊 Loading complete!');
    console.log(`Created ${createdDoctors.length} doctors with slots\n`);
    
    console.log('🔑 Login Credentials:\n');
    createdDoctors.forEach((doc, index) => {
      console.log(`${index + 1}. Dr. ${doc.user.firstName} ${doc.user.lastName}`);
      console.log(`   📧 Email: ${doc.user.email}`);
      console.log(`   🔐 Password: doctor123`);
      console.log(`   🏥 Specialty: ${doc.doctor.primarySpecialty}`);
      console.log(`   🎫 Token: ${doc.token}`);
      console.log('');
    });
    
    console.log('✅ Ready to test! Use any of the above credentials to login.');
    
  } catch (error) {
    console.error('❌ Error loading doctors:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

loadDoctors();