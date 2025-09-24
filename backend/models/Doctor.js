import mongoose from 'mongoose';
import User from './User.js';

const doctorSchema = new mongoose.Schema({
  // Reference to User model
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Medical License and Credentials
  medicalLicenseNumber: {
    type: String,
    required: [true, 'Medical license number is required'],
    unique: true,
    trim: true
  },
  licenseState: {
    type: String,
    required: [true, 'License state is required']
  },
  licenseExpiryDate: {
    type: Date,
    required: [true, 'License expiry date is required']
  },
  boardCertifications: [{
    board: {
      type: String,
      required: true
    },
    specialty: {
      type: String,
      required: true
    },
    certificationDate: Date,
    expiryDate: Date,
    status: {
      type: String,
      enum: ['active', 'expired', 'suspended'],
      default: 'active'
    }
  }],
  
  // Education and Training
  education: [{
    institution: {
      type: String,
      required: true
    },
    degree: {
      type: String,
      required: true,
      enum: ['MD', 'DO', 'MBBS', 'PhD', 'Other']
    },
    fieldOfStudy: String,
    graduationYear: {
      type: Number,
      min: 1950,
      max: new Date().getFullYear()
    },
    honors: String
  }],
  
  residency: [{
    hospital: {
      type: String,
      required: true
    },
    specialty: {
      type: String,
      required: true
    },
    startYear: Number,
    endYear: Number,
    location: {
      city: String,
      state: String,
      country: String
    }
  }],
  
  fellowship: [{
    hospital: String,
    specialty: String,
    startYear: Number,
    endYear: Number,
    location: {
      city: String,
      state: String,
      country: String
    }
  }],
  
  // Specializations
  primarySpecialty: {
    type: String,
    required: [true, 'Primary specialty is required'],
    enum: [
      'Cardiology',
      'Dermatology',
      'Emergency Medicine',
      'Endocrinology',
      'Family Medicine',
      'Gastroenterology',
      'General Surgery',
      'Gynecology',
      'Hematology',
      'Infectious Disease',
      'Internal Medicine',
      'Neurology',
      'Neurosurgery',
      'Obstetrics',
      'Oncology',
      'Ophthalmology',
      'Orthopedics',
      'Otolaryngology',
      'Pediatrics',
      'Psychiatry',
      'Pulmonology',
      'Radiology',
      'Rheumatology',
      'Urology',
      'Other'
    ]
  },
  
  secondarySpecialties: [{
    type: String,
    enum: [
      'Cardiology',
      'Dermatology',
      'Emergency Medicine',
      'Endocrinology',
      'Family Medicine',
      'Gastroenterology',
      'General Surgery',
      'Gynecology',
      'Hematology',
      'Infectious Disease',
      'Internal Medicine',
      'Neurology',
      'Neurosurgery',
      'Obstetrics',
      'Oncology',
      'Ophthalmology',
      'Orthopedics',
      'Otolaryngology',
      'Pediatrics',
      'Psychiatry',
      'Pulmonology',
      'Radiology',
      'Rheumatology',
      'Urology',
      'Other'
    ]
  }],
  
  subspecialties: [{
    type: String,
    maxLength: [100, 'Subspecialty name cannot exceed 100 characters']
  }],
  
  // Professional Details
  npiNumber: {
    type: String,
    unique: true,
    sparse: true,
    validate: {
      validator: function(v) {
        return !v || /^\d{10}$/.test(v);
      },
      message: 'NPI number must be 10 digits'
    }
  },
  
  deaNumber: {
    type: String,
    sparse: true,
    validate: {
      validator: function(v) {
        return !v || /^[A-Z]{2}\d{7}$/.test(v);
      },
      message: 'DEA number format is invalid'
    }
  },
  
  // Practice Information
  hospitalAffiliations: [{
    hospital: {
      type: String,
      required: true
    },
    position: String,
    department: String,
    startDate: Date,
    endDate: Date,
    isCurrentlyAffiliated: {
      type: Boolean,
      default: true
    },
    privileges: [String]
  }],
  
  clinicAffiliations: [{
    clinicName: {
      type: String,
      required: true
    },
    position: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: {
        type: String,
        default: 'USA'
      }
    },
    phone: String,
    email: String,
    startDate: Date,
    endDate: Date,
    isCurrentlyAffiliated: {
      type: Boolean,
      default: true
    }
  }],
  
  // Professional Experience
  yearsOfExperience: {
    type: Number,
    min: [0, 'Years of experience cannot be negative'],
    max: [70, 'Years of experience seems unrealistic']
  },
  
  // Languages Spoken
  languagesSpoken: [{
    language: {
      type: String,
      required: true
    },
    proficiency: {
      type: String,
      enum: ['native', 'fluent', 'conversational', 'basic'],
      default: 'conversational'
    }
  }],
  
  // Availability and Schedule
  consultationFee: {
    type: Number,
    min: [0, 'Consultation fee cannot be negative']
  },
  
  acceptsInsurance: {
    type: Boolean,
    default: true
  },
  
  insurancesAccepted: [{
    type: String
  }],
  
  // Ratings and Reviews
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
  
  // Professional Status
  isVerified: {
    type: Boolean,
    default: false
  },
  
  verificationDate: Date,
  
  verificationDocuments: [{
    documentType: {
      type: String,
      enum: ['license', 'certification', 'degree', 'insurance', 'other']
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
  
  // Telemedicine
  telemedicineEnabled: {
    type: Boolean,
    default: false
  },
  
  telemedicinePlatforms: [{
    type: String,
    enum: ['zoom', 'teams', 'webex', 'custom', 'other']
  }],
  
  // Professional Notes (for admin use)
  adminNotes: {
    type: String,
    select: false
  },
  
  // Status and Flags
  status: {
    type: String,
    enum: ['pending', 'approved', 'suspended', 'rejected'],
    default: 'pending'
  },
  
  isAcceptingNewPatients: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
doctorSchema.index({ medicalLicenseNumber: 1 });
doctorSchema.index({ primarySpecialty: 1 });
doctorSchema.index({ 'hospitalAffiliations.hospital': 1 });
doctorSchema.index({ averageRating: -1 });
doctorSchema.index({ isAcceptingNewPatients: 1, status: 1 });

// Virtual to populate user information
doctorSchema.virtual('userInfo', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Method to check if license is expired
doctorSchema.methods.isLicenseExpired = function() {
  return this.licenseExpiryDate < new Date();
};

// Method to get current hospital affiliations
doctorSchema.methods.getCurrentHospitalAffiliations = function() {
  return this.hospitalAffiliations.filter(affiliation => 
    affiliation.isCurrentlyAffiliated && 
    (!affiliation.endDate || affiliation.endDate > new Date())
  );
};

// Method to get current clinic affiliations
doctorSchema.methods.getCurrentClinicAffiliations = function() {
  return this.clinicAffiliations.filter(affiliation => 
    affiliation.isCurrentlyAffiliated && 
    (!affiliation.endDate || affiliation.endDate > new Date())
  );
};

// Static method to find doctors by specialty
doctorSchema.statics.findBySpecialty = function(specialty) {
  return this.find({
    $or: [
      { primarySpecialty: specialty },
      { secondarySpecialties: specialty }
    ],
    status: 'approved',
    isAcceptingNewPatients: true
  }).populate('userId', 'firstName lastName email phone address profilePicture');
};

// Static method to find verified doctors
doctorSchema.statics.findVerified = function() {
  return this.find({
    isVerified: true,
    status: 'approved'
  }).populate('userId');
};

const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor;