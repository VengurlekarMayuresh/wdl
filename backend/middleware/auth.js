import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Generate JWT token
export const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Verify JWT token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Authentication middleware
export const authenticate = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check for token in cookies
    else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = verifyToken(token);
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is invalid. User not found.'
      });
    }

    // Check if user account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Check if user account is locked
    if (user.isLocked && user.isLocked()) {
      return res.status(401).json({
        success: false,
        message: 'Account is temporarily locked due to multiple failed login attempts.'
      });
    }

    // Add user to request object
    req.user = user;
    next();

  } catch (error) {
    console.error('Authentication error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format.'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.'
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Authentication failed. Please try again.'
      });
    }
  }
};

// Authorization middleware - check user roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!roles.includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }

    next();
  };
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const decoded = verifyToken(token);
        const user = await User.findById(decoded.userId).select('-password');
        
        if (user && user.isActive && !(user.isLocked && user.isLocked())) {
          req.user = user;
        }
      } catch (error) {
        // Token invalid, but continue without authentication
        console.log('Optional auth failed:', error.message);
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Middleware to check if user owns the resource
export const checkOwnership = (resourceField = 'userId') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required.'
        });
      }

      // For admin users, allow access to all resources
      if (req.user.userType === 'admin') {
        return next();
      }

      // Check if user owns the resource
      const resourceUserId = req.params.userId || req.body[resourceField] || req.user._id;
      
      if (req.user._id.toString() !== resourceUserId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only access your own resources.'
        });
      }

      next();
    } catch (error) {
      console.error('Ownership check error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Authorization check failed.'
      });
    }
  };
};

// Middleware to refresh token if it's close to expiration
export const refreshTokenIfNeeded = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;
    
    if (token) {
      const decoded = jwt.decode(token);
      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = decoded.exp - currentTime;
      
      // If token expires in less than 24 hours, refresh it
      if (timeUntilExpiry < 24 * 60 * 60) {
        const newToken = generateToken(decoded.userId);
        res.setHeader('X-New-Token', newToken);
      }
    }
    
    next();
  } catch (error) {
    // Continue without refreshing if there's an error
    next();
  }
};

// Rate limiting for authentication attempts
const loginAttempts = new Map();

export const rateLimitAuth = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!loginAttempts.has(key)) {
      loginAttempts.set(key, { attempts: 1, resetTime: now + windowMs });
      return next();
    }
    
    const attemptData = loginAttempts.get(key);
    
    // Reset if window has expired
    if (now > attemptData.resetTime) {
      loginAttempts.set(key, { attempts: 1, resetTime: now + windowMs });
      return next();
    }
    
    // Check if max attempts exceeded
    if (attemptData.attempts >= maxAttempts) {
      const resetIn = Math.ceil((attemptData.resetTime - now) / 60000);
      return res.status(429).json({
        success: false,
        message: `Too many login attempts. Please try again in ${resetIn} minutes.`
      });
    }
    
    // Increment attempts
    attemptData.attempts += 1;
    loginAttempts.set(key, attemptData);
    
    next();
  };
};

// Clear rate limit on successful login
export const clearRateLimit = (req, res, next) => {
  const key = req.ip || req.connection.remoteAddress;
  loginAttempts.delete(key);
  next();
};