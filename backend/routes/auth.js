import express from 'express';
import jwt from 'jsonwebtoken';
import { authenticate, generateToken, rateLimitAuth, clearRateLimit } from '../middleware/auth.js';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', rateLimitAuth(10, 60 * 60 * 1000), async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      userType,
      phone,
      dateOfBirth,
      gender,
      address
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !userType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: firstName, lastName, email, password, userType'
      });
    }

    // Validate user type
    const validUserTypes = ['doctor', 'patient', 'facility'];
    if (!validUserTypes.includes(userType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user type. Must be one of: doctor, patient, careprovider, facility'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user
    const userData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password,
      userType,
      phone: phone?.trim(),
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      gender,
      address
    };

    const user = await User.create(userData);

    // Create type-specific profile
    let profile = null;
    try {
      switch (userType) {
        case 'facility': {
          // Be tolerant to different frontend shapes and build a normalized address
          const facilityName = String(req.body.facilityName || req.body.name || '').trim();
          const facilityType = String(req.body.facilityType || req.body.type || '').trim();
          const rawAddress = req.body.facilityAddress || {
            street: req.body.facilityStreet,
            area: req.body.facilityArea,
            city: req.body.facilityCity,
            state: req.body.facilityState,
            pincode: req.body.facilityPincode,
            country: req.body.facilityCountry,
          };
          const facilityAddress = {
            street: String(rawAddress?.street ?? '').trim(),
            area: String(rawAddress?.area ?? '').trim(),
            city: String(rawAddress?.city ?? '').trim(),
            state: String(rawAddress?.state ?? '').trim(),
            pincode: String(rawAddress?.pincode ?? '').trim(),
            country: String(rawAddress?.country ?? 'India').trim(),
          };

          // Final normalization and safe defaults (avoid hard failures in dev)
          let _facilityName = facilityName || `${firstName || 'New'} Facility`;
          let _facilityType = facilityType || 'clinic';
          let _addr = {
            street: facilityAddress.street || 'Unknown Street',
            area: facilityAddress.area || '',
            city: facilityAddress.city || 'Unknown City',
            state: facilityAddress.state || 'Unknown State',
            pincode: facilityAddress.pincode || '000000',
            country: facilityAddress.country || 'India'
          };

          // Log what we will persist
          console.log('🏥 Normalized facility registration payload:', {
            name: _facilityName, type: _facilityType, address: _addr
          });

          const HealthcareFacility = (await import('../models/HealthcareFacility.js')).default;

          // Choose default images by type (including richer primary_care set)
          const imageBases = {
            hospital: [
              'https://images.unsplash.com/photo-1586773860418-d37222d8fce3',
              'https://images.unsplash.com/photo-1584433144859-1fc3ab64a957'
            ],
            clinic: [
              'https://images.unsplash.com/photo-1576765608610-cb84c3a3e1ac',
              'https://images.unsplash.com/photo-1587300003388-59208cc962cb'
            ],
            primary_care: [
              'https://images.unsplash.com/photo-1587502537745-84b4053f79c4',
              'https://images.unsplash.com/photo-1579154204601-01588f351e67'
            ],
            pharmacy: [
              'https://images.unsplash.com/photo-1587854692152-9b16b54c0a3b',
              'https://images.unsplash.com/photo-1584367369853-8d4d8a7b1f5b'
            ]
          };
          const bases = imageBases[facilityType] || imageBases.hospital;
          const img1 = `${bases[0]}?auto=format&fit=crop&w=1200&q=80&sig=${Date.now()}`;
          const img2 = `${bases[1]}?auto=format&fit=crop&w=1200&q=80&sig=${Date.now()+1}`;

          // Ensure facility email is unique vs existing facilities by using an alias of user email
          const parts = (user.email || '').split('@');
          const local = (parts[0] || 'facility').replace(/[^a-zA-Z0-9+._-]/g, '');
          const domain = parts[1] || 'example.com';
          const facilityEmailAlias = `${local}+facility-${String(user._id).slice(-6)}@${domain}`.toLowerCase();

          profile = await HealthcareFacility.create({
            userId: user._id,
            name: _facilityName,
            type: _facilityType,
            providerType: _facilityType,
            // Required facility auth fields
            email: facilityEmailAlias,
            password: password, // will be hashed by pre-save hook
            // Top-level phone used by frontend listings
            phone: user.phone,
            // Contact block with required primary phone
            contact: {
              phone: {
                primary: user.phone || 'N/A'
              },
              email: user.email
            },
            address: {
              street: _addr.street,
              area: _addr.area,
              city: _addr.city,
              state: _addr.state,
              pincode: _addr.pincode,
              country: _addr.country
            },
            is24x7: false,
            operatingHours: [
              { day: 'monday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
              { day: 'tuesday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
              { day: 'wednesday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
              { day: 'thursday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
              { day: 'friday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
              { day: 'saturday', isOpen: false },
              { day: 'sunday', isOpen: false }
            ],
            media: {
              images: [
                { url: img1, caption: 'exterior', type: 'exterior' },
                { url: img2, caption: 'interior', type: 'interior' }
              ]
            },
            status: 'active',
          });
          break;
        }
        case 'doctor':
          // Doctor requires additional information, so we create a basic profile
          profile = await Doctor.create({
            userId: user._id,
            // These will need to be updated later by the doctor
            medicalLicenseNumber: 'PENDING',
            licenseState: 'PENDING', 
            licenseExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
            primarySpecialty: 'Other',
            status: 'pending'
          });
          break;
          
        case 'patient':
          profile = await Patient.create({
            userId: user._id
          });
          break;
          
      }
    } catch (profileError) {
      // If profile creation fails, delete the user
      await User.findByIdAndDelete(user._id);
      throw profileError;
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userResponse,
        profile,
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    // Duplicate key (e.g., email already exists)
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0] || 'field';
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }

    // In non-production, surface the actual error message to speed up debugging
    if ((process.env.NODE_ENV || 'development') !== 'production') {
      return res.status(500).json({
        success: false,
        message: `Server error during registration: ${error.message}`,
        ...(error.stack ? { stack: error.stack } : {})
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', rateLimitAuth(), async (req, res) => {
  try {
    console.log('🚀 LOGIN ATTEMPT - Full request body:', req.body);
    const { email, password } = req.body;
    
    console.log('📧 Extracted email:', email);
    console.log('🔑 Password provided:', password ? '[PRESENT]' : '[MISSING]');
    console.log('🔑 Password length:', password ? password.length : 0);
    console.log('🔑 Password value (DEBUG):', password); // REMOVE THIS IN PRODUCTION!

    // Validate input
    if (!email || !password) {
      console.log('❌ LOGIN FAILED: Missing email or password');
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check if user exists (include password for comparison)
    console.log('🔍 Searching for user with email:', email.toLowerCase());
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      console.log('❌ User not found in Users, trying facility login...');
      // Facility fallback
      const facility = await (await import('../models/HealthcareFacility.js')).default.findOne({ email: email.toLowerCase() }).select('+password');
      if (!facility || facility.isAuthActive === false) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
      const ok = await facility.comparePassword(password);
      if (!ok) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
      // Issue facility token
      const token = jwt.sign({ facilityId: facility._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
      clearRateLimit(req, res, () => {});
      return res.json({ success: true, message: 'Login successful', data: { token, facility: { _id: facility._id, name: facility.name, email: facility.email } } });
    }
    
    console.log('✅ User found!');
    console.log('👤 User ID:', user._id);
    console.log('👤 User email:', user.email);
    console.log('👤 User type:', user.userType);
    console.log('👤 User active:', user.isActive);
    console.log('🔒 Stored password hash exists:', !!user.password);
    console.log('🔒 Stored password hash length:', user.password ? user.password.length : 0);

    // Check if account is locked
    if (user.isLocked()) {
      return res.status(401).json({
        success: false,
        message: 'Account is temporarily locked due to multiple failed login attempts'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Compare password
    console.log('🔍 Starting password comparison...');
    console.log('🔑 Input password:', password);
    console.log('🔒 Stored hash:', user.password.substring(0, 20) + '...');
    
    const isPasswordValid = await user.comparePassword(password);
    console.log('🧪 Password comparison result:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ User password mismatch, trying facility login fallback...');
      const FacilityModel = (await import('../models/HealthcareFacility.js')).default;
      const facility = await FacilityModel.findOne({ email: email.toLowerCase() }).select('+password');
      if (facility && await facility.comparePassword(password)) {
        const token = jwt.sign({ facilityId: facility._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
        clearRateLimit(req, res, () => {});
        return res.json({ success: true, message: 'Login successful', data: { token, facility: { _id: facility._id, name: facility.name, email: facility.email } } });
      }
      // Increment login attempts
      await user.incLoginAttempts();
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    console.log('✅ Password validation successful!');

    // Reset login attempts on successful login
    if (user.loginAttempts && user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    // Get user profile based on user type
    let profile = null;
    try {
      switch (user.userType) {
        case 'facility': {
          const HealthcareFacility = (await import('../models/HealthcareFacility.js')).default;
          profile = await HealthcareFacility.findOne({ userId: user._id });
          break;
        }
        case 'doctor':
          profile = await Doctor.findOne({ userId: user._id });
          break;
        case 'patient':
          profile = await Patient.findOne({ userId: user._id });
          break;
        case 'careprovider':
          profile = await CareProvider.findOne({ userId: user._id });
          break;
      }
    } catch (profileError) {
      console.error('Error fetching profile:', profileError);
    }

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    // Clear rate limiting on successful login
    clearRateLimit(req, res, () => {});

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        profile,
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = req.user;

    // Get user profile based on user type
    let profile = null;
    try {
      switch (user.userType) {
        case 'facility': {
          const HealthcareFacility = (await import('../models/HealthcareFacility.js')).default;
          profile = await HealthcareFacility.findOne({ userId: user._id });
          break;
        }
        case 'doctor':
          profile = await Doctor.findOne({ userId: user._id });
          break;
        case 'patient':
          profile = await Patient.findOne({ userId: user._id });
          break;
      }
    } catch (profileError) {
      console.error('Error fetching profile:', profileError);
    }

    res.json({
      success: true,
      data: {
        user,
        profile
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user profile'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authenticate, async (req, res) => {
  try {
    // In a real application, you might want to blacklist the token
    // For now, we'll just send a success response
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
});

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current password and new password'
      });
    }

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error changing password'
    });
  }
});

// @route   PUT /api/auth/update-profile
// @desc    Update basic user profile
// @access  Private
router.put('/update-profile', authenticate, async (req, res) => {
  try {
    const allowedFields = [
      'firstName',
      'lastName',
      'phone',
      'dateOfBirth',
      'gender',
      'address',
      'bio',
      'profilePicture'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key) && req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    // Parse date if provided
    if (updates.dateOfBirth) {
      updates.dateOfBirth = new Date(updates.dateOfBirth);
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
});

export default router;