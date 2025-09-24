import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const checkAllCollections = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ Connected to database: ${conn.connection.name}`);
    
    const collections = await conn.connection.db.listCollections().toArray();
    
    for (let collection of collections) {
      console.log(`\n📁 Collection: ${collection.name}`);
      const count = await conn.connection.db.collection(collection.name).countDocuments();
      console.log(`   Documents: ${count}`);
      
      if (count > 0) {
        // Get a sample document
        const sample = await conn.connection.db.collection(collection.name).findOne();
        console.log('   Sample document keys:', Object.keys(sample));
        if (sample.firstName || sample.name || sample.title) {
          console.log(`   Sample: ${sample.firstName || sample.name || sample.title} ${sample.lastName || ''}`);
        }
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkAllCollections();