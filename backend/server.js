import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDatabase, createIndexes, healthCheck } from './config/database.js';
import crypto from 'crypto';

// Resolve backend directory and load .env explicitly
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes
import authRoutes from './routes/auth.js';
import doctorRoutes from './routes/doctors.js';
import patientRoutes from './routes/patients.js';
import careProviderRoutes from './routes/careProviders.js';
import uploadRoutes from './routes/upload.js';
import appointmentRoutes from './routes/appointments.js';
import healthcareFacilitiesRoutes from './routes/healthcareFacilities.js';

// Load environment variables from backend/.env explicitly
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy (important for rate limiting and getting real IP addresses)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: (process.env.NODE_ENV || 'development') === 'production'
}));

// Attach a request id for tracing
app.use((req, res, next) => {
  const id = req.headers['x-request-id'] || (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));
  res.setHeader('X-Request-Id', id);
  req.id = id;
  next();
});

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const isProd = (process.env.NODE_ENV || 'development') === 'production';

    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    // In development, allow all origins for easier local testing
    if (!isProd) return callback(null, true);

    // In production, restrict to env-configured origins (comma-separated)
    const configured = (process.env.ALLOWED_ORIGINS || process.env.CLIENT_URL || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    // If wildcard present, allow all
    if (configured.includes('*')) return callback(null, true);

    // Normalize origins by removing trailing slashes and lowercasing the host part
    const normalize = (url) => {
      try {
        const u = new URL(url.replace(/\/$/, ''));
        // Lowercase protocol+host, keep port if present
        return `${u.protocol}//${u.host}`;
      } catch {
        return url.replace(/\/$/, '');
      }
    };

    const allowedSet = new Set(configured.map(normalize));
    const normalizedOrigin = normalize(origin);

    if (allowedSet.has(normalizedOrigin)) return callback(null, true);

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH'],
  allowedHeaders: [
    'Origin', 
    'Accept', 
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Access-Control-Allow-Credentials',
    'Access-Control-Allow-Origin'
  ],
  exposedHeaders: ['X-New-Token'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
// Handle preflight requests for all routes
app.options('*', cors(corsOptions));

// Compression middleware
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Logging middleware
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// Body parsing middleware
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({
        success: false,
        message: 'Invalid JSON payload'
      });
      throw new Error('Invalid JSON');
    }
  }
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// Rate limiting
const isProd = (process.env.NODE_ENV || 'development') === 'production';
const generalLimiter = rateLimit({
  windowMs: (parseInt(process.env.WINDOW_TIME_MINUTES) || 15) * 60 * 1000,
  max: isProd ? (parseInt(process.env.MAX_REQUESTS_PER_WINDOW) || 100) : 1000000, // effectively disabled in dev
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req, res) => {
    // Skip rate limiting entirely in development and for health checks
    if (!isProd) return true;
    return req.path === '/api/health';
  },
  keyGenerator: (req, res) => {
    // Prefer user id when available to avoid throttling all users behind same IP (optional)
    try {
      const auth = req.headers.authorization || '';
      // Keep it simple: still use IP if no auth
      return req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'global';
    } catch {
      return req.ip || 'global';
    }
  }
});

app.use('/api/', generalLimiter);

// Health check endpoint (before other routes)
app.get('/api/health', async (req, res) => {
  try {
    const dbHealth = await healthCheck();
    
    res.json({
      success: true,
      message: 'Server is running',
      data: {
        server: 'healthy',
        database: dbHealth.status,
        timestamp: new Date(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.env.npm_package_version || '1.0.0'
      }
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Service unavailable',
      data: {
        server: 'healthy',
        database: 'unhealthy',
        timestamp: new Date()
      }
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/careproviders', careProviderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/healthcare-facilities', healthcareFacilitiesRoutes);

// Welcome route
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Healthcare Management System API',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/auth',
      doctors: '/api/doctors',
      patients: '/api/patients',
      careProviders: '/api/careproviders',
      appointments: '/api/appointments',
      health: '/api/health'
    }
  });
});

// Catch 404s only for API routes; let frontend handle client routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    suggestion: 'Check the API documentation for available endpoints'
  });
});

// In production, serve frontend build and use SPA fallback
if ((process.env.NODE_ENV || 'development') === 'production') {
  const clientDist = path.join(__dirname, '..', 'frontend', 'dist');
  // Cache static assets; index.html should not be aggressively cached
  app.use(express.static(clientDist, { maxAge: '1d', index: false }));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
    }
    res.setHeader('Cache-Control', 'no-store');
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // CORS error
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS error: Origin not allowed'
    });
  }

  // Request entity too large
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Request payload too large'
    });
  }

  // Default server error
  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong!' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  console.log(`\n📴 Received ${signal}. Shutting down gracefully...`);
  
  server.close(() => {
    console.log('🔒 HTTP server closed');
    
    // Close database connection
    process.exit(0);
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    console.error('❌ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
};

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception! Shutting down...');
  console.error(err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('💥 Unhandled Promise Rejection! Shutting down...');
  console.error(err);
  server.close(() => {
    process.exit(1);
  });
});

// Start server function
const startServer = async () => {
  try {
    console.log('🚀 Starting Healthcare Management System API...\n');
    
    // Connect to database
    await connectDatabase();
    
    // Create database indexes
    await createIndexes();
    
    // Start the server
    const server = app.listen(PORT, () => {
      console.log(`\n🌟 Server running in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`🔗 Server URL: http://localhost:${PORT}`);
      console.log(`📋 API Documentation: http://localhost:${PORT}/api`);
      console.log(`💊 Health Check: http://localhost:${PORT}/api/health`);
      console.log('\n📡 Available Endpoints:');
      console.log('   • Authentication: /api/auth');
      console.log('   • Doctors: /api/doctors');
      console.log('   • Patients: /api/patients');
      console.log('   • Care Providers: /api/careproviders');
      console.log('   • Appointments: /api/appointments');
      console.log('\n✅ Server is ready to handle requests!\n');
    });

    // Store server instance globally for graceful shutdown
    global.server = server;
    
    return server;
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
const server = await startServer();

// Export for testing
export default app;