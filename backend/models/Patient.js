import mongoose from 'mongoose';
import User from './User.js';

const patientSchema = new mongoose.Schema({
  // Reference to User model
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Patient Identification
  patientId: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // Emergency Contact Information
  emergencyContacts: [{
    name: {
      type: String,
      required: true
    },
    relationship: {
      type: String,
      required: true,
      enum: ['spouse', 'parent', 'child', 'sibling', 'friend', 'other']
    },
    phone: {
      type: String,
      required: true
    },
    email: String,
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
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  
  // Insurance Information
  insurance: {
    provider: String,
    policyNumber: String,
    groupNumber: String,
    policyHolderName: String,
    policyHolderDOB: Date,
    relationshipToPolicyHolder: {
      type: String,
      enum: ['self', 'spouse', 'child', 'other'],
      default: 'self'
    },
    effectiveDate: Date,
    expirationDate: Date,
    copay: Number,
    deductible: Number,
    isActive: {
      type: Boolean,
      default: true
    }
  },
  
  // Medical History
  medicalHistory: {
    // Current Conditions
    currentConditions: [{
      condition: {
        type: String,
        required: true
      },
      diagnosisDate: Date,
      status: {
        type: String,
        enum: ['active', 'resolved', 'chronic', 'managed'],
        default: 'active'
      },
      severity: {
        type: String,
        enum: ['mild', 'moderate', 'severe'],
        default: 'moderate'
      },
      notes: String,
      treatingPhysician: String
    }],
    
    // Past Medical History
    pastConditions: [{
      condition: {
        type: String,
        required: true
      },
      diagnosisDate: Date,
      resolutionDate: Date,
      treatment: String,
      notes: String
    }],
    
    // Surgeries and Procedures
    surgeries: [{
      procedure: {
        type: String,
        required: true
      },
      date: Date,
      hospital: String,
      surgeon: String,
      complications: String,
      notes: String
    }],
    
    // Hospitalizations
    hospitalizations: [{
      reason: {
        type: String,
        required: true
      },
      hospital: String,
      admissionDate: Date,
      dischargeDate: Date,
      attendingPhysician: String,
      notes: String
    }]
  },
  
  // Medications
  medications: {
    current: [{
      name: {
        type: String,
        required: true
      },
      dosage: String,
      frequency: String,
      // Detailed schedule based on frequency
      schedule: [{
        time: String, // e.g., "08:00"
        mealRelation: {
          type: String,
          enum: ['pre-breakfast','post-breakfast','pre-lunch','post-lunch','pre-dinner','post-dinner','with-meal','empty-stomach','other'],
        },
        quantity: String // e.g., "1 tablet" or "5 ml"
      }],
      route: {
        type: String,
        enum: ['oral', 'injection', 'topical', 'inhalation', 'other'],
        default: 'oral'
      },
      startDate: Date,
      prescribedBy: String,
      reason: String,
      notes: String,
      isActive: {
        type: Boolean,
        default: true
      },
      createdByDoctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }
    }],
    
    past: [{
      name: {
        type: String,
        required: true
      },
      dosage: String,
      frequency: String,
      route: {
        type: String,
        enum: ['oral', 'injection', 'topical', 'inhalation', 'other'],
        default: 'oral'
      },
      startDate: Date,
      endDate: Date,
      prescribedBy: String,
      reason: String,
      reasonForStopping: String,
      notes: String
    }]
  },
  
  // Allergies
  allergies: [{
    allergen: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['medication', 'food', 'environmental', 'other'],
      required: true
    },
    reaction: {
      type: String,
      required: true
    },
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe', 'life-threatening'],
      required: true
    },
    notes: String,
    dateIdentified: Date
  }],
  
  // Family History
  familyHistory: [{
    relative: {
      type: String,
      required: true,
      enum: ['mother', 'father', 'sister', 'brother', 'maternal_grandmother', 
             'maternal_grandfather', 'paternal_grandmother', 'paternal_grandfather',
             'aunt', 'uncle', 'cousin', 'child', 'other']
    },
    condition: {
      type: String,
      required: true
    },
    ageAtDiagnosis: Number,
    ageAtDeath: Number,
    causeOfDeath: String,
    notes: String
  }],
  
  // Social History
  socialHistory: {
    smoking: {
      status: {
        type: String,
        enum: ['never', 'current', 'former'],
        default: 'never'
      },
      packsPerDay: Number,
      yearsSmoked: Number,
      quitDate: Date
    },
    alcohol: {
      status: {
        type: String,
        enum: ['never', 'occasional', 'moderate', 'heavy'],
        default: 'never'
      },
      drinksPerWeek: Number,
      type: [String] // wine, beer, spirits
    },
    drugs: {
      status: {
        type: String,
        enum: ['never', 'past', 'current'],
        default: 'never'
      },
      substances: [String],
      notes: String
    },
    exercise: {
      frequency: {
        type: String,
        enum: ['none', 'rarely', '1-2_times_week', '3-4_times_week', '5+_times_week'],
        default: 'none'
      },
      type: [String],
      duration: String
    },
    diet: {
      type: {
        type: String,
        enum: ['omnivore', 'vegetarian', 'vegan', 'keto', 'mediterranean', 'other'],
        default: 'omnivore'
      },
      restrictions: [String],
      notes: String
    },
    occupation: String,
    maritalStatus: {
      type: String,
      enum: ['single', 'married', 'divorced', 'widowed', 'separated', 'domestic_partnership']
    },
    children: Number,
    education: {
      type: String,
      enum: ['less_than_high_school', 'high_school', 'some_college', 'bachelors', 'masters', 'doctorate', 'other']
    }
  },
  
  // Vital Signs (most recent)
  vitalSigns: {
    height: {
      value: Number, // in cm
      unit: {
        type: String,
        default: 'cm'
      },
      lastUpdated: Date
    },
    weight: {
      value: Number, // in kg
      unit: {
        type: String,
        default: 'kg'
      },
      lastUpdated: Date
    },
    bloodPressure: {
      systolic: Number,
      diastolic: Number,
      lastUpdated: Date
    },
    heartRate: {
      value: Number,
      lastUpdated: Date
    },
    temperature: {
      value: Number, // in Celsius
      unit: {
        type: String,
        default: 'C'
      },
      lastUpdated: Date
    },
    respiratoryRate: {
      value: Number,
      lastUpdated: Date
    },
    oxygenSaturation: {
      value: Number,
      lastUpdated: Date
    }
  },
  
  // Custom/Additional Vitals (for metrics not in standard vital signs)
  customVitals: {
    bloodSugar: {
      value: Number,
      unit: {
        type: String,
        default: 'mg/dL'
      },
      lastUpdated: Date
    },
    cholesterol: {
      total: Number,
      hdl: Number,
      ldl: Number,
      triglycerides: Number,
      unit: {
        type: String,
        default: 'mg/dL'
      },
      lastUpdated: Date
    },
    hba1c: {
      value: Number,
      unit: {
        type: String,
        default: '%'
      },
      lastUpdated: Date
    }
  },
  
  // Healthcare Team
  healthcareTeam: [{
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor'
    },
    relationship: {
      type: String,
      enum: ['primary_care', 'specialist', 'consultant'],
      required: true
    },
    specialty: String,
    isPrimary: {
      type: Boolean,
      default: false
    },
    startDate: Date,
    endDate: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Preferences and Settings
  preferences: {
    communicationMethod: {
      type: String,
      enum: ['email', 'phone', 'sms', 'portal'],
      default: 'email'
    },
    appointmentReminders: {
      type: Boolean,
      default: true
    },
    medicationReminders: {
      type: Boolean,
      default: false
    },
    shareWithFamily: {
      type: Boolean,
      default: false
    },
    language: {
      type: String,
      default: 'English'
    },
    accessibility: {
      needsInterpreter: {
        type: Boolean,
        default: false
      },
      interpreterLanguage: String,
      mobilityAids: [String],
      visualImpairment: {
        type: Boolean,
        default: false
      },
      hearingImpairment: {
        type: Boolean,
        default: false
      }
    }
  },
  
  // Advance Directives
  advanceDirectives: {
    hasLivingWill: {
      type: Boolean,
      default: false
    },
    hasPowerOfAttorney: {
      type: Boolean,
      default: false
    },
    powerOfAttorneyName: String,
    powerOfAttorneyContact: String,
    organDonor: {
      type: String,
      enum: ['yes', 'no', 'undecided'],
      default: 'undecided'
    },
    notes: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual to calculate BMI
patientSchema.virtual('bmi').get(function() {
  const weight = this.vitalSigns?.weight?.value;
  const height = this.vitalSigns?.height?.value;
  
  if (!weight || !height) return null;
  
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  return Math.round(bmi * 10) / 10;
});

// Virtual to categorize BMI
patientSchema.virtual('bmiCategory').get(function() {
  const bmi = this.bmi;
  if (!bmi) return null;
  
  if (bmi < 18.5) return 'Underweight';
  if (bmi >= 18.5 && bmi < 25) return 'Normal weight';
  if (bmi >= 25 && bmi < 30) return 'Overweight';
  return 'Obese';
});

// Virtual to populate user information
patientSchema.virtual('userInfo', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Indexes for better query performance
patientSchema.index({ patientId: 1 });
patientSchema.index({ 'healthcareTeam.doctorId': 1 });
patientSchema.index({ 'insurance.provider': 1 });
patientSchema.index({ createdAt: -1 });

// Method to get primary care physician
patientSchema.methods.getPrimaryCarePhysician = function() {
  return this.healthcareTeam.find(member => 
    member.relationship === 'primary_care' && 
    member.isActive && 
    (!member.endDate || member.endDate > new Date())
  );
};

// Method to get active medications
patientSchema.methods.getActiveMedications = function() {
  return this.medications.current.filter(med => med.isActive);
};

// Method to get severe allergies
patientSchema.methods.getSevereAllergies = function() {
  return this.allergies.filter(allergy => 
    allergy.severity === 'severe' || allergy.severity === 'life-threatening'
  );
};

// Method to get primary emergency contact
patientSchema.methods.getPrimaryEmergencyContact = function() {
  return this.emergencyContacts.find(contact => contact.isPrimary) || 
         this.emergencyContacts[0];
};

// Static method to find patients by doctor
patientSchema.statics.findByDoctor = function(doctorId) {
  return this.find({
    'healthcareTeam.doctorId': doctorId,
    'healthcareTeam.isActive': true
  }).populate('userId', 'firstName lastName email phone dateOfBirth');
};

// Pre-save hook to auto-generate patient ID
patientSchema.pre('save', async function(next) {
  if (this.isNew && !this.patientId) {
    const count = await mongoose.model('Patient').countDocuments();
    this.patientId = `PAT${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

const Patient = mongoose.model('Patient', patientSchema);

export default Patient;