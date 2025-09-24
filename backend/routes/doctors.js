import express from 'express';
import { authenticate, authorize, checkOwnership } from '../middleware/auth.js';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';

const router = express.Router();

// Simple metadata for doctor signup and profile editing
const DOCTOR_META = Object.freeze({
  specialties: [
    'Cardiology','Dermatology','Emergency Medicine','Endocrinology','Family Medicine','Gastroenterology','General Surgery','Gynecology','Hematology','Infectious Disease','Internal Medicine','Neurology','Neurosurgery','Obstetrics','Oncology','Ophthalmology','Orthopedics','Otolaryngology','Pediatrics','Psychiatry','Pulmonology','Radiology','Rheumatology','Urology','Other'
  ],
  degrees: ['MD','DO','MBBS','PhD','Other'],
  states: [
    'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'
  ],
});

// @route   GET /api/doctors/meta
// @desc    Get doctor metadata (specialties, degrees, states)
// @access  Public
router.get('/meta', (req, res) => {
  res.json({ success: true, data: DOCTOR_META });
});

// @route   GET /api/doctors
// @desc    Get all doctors (public search)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      specialty,
      location,
      acceptingNewPatients,
      page = 1,
      limit = 10,
      sortBy = 'averageRating',
      sortOrder = 'desc'
    } = req.query;

    const isProd = process.env.NODE_ENV === 'production';

    // Build query
    const query = {};

    // In production, only show approved and verified doctors publicly
    if (isProd) {
      query.status = 'approved';
      query.isVerified = true;
    }

    if (specialty) {
      query.$or = [
        { primarySpecialty: { $regex: specialty, $options: 'i' } },
        { secondarySpecialties: { $regex: specialty, $options: 'i' } }
      ];
    }

    if (acceptingNewPatients === 'true') {
      query.isAcceptingNewPatients = true;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Create sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const doctors = await Doctor.find(query)
      .populate('userId', 'firstName lastName email phone address profilePicture')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Doctor.countDocuments(query);

    res.json({
      success: true,
      data: {
        doctors,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalDoctors: total,
          hasNextPage: skip + doctors.length < total,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching doctors'
    });
  }
});

// @route   GET /api/doctors/:id
// @desc    Get doctor by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('userId', 'firstName lastName email phone address profilePicture bio');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Only restrict in production environments
    if (process.env.NODE_ENV === 'production') {
      if (doctor.status !== 'approved' || !doctor.isVerified) {
        return res.status(403).json({
          success: false,
          message: 'Doctor profile is not available for public viewing'
        });
      }
    }

    res.json({
      success: true,
      data: { doctor }
    });

  } catch (error) {
    console.error('Get doctor by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching doctor'
    });
  }
});

// @route   GET /api/doctors/profile/me
// @desc    Get current doctor's profile
// @access  Private (Doctor only)
router.get('/profile/me', authenticate, authorize('doctor'), async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id })
      .populate('userId');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    res.json({
      success: true,
      data: { doctor }
    });

  } catch (error) {
    console.error('Get doctor profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching doctor profile'
    });
  }
});

// @route   PUT /api/doctors/profile/me
// @desc    Update current doctor's profile
// @access  Private (Doctor only)
router.put('/profile/me', authenticate, authorize('doctor'), async (req, res) => {
  try {
    const allowedFields = [
      'medicalLicenseNumber',
      'licenseState',
      'licenseExpiryDate',
      'boardCertifications',
      'education',
      'residency',
      'fellowship',
      'primarySpecialty',
      'secondarySpecialties',
      'subspecialties',
      'areasOfExpertise',
      'certificationsList',
      'npiNumber',
      'deaNumber',
      'hospitalAffiliations',
      'clinicAffiliations',
      'yearsOfExperience',
      'languagesSpoken',
      'workingHours',
      'bio',
      'consultationFee',
      'acceptsInsurance',
      'insurancesAccepted',
      'telemedicineEnabled',
      'telemedicinePlatforms',
      'isAcceptingNewPatients'
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

    // Parse dates if provided
    if (updates.licenseExpiryDate) {
      updates.licenseExpiryDate = new Date(updates.licenseExpiryDate);
    }

    const doctor = await Doctor.findOneAndUpdate(
      { userId: req.user._id },
      updates,
      { new: true, runValidators: true }
    ).populate('userId');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    res.json({
      success: true,
      message: 'Doctor profile updated successfully',
      data: { doctor }
    });

  } catch (error) {
    console.error('Update doctor profile error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Medical license number must be unique'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error updating doctor profile'
    });
  }
});

// @route   POST /api/doctors/profile/education
// @desc    Add education entry to doctor profile
// @access  Private (Doctor only)
router.post('/profile/education', authenticate, authorize('doctor'), async (req, res) => {
  try {
    const { institution, degree, fieldOfStudy, graduationYear, honors } = req.body;

    if (!institution || !degree) {
      return res.status(400).json({
        success: false,
        message: 'Institution and degree are required'
      });
    }

    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    doctor.education.push({
      institution,
      degree,
      fieldOfStudy,
      graduationYear,
      honors
    });

    await doctor.save();

    res.status(201).json({
      success: true,
      message: 'Education entry added successfully',
      data: { education: doctor.education[doctor.education.length - 1] }
    });

  } catch (error) {
    console.error('Add education error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding education entry'
    });
  }
});

// @route   PUT /api/doctors/profile/education/:educationId
// @desc    Update education entry
// @access  Private (Doctor only)
router.put('/profile/education/:educationId', authenticate, authorize('doctor'), async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    const educationEntry = doctor.education.id(req.params.educationId);
    if (!educationEntry) {
      return res.status(404).json({
        success: false,
        message: 'Education entry not found'
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (['institution', 'degree', 'fieldOfStudy', 'graduationYear', 'honors'].includes(key)) {
        educationEntry[key] = req.body[key];
      }
    });

    await doctor.save();

    res.json({
      success: true,
      message: 'Education entry updated successfully',
      data: { education: educationEntry }
    });

  } catch (error) {
    console.error('Update education error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating education entry'
    });
  }
});

// @route   DELETE /api/doctors/profile/education/:educationId
// @desc    Delete education entry
// @access  Private (Doctor only)
router.delete('/profile/education/:educationId', authenticate, authorize('doctor'), async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    const educationEntry = doctor.education.id(req.params.educationId);
    if (!educationEntry) {
      return res.status(404).json({
        success: false,
        message: 'Education entry not found'
      });
    }

    educationEntry.remove();
    await doctor.save();

    res.json({
      success: true,
      message: 'Education entry deleted successfully'
    });

  } catch (error) {
    console.error('Delete education error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting education entry'
    });
  }
});

// @route   GET /api/doctors/search/specialty
// @desc    Search doctors by specialty
// @access  Public
router.get('/search/specialty', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const doctors = await Doctor.find({
      status: 'approved',
      isVerified: true,
      $or: [
        { primarySpecialty: { $regex: query, $options: 'i' } },
        { secondarySpecialties: { $regex: query, $options: 'i' } },
        { subspecialties: { $regex: query, $options: 'i' } }
      ]
    }).populate('userId', 'firstName lastName profilePicture')
      .limit(20);

    res.json({
      success: true,
      data: { doctors }
    });

  } catch (error) {
    console.error('Search doctors by specialty error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error searching doctors'
    });
  }
});

// @route   GET /api/doctors/stats/dashboard
// @desc    Get doctor dashboard statistics
// @access  Private (Doctor only)
router.get('/stats/dashboard', authenticate, authorize('doctor'), async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    const stats = {
      profileCompletion: calculateProfileCompletion(doctor),
      verificationStatus: doctor.isVerified,
      approvalStatus: doctor.status,
      rating: doctor.averageRating,
      totalReviews: doctor.totalReviews,
      isAcceptingPatients: doctor.isAcceptingNewPatients,
      licenseExpiry: doctor.licenseExpiryDate,
      isLicenseExpired: doctor.isLicenseExpired()
    };

    res.json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    console.error('Get doctor stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching dashboard statistics'
    });
  }
});

// Helper function to calculate profile completion percentage
function calculateProfileCompletion(doctor) {
  const requiredFields = [
    'medicalLicenseNumber',
    'licenseState', 
    'licenseExpiryDate',
    'primarySpecialty',
    'yearsOfExperience'
  ];
  
  const optionalFields = [
    'education',
    'residency',
    'boardCertifications',
    'hospitalAffiliations',
    'languagesSpoken'
  ];
  
  let completed = 0;
  let total = requiredFields.length + optionalFields.length;
  
  // Check required fields
  requiredFields.forEach(field => {
    if (doctor[field] && doctor[field] !== 'PENDING') {
      completed++;
    }
  });
  
  // Check optional fields (arrays)
  optionalFields.forEach(field => {
    if (doctor[field] && Array.isArray(doctor[field]) && doctor[field].length > 0) {
      completed++;
    }
  });
  
  return Math.round((completed / total) * 100);
}

export default router;