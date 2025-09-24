import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const connectDatabase = async () => {
  try {
    // Set mongoose options
    const options = {
      // Connection pool settings
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
      
      // Buffer settings (for newer Mongoose versions)
      bufferCommands: false, // Disable mongoose buffering
    };

    // Connect to MongoDB
    const connection = await mongoose.connect(process.env.MONGODB_URI, options);
    
    console.log(`✅ MongoDB Connected: ${connection.connection.host}`);
    console.log(`📊 Database: ${connection.connection.name}`);
    
    // Connection events
    mongoose.connection.on('connected', () => {
      console.log('🔗 Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('🔌 Mongoose disconnected from MongoDB');
    });

    // Handle application termination
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('🔒 MongoDB connection closed through app termination');
        process.exit(0);
      } catch (error) {
        console.error('Error closing MongoDB connection:', error);
        process.exit(1);
      }
    });

    return connection;
    
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    
    // Provide more specific error messages
    if (error.name === 'MongoServerError') {
      if (error.code === 18) {
        console.error('Authentication failed. Please check your MongoDB credentials.');
      } else if (error.code === 8000) {
        console.error('SSL/TLS connection failed.');
      }
    } else if (error.name === 'MongoNetworkError') {
      console.error('Network error. Please check if MongoDB is running and accessible.');
    } else if (error.name === 'MongooseError') {
      console.error('Mongoose configuration error. Please check your connection string.');
    }
    
    // Exit process with failure
    process.exit(1);
  }
};

// Check database connection status
const checkDatabaseConnection = () => {
  const state = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  return {
    state: states[state] || 'unknown',
    isConnected: state === 1
  };
};

// Get database statistics
const getDatabaseStats = async () => {
  try {
    if (!checkDatabaseConnection().isConnected) {
      throw new Error('Database not connected');
    }
    
    const admin = mongoose.connection.db.admin();
    const stats = await admin.serverStatus();
    
    return {
      version: stats.version,
      uptime: stats.uptime,
      connections: stats.connections,
      memory: stats.mem,
      network: stats.network
    };
  } catch (error) {
    console.error('Error getting database stats:', error.message);
    return null;
  }
};

// Create database indexes (run once on startup)
const createIndexes = async () => {
  try {
    console.log('🔍 Creating database indexes...');
    
    // Create indexes for User model
    await mongoose.connection.collection('users').createIndex(
      { email: 1, userType: 1 }, 
      { background: true }
    );
    
    await mongoose.connection.collection('users').createIndex(
      { createdAt: -1 }, 
      { background: true }
    );
    
    // Create indexes for Doctor model
    await mongoose.connection.collection('doctors').createIndex(
      { medicalLicenseNumber: 1 }, 
      { background: true, unique: true }
    );
    
    await mongoose.connection.collection('doctors').createIndex(
      { primarySpecialty: 1 }, 
      { background: true }
    );
    
    // Create indexes for Patient model
    await mongoose.connection.collection('patients').createIndex(
      { patientId: 1 }, 
      { background: true, unique: true }
    );
    
    // Create indexes for CareProvider model
    await mongoose.connection.collection('careproviders').createIndex(
      { providerType: 1 }, 
      { background: true }
    );
    
    console.log('✅ Database indexes created successfully');
    
  } catch (error) {
    console.error('❌ Error creating indexes:', error.message);
  }
};

// Health check for database
const healthCheck = async () => {
  try {
    // Simple ping to check if database is responsive
    await mongoose.connection.db.admin().ping();
    return { status: 'healthy', timestamp: new Date() };
  } catch (error) {
    console.error('Database health check failed:', error.message);
    return { status: 'unhealthy', error: error.message, timestamp: new Date() };
  }
};

export {
  connectDatabase,
  checkDatabaseConnection,
  getDatabaseStats,
  createIndexes,
  healthCheck
};