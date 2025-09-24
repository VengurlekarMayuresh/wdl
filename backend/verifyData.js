import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    console.log('MongoDB URI:', process.env.MONGODB_URI);
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthcare-management');
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database Name: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

// Check what's in the database
const verifyData = async () => {
  try {
    console.log('🔍 Checking database contents...');
    console.log('=' .repeat(50));
    
    const conn = await connectDB();
    
    // Get all collections
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('📁 Available Collections:');
    collections.forEach(collection => {
      console.log(`  - ${collection.name}`);
    });
    console.log('');
    
    // Check User collection
    const totalUsers = await User.countDocuments({});
    console.log(`👥 Total Users in database: ${totalUsers}`);
    
    if (totalUsers > 0) {
      const doctors = await User.find({ userType: 'doctor' }).select('firstName lastName email userType');
      const patients = await User.find({ userType: 'patient' }).select('firstName lastName email userType');
      const careProviders = await User.find({ userType: 'careprovider' }).select('firstName lastName email userType');
      
      console.log(`\n📋 Doctors (${doctors.length}):`);
      doctors.forEach(doc => {
        console.log(`  - ${doc.firstName} ${doc.lastName} (${doc.email})`);
      });
      
      console.log(`\n🏥 Patients (${patients.length}):`);
      patients.forEach(patient => {
        console.log(`  - ${patient.firstName} ${patient.lastName} (${patient.email})`);
      });
      
      console.log(`\n👩‍⚕️ Care Providers (${careProviders.length}):`);
      careProviders.forEach(cp => {
        console.log(`  - ${cp.firstName} ${cp.lastName} (${cp.email})`);
      });
      
      console.log(`\n🔍 Sample user data:`);
      const sampleUser = await User.findOne({}).select('-password');
      console.log(JSON.stringify(sampleUser, null, 2));
      
    } else {
      console.log('❌ No users found in database!');
      
      // Check if there are any documents at all
      const allDocs = await User.find({});
      console.log('Raw query result:', allDocs.length);
      
      // Check all collections for any data
      for (let collection of collections) {
        const count = await conn.connection.db.collection(collection.name).countDocuments();
        console.log(`Collection "${collection.name}": ${count} documents`);
      }
    }
    
    console.log('=' .repeat(50));
    process.exit(0);
  } catch (error) {
    console.error('❌ Error verifying data:', error);
    process.exit(1);
  }
};

verifyData();