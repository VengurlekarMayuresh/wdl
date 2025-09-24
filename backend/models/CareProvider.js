import mongoose from 'mongoose';
import User from './User.js';

const careProviderSchema = new mongoose.Schema({
  // Reference to User model
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Care Provider Type
  providerType: {
    type: String,
    required: true,
    enum: [
      'nurse',
      'nursing_assistant', 
      'home_health_aide',
      'physical_therapist',
      'occupational_therapist',
      'speech_therapist',
      'respiratory_therapist',
      'social_worker',
      'case_manager',
      'pharmacist',
      'nutritionist',
      'mental_health_counselor',
      'family_caregiver',
      'professional_caregiver',
      'volunteer',
      'other'
    ]
  },
  
  // Professional Credentials (for professional caregivers)
  credentials: {
    licenseNumber: String,
    licenseState: String,
    licenseType: {
      type: String,
      enum: ['RN', 'LPN', 'CNA', 'PTA', 'OTA', 'SLP', 'RRT', 'LSW', 'LCSW', 'PharmD', 'RD', 'LPC', 'Other']
    },
    licenseExpiryDate: Date,
    certifications: [{
      name: String,
      issuingOrganization: String,
      certificationDate: Date,
      expiryDate: Date,
      status: {
        type: String,
        enum: ['active', 'expired', 'suspended'],
        default: 'active'
      }
    }],
    isLicensed: {
      type: Boolean,
      default: false
    }
  },
  
  // Education and Training
  education: [{
    institution: String,
    program: String,
    degree: {
      type: String,
      enum: ['Certificate', 'Associates', 'Bachelors', 'Masters', 'Doctorate', 'Other']
    },
    graduationYear: Number,
    gpa: Number
  }],
  
  // Professional Experience
  experience: {
    yearsOfExperience: {
      type: Number,
      min: 0,
      max: 50
    },
    specializations: [{
      type: String,
      maxLength: 100
    }],
    settings: [{
      type: String,
      enum: [
        'hospital',
        'clinic', 
        'home_health',
        'nursing_home',
        'assisted_living',
        'rehabilitation_center',
        'hospice',
        'community_health',
        'school',
        'private_practice',
        'other'
      ]
    }],
    populations: [{
      type: String,
      enum: [
        'pediatric',
        'adult',
        'geriatric',
        'mental_health',
        'chronic_conditions',
        'acute_care',
        'critical_care',
        'rehabilitation',
        'palliative_care',
        'other'
      ]
    }]
  },
  
  // Employment Information
  employment: {
    status: {
      type: String,
      enum: ['employed', 'self_employed', 'contract', 'volunteer', 'unemployed', 'retired'],
      default: 'employed'
    },
    employer: String,
    position: String,
    department: String,
    employmentType: {
      type: String,
      enum: ['full_time', 'part_time', 'per_diem', 'contract', 'volunteer']
    },
    startDate: Date,
    endDate: Date,
    isCurrentPosition: {
      type: Boolean,
      default: true
    }
  },
  
  // Availability and Schedule
  availability: {
    workSchedule: {
      type: String,
      enum: ['day_shift', 'night_shift', 'evening_shift', 'rotating', 'weekends', 'on_call', 'flexible']
    },
    hoursPerWeek: Number,
    availableDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    timeSlots: [{
      day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      },
      startTime: String, // HH:MM format
      endTime: String    // HH:MM format
    }],
    isAvailableForEmergency: {
      type: Boolean,
      default: false
    }
  },
  
  // Services Provided
  services: [{
    type: String,
    enum: [
      'medication_management',
      'wound_care',
      'vital_signs_monitoring',
      'mobility_assistance',
      'personal_care',
      'meal_preparation',
      'transportation',
      'companionship',
      'physical_therapy',
      'occupational_therapy',
      'speech_therapy',
      'respiratory_care',
      'pain_management',
      'chronic_disease_management',
      'mental_health_support',
      'family_support',
      'care_coordination',
      'medication_administration',
      'injection_services',
      'iv_therapy',
      'catheter_care',
      'ostomy_care',
      'diabetes_management',
      'other'
    ]
  }],
  
  // Patient Relationships
  patients: [{
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient'
    },
    relationship: {
      type: String,
      enum: ['primary_caregiver', 'secondary_caregiver', 'specialist', 'family_member', 'friend', 'professional']
    },
    relationshipDetails: String, // e.g., "daughter", "spouse", "home health nurse"
    startDate: Date,
    endDate: Date,
    isActive: {
      type: Boolean,
      default: true
    },
    careLevel: {
      type: String,
      enum: ['minimal', 'moderate', 'extensive', 'total_care'],
      default: 'minimal'
    },
    primaryContact: {
      type: Boolean,
      default: false
    }
  }],
  
  // Skills and Competencies
  skills: {
    clinicalSkills: [{
      skill: String,
      proficiencyLevel: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        default: 'intermediate'
      },
      lastAssessed: Date
    }],
    technicalSkills: [{
      skill: String,
      proficiencyLevel: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        default: 'intermediate'
      }
    }],
    languages: [{
      language: String,
      proficiency: {
        type: String,
        enum: ['native', 'fluent', 'conversational', 'basic'],
        default: 'conversational'
      }
    }],
    specialTraining: [{
      training: String,
      completionDate: Date,
      expiryDate: Date,
      isActive: {
        type: Boolean,
        default: true
      }
    }]
  },
  
  // Background Information
  background: {
    backgroundCheckDate: Date,
    backgroundCheckStatus: {
      type: String,
      enum: ['pending', 'cleared', 'flagged', 'expired'],
      default: 'pending'
    },
    hasDriversLicense: {
      type: Boolean,
      default: false
    },
    hasVehicle: {
      type: Boolean,
      default: false
    },
    hasInsurance: {
      type: Boolean,
      default: false
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
      email: String
    }
  },
  
  // Ratings and Reviews
  ratings: {
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    categories: {
      professionalism: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
      },
      reliability: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
      },
      communication: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
      },
      careQuality: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
      }
    }
  },
  
  // Verification Status
  verification: {
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationDate: Date,
    verifiedBy: String,
    verificationDocuments: [{
      documentType: {
        type: String,
        enum: ['license', 'certification', 'background_check', 'reference', 'insurance', 'other']
      },
      fileName: String,
      filePath: String,
      uploadDate: {
        type: Date,
        default: Date.now
      },
      verified: {
        type: Boolean,
        default: false
      }
    }],
    references: [{
      name: String,
      relationship: String,
      organization: String,
      phone: String,
      email: String,
      yearsKnown: Number,
      contactDate: Date,
      status: {
        type: String,
        enum: ['pending', 'contacted', 'verified', 'unable_to_reach'],
        default: 'pending'
      }
    }]
  },
  
  // Preferences and Settings
  preferences: {
    workRadius: {
      type: Number, // miles
      default: 25
    },
    hourlyRate: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: 'USD'
      }
    },
    paymentMethods: [{
      type: String,
      enum: ['cash', 'check', 'direct_deposit', 'paypal', 'venmo', 'other']
    }],
    communicationPreference: {
      type: String,
      enum: ['email', 'phone', 'text', 'app'],
      default: 'email'
    },
    acceptsNewClients: {
      type: Boolean,
      default: true
    },
    clientPreferences: {
      ageGroups: [{
        type: String,
        enum: ['children', 'adults', 'seniors']
      }],
      conditionsComfortable: [String],
      servicesWillingToProvide: [String]
    }
  },
  
  // Status and Administrative
  status: {
    type: String,
    enum: ['pending', 'approved', 'suspended', 'inactive', 'rejected'],
    default: 'pending'
  },
  
  adminNotes: {
    type: String,
    select: false
  },
  
  lastActiveDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual to populate user information
careProviderSchema.virtual('userInfo', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Virtual to check if professional
careProviderSchema.virtual('isProfessional').get(function() {
  return !['family_caregiver', 'volunteer'].includes(this.providerType);
});

// Indexes for better query performance
careProviderSchema.index({ providerType: 1 });
careProviderSchema.index({ 'credentials.licenseNumber': 1 });
careProviderSchema.index({ 'patients.patientId': 1 });
careProviderSchema.index({ 'ratings.averageRating': -1 });
careProviderSchema.index({ status: 1, 'verification.isVerified': 1 });
careProviderSchema.index({ 'availability.availableDays': 1 });

// Method to check if license is expired
careProviderSchema.methods.isLicenseExpired = function() {
  if (!this.credentials?.licenseExpiryDate) return false;
  return this.credentials.licenseExpiryDate < new Date();
};

// Method to get active patients
careProviderSchema.methods.getActivePatients = function() {
  return this.patients.filter(patient => 
    patient.isActive && (!patient.endDate || patient.endDate > new Date())
  );
};

// Method to check availability for a specific day and time
careProviderSchema.methods.isAvailable = function(day, time) {
  const daySchedule = this.availability.timeSlots.filter(slot => slot.day === day.toLowerCase());
  if (daySchedule.length === 0) return false;
  
  // Simple time check (would need more sophisticated logic for real implementation)
  return daySchedule.some(slot => time >= slot.startTime && time <= slot.endTime);
};

// Method to get current certifications
careProviderSchema.methods.getCurrentCertifications = function() {
  return this.credentials.certifications?.filter(cert => 
    cert.status === 'active' && 
    (!cert.expiryDate || cert.expiryDate > new Date())
  ) || [];
};

// Static method to find by service type
careProviderSchema.statics.findByService = function(service) {
  return this.find({
    services: service,
    status: 'approved',
    'verification.isVerified': true,
    'preferences.acceptsNewClients': true
  }).populate('userId', 'firstName lastName email phone address');
};

// Static method to find available providers
careProviderSchema.statics.findAvailable = function(day, serviceType) {
  const query = {
    status: 'approved',
    'verification.isVerified': true,
    'preferences.acceptsNewClients': true
  };
  
  if (day) {
    query['availability.availableDays'] = day.toLowerCase();
  }
  
  if (serviceType) {
    query.services = serviceType;
  }
  
  return this.find(query).populate('userId');
};

// Static method to find by location (would need geospatial indexing for real implementation)
careProviderSchema.statics.findByLocation = function(zipCode, radius = 25) {
  return this.find({
    status: 'approved',
    'verification.isVerified': true,
    'preferences.workRadius': { $gte: radius }
  }).populate('userId');
};

const CareProvider = mongoose.model('CareProvider', careProviderSchema);

export default CareProvider;