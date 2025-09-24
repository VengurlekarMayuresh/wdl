import express from 'express';
import { authenticate, generateToken, rateLimitAuth, clearRateLimit } from '../middleware/auth.js';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import CareProvider from '../models/CareProvider.js';

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
    const validUserTypes = ['doctor', 'patient', 'careprovider'];
    if (!validUserTypes.includes(userType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user type. Must be one of: doctor, patient, careprovider'
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
          
        case 'careprovider':
          profile = await CareProvider.create({
            userId: user._id,
            providerType: 'other', // This should be updated later
            status: 'pending'
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
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check if user exists (include password for comparison)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

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
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      // Increment login attempts
      await user.incLoginAttempts();
      
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

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