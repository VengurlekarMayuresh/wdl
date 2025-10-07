import express from 'express';
import { authenticate, authorize, checkOwnership } from '../middleware/auth.js';
import CareProvider from '../models/CareProvider.js';
import User from '../models/User.js';

const router = express.Router();

// @route   GET /api/careproviders
// @desc    Get all verified care providers (public search)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      providerType,
      service,
      location,
      acceptingClients,
      page = 1,
      limit = 10,
      sortBy = 'ratings.averageRating',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {
      status: 'approved',
      'verification.isVerified': true
    };

    if (providerType) {
      query.providerType = { $regex: providerType, $options: 'i' };
    }

    if (service) {
      query.services = { $regex: service, $options: 'i' };
    }

    if (acceptingClients === 'true') {
      query['preferences.acceptsNewClients'] = true;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Create sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const careProviders = await CareProvider.find(query)
      .populate('userId', 'firstName lastName email phone address profilePicture')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await CareProvider.countDocuments(query);

    res.json({
      success: true,
      data: {
        careProviders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalProviders: total,
          hasNextPage: skip + careProviders.length < total,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get care providers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching care providers'
    });
  }
});


// Place profile routes BEFORE dynamic :id route to avoid shadowing
// @route   GET /api/careproviders/profile/me
// @desc    Get current care provider's profile
// @access  Private (CareProvider only)
router.get('/profile/me', authenticate, authorize('careprovider'), async (req, res) => {
  try {
    const careProvider = await CareProvider.findOne({ userId: req.user._id })
      .populate('userId')
      .populate('patients.patientId', 'userId patientId');

    if (!careProvider) {
      return res.status(404).json({
        success: false,
        message: 'Care provider profile not found'
      });
    }

    res.json({
      success: true,
      data: { careProvider }
    });

  } catch (error) {
    console.error('Get care provider profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching care provider profile'
    });
  }
});

// @route   PUT /api/careproviders/profile/me
// @desc    Update current care provider's profile
// @access  Private (CareProvider only)
router.put('/profile/me', authenticate, authorize('careprovider'), async (req, res) => {
  try {
    const allowedFields = [
      'providerType',
      'credentials',
      'education',
      'experience',
      'employment',
      'availability',
      'services',
      'skills',
      'background',
      'preferences'
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

    const careProvider = await CareProvider.findOneAndUpdate(
      { userId: req.user._id },
      updates,
      { new: true, runValidators: true }
    ).populate('userId');

    if (!careProvider) {
      return res.status(404).json({
        success: false,
        message: 'Care provider profile not found'
      });
    }

    res.json({
      success: true,
      message: 'Care provider profile updated successfully',
      data: { careProvider }
    });

  } catch (error) {
    console.error('Update care provider profile error:', error);
    
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
      message: 'Server error updating care provider profile'
    });
  }
});

// @route   POST /api/careproviders/profile/education
// @desc    Add education entry to care provider profile
// @access  Private (CareProvider only)
router.post('/profile/education', authenticate, authorize('careprovider'), async (req, res) => {
  try {
    const { institution, program, degree, graduationYear, gpa } = req.body;

    if (!institution || !program) {
      return res.status(400).json({
        success: false,
        message: 'Institution and program are required'
      });
    }

    const careProvider = await CareProvider.findOne({ userId: req.user._id });
    if (!careProvider) {
      return res.status(404).json({
        success: false,
        message: 'Care provider profile not found'
      });
    }

    careProvider.education.push({
      institution,
      program,
      degree,
      graduationYear,
      gpa
    });

    await careProvider.save();

    res.status(201).json({
      success: true,
      message: 'Education entry added successfully',
      data: { 
        education: careProvider.education[careProvider.education.length - 1] 
      }
    });

  } catch (error) {
    console.error('Add education error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding education entry'
    });
  }
});

// @route   PUT /api/careproviders/profile/availability
// @desc    Update availability schedule
// @access  Private (CareProvider only)
router.put('/profile/availability', authenticate, authorize('careprovider'), async (req, res) => {
  try {
    const {
      workSchedule,
      hoursPerWeek,
      availableDays,
      timeSlots,
      isAvailableForEmergency
    } = req.body;

    const careProvider = await CareProvider.findOne({ userId: req.user._id });
    if (!careProvider) {
      return res.status(404).json({
        success: false,
        message: 'Care provider profile not found'
      });
    }

    // Update availability fields
    if (workSchedule) careProvider.availability.workSchedule = workSchedule;
    if (hoursPerWeek) careProvider.availability.hoursPerWeek = hoursPerWeek;
    if (availableDays) careProvider.availability.availableDays = availableDays;
    if (timeSlots) careProvider.availability.timeSlots = timeSlots;
    if (isAvailableForEmergency !== undefined) {
      careProvider.availability.isAvailableForEmergency = isAvailableForEmergency;
    }

    await careProvider.save();

    res.json({
      success: true,
      message: 'Availability updated successfully',
      data: { availability: careProvider.availability }
    });

  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating availability'
    });
  }
});

// @route   POST /api/careproviders/profile/certification
// @desc    Add certification
// @access  Private (CareProvider only)
router.post('/profile/certification', authenticate, authorize('careprovider'), async (req, res) => {
  try {
    const { name, issuingOrganization, certificationDate, expiryDate } = req.body;

    if (!name || !issuingOrganization) {
      return res.status(400).json({
        success: false,
        message: 'Certification name and issuing organization are required'
      });
    }

    const careProvider = await CareProvider.findOne({ userId: req.user._id });
    if (!careProvider) {
      return res.status(404).json({
        success: false,
        message: 'Care provider profile not found'
      });
    }

    careProvider.credentials.certifications.push({
      name,
      issuingOrganization,
      certificationDate: certificationDate ? new Date(certificationDate) : new Date(),
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      status: 'active'
    });

    await careProvider.save();

    res.status(201).json({
      success: true,
      message: 'Certification added successfully',
      data: { 
        certification: careProvider.credentials.certifications[careProvider.credentials.certifications.length - 1] 
      }
    });

  } catch (error) {
    console.error('Add certification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding certification'
    });
  }
});

// @route   GET /api/careproviders/search/service
// @desc    Search care providers by service
// @access  Public
router.get('/search/service', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const careProviders = await CareProvider.find({
      status: 'approved',
      'verification.isVerified': true,
      services: { $regex: query, $options: 'i' }
    }).populate('userId', 'firstName lastName profilePicture')
      .limit(20);

    res.json({
      success: true,
      data: { careProviders }
    });

  } catch (error) {
    console.error('Search care providers by service error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error searching care providers'
    });
  }
});

// @route   GET /api/careproviders/available/:day
// @desc    Get available care providers for a specific day
// @access  Public
router.get('/available/:day', async (req, res) => {
  try {
    const { day } = req.params;
    const { service } = req.query;

    const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    if (!validDays.includes(day.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid day. Must be one of: ' + validDays.join(', ')
      });
    }

    const careProviders = await CareProvider.findAvailable(day.toLowerCase(), service)
      .populate('userId', 'firstName lastName phone profilePicture');

    res.json({
      success: true,
      data: { careProviders }
    });

  } catch (error) {
    console.error('Get available care providers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching available care providers'
    });
  }
});

// Keep parameterized :id route LAST so it doesn't capture more specific routes
// @route   GET /api/careproviders/:id
// @desc    Get care provider by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const careProvider = await CareProvider.findById(req.params.id)
      .populate('userId', 'firstName lastName email phone address profilePicture bio');

    if (!careProvider) {
      return res.status(404).json({
        success: false,
        message: 'Care provider not found'
      });
    }

    // Only show full details if provider is approved and verified
    if (careProvider.status !== 'approved' || !careProvider.verification?.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Care provider profile is not available for public viewing'
      });
    }

    res.json({
      success: true,
      data: { careProvider }
    });

  } catch (error) {
    console.error('Get care provider by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching care provider'
    });
  }
});

// @route   GET /api/careproviders/stats/dashboard
// @desc    Get care provider dashboard statistics
// @access  Private (CareProvider only)
router.get('/stats/dashboard', authenticate, authorize('careprovider'), async (req, res) => {
  try {
    const careProvider = await CareProvider.findOne({ userId: req.user._id });
    if (!careProvider) {
      return res.status(404).json({
        success: false,
        message: 'Care provider profile not found'
      });
    }

    const stats = {
      profileCompletion: calculateCareProviderProfileCompletion(careProvider),
      verificationStatus: careProvider.verification.isVerified,
      approvalStatus: careProvider.status,
      rating: careProvider.ratings.averageRating,
      totalReviews: careProvider.ratings.totalReviews,
      acceptingNewClients: careProvider.preferences.acceptsNewClients,
      activeClientsCount: careProvider.getActivePatients().length,
      activeCertifications: careProvider.getCurrentCertifications().length,
      licenseStatus: careProvider.credentials.isLicensed ? 'Licensed' : 'Not Licensed',
      isLicenseExpired: careProvider.isLicenseExpired()
    };

    res.json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    console.error('Get care provider stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching dashboard statistics'
    });
  }
});

// @route   PUT /api/careproviders/profile/preferences
// @desc    Update care provider preferences
// @access  Private (CareProvider only)
router.put('/profile/preferences', authenticate, authorize('careprovider'), async (req, res) => {
  try {
    const allowedFields = [
      'workRadius',
      'hourlyRate',
      'paymentMethods',
      'communicationPreference',
      'acceptsNewClients',
      'clientPreferences'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key) && req.body[key] !== undefined) {
        updates[`preferences.${key}`] = req.body[key];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid preference fields to update'
      });
    }

    const careProvider = await CareProvider.findOneAndUpdate(
      { userId: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!careProvider) {
      return res.status(404).json({
        success: false,
        message: 'Care provider profile not found'
      });
    }

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: { preferences: careProvider.preferences }
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating preferences'
    });
  }
});

// Helper function to calculate care provider profile completion
function calculateCareProviderProfileCompletion(careProvider) {
  const requiredFields = [
    'providerType',
    'services',
    'experience.yearsOfExperience'
  ];
  
  const optionalFields = [
    'credentials.certifications',
    'education',
    'skills.clinicalSkills',
    'availability.availableDays',
    'preferences.hourlyRate'
  ];
  
  let completed = 0;
  let total = requiredFields.length + optionalFields.length;
  
  // Check required fields
  requiredFields.forEach(field => {
    const fieldParts = field.split('.');
    let value = careProvider;
    
    for (const part of fieldParts) {
      value = value?.[part];
    }
    
    if (value && (Array.isArray(value) ? value.length > 0 : true)) {
      completed++;
    }
  });
  
  // Check optional fields
  optionalFields.forEach(field => {
    const fieldParts = field.split('.');
    let value = careProvider;
    
    for (const part of fieldParts) {
      value = value?.[part];
    }
    
    if (value && (Array.isArray(value) ? value.length > 0 : true)) {
      completed++;
    }
  });
  
  return Math.round((completed / total) * 100);
}

export default router;