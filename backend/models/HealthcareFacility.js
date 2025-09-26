import mongoose from 'mongoose';

const healthcareFacilitySchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  type: {
    type: String,
    required: true,
    enum: ['pharmacy', 'clinic', 'hospital', 'lab', 'diagnostic_center', 'primary_care']
  },
  
  subCategory: {
    type: String,
    enum: [
      // Pharmacy types
      'retail_pharmacy', 'hospital_pharmacy', 'online_pharmacy', 'specialty_pharmacy',
      // Clinic types  
      'general_clinic', 'specialty_clinic', 'urgent_care', 'walk_in_clinic',
      // Hospital types
      'general_hospital', 'specialty_hospital', 'teaching_hospital', 'multi_specialty_hospital',
      // Lab types
      'pathology_lab', 'diagnostic_lab', 'imaging_center', 'blood_bank'
    ]
  },
  
  description: {
    type: String,
    maxLength: 1000
  },
  
  // Contact Information
  contact: {
    phone: {
      primary: { type: String, required: true },
      secondary: { type: String },
      emergency: { type: String }
    },
    email: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Please enter a valid email address'
      }
    },
    website: { type: String },
    socialMedia: {
      facebook: String,
      instagram: String,
      twitter: String
    }
  },
  
  // Address Information
  address: {
    street: { type: String, required: true },
    area: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true, index: true },
    country: { type: String, default: 'India' },
    landmark: { type: String },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number }
    }
  },
  
  // Operating Hours
  operatingHours: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      required: true
    },
    isOpen: { type: Boolean, default: true },
    openTime: { type: String }, // Format: "09:00"
    closeTime: { type: String }, // Format: "22:00"
    breakTime: {
      start: String,
      end: String
    }
  }],
  
  is24x7: {
    type: Boolean,
    default: false
  },
  
  // Services and Specialties
  services: [{
    name: { type: String, required: true },
    description: String,
    price: Number,
    duration: Number, // in minutes
    isAvailable: { type: Boolean, default: true },
    category: {
      type: String,
      enum: ['consultation', 'diagnostic', 'treatment', 'pharmacy', 'emergency', 'other']
    }
  }],
  
  specialties: [{
    type: String,
    enum: [
      'cardiology', 'neurology', 'orthopedics', 'pediatrics', 'gynecology',
      'dermatology', 'ophthalmology', 'ent', 'urology', 'gastroenterology',
      'endocrinology', 'nephrology', 'pulmonology', 'oncology', 'psychiatry',
      'general_medicine', 'general_surgery', 'emergency_medicine', 'radiology',
      'pathology', 'anesthesiology', 'dentistry', 'physiotherapy'
    ]
  }],
  
  // Departments (for hospitals)
  departments: [{
    name: String,
    head: String,
    contactNumber: String,
    services: [String]
  }],
  
  // Staff Information
  staff: {
    totalDoctors: { type: Number, default: 0 },
    totalNurses: { type: Number, default: 0 },
    totalStaff: { type: Number, default: 0 },
    doctors: [{
      doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor'
      },
      speciality: String,
      designation: String,
      isActive: { type: Boolean, default: true }
    }]
  },
  
  // Facilities and Amenities
  facilities: [{
    type: String,
    enum: [
      'parking', 'wheelchair_access', 'lift', 'cafeteria', 'waiting_area',
      'pharmacy_onsite', 'lab_onsite', 'radiology', 'icu', 'operation_theater',
      'emergency_ward', 'ambulance_service', 'blood_bank', 'maternity_ward',
      'pediatric_ward', 'dialysis_center', 'physiotherapy', 'air_conditioning',
      'wifi', 'atm', 'restroom', 'prayer_room'
    ]
  }],
  
  // Equipment and Technology
  equipment: [{
    name: String,
    model: String,
    manufacturer: String,
    yearOfInstallation: Number,
    maintenanceDate: Date,
    status: {
      type: String,
      enum: ['working', 'maintenance', 'out_of_order'],
      default: 'working'
    }
  }],
  
  // Insurance and Payment
  insurance: {
    accepted: [{
      provider: String,
      types: [String] // ['cashless', 'reimbursement']
    }],
    empaneled: [{
      scheme: String, // 'CGHS', 'ESIC', 'Ayushman Bharat'
      status: String,
      validTill: Date
    }]
  },
  
  paymentMethods: [{
    type: String,
    enum: ['cash', 'card', 'upi', 'net_banking', 'insurance', 'emi']
  }],
  
  // Media and Branding
  media: {
    logo: String,
    images: [{
      url: { type: String, required: true },
      caption: String,
      type: { 
        type: String, 
        enum: ['exterior', 'interior', 'equipment', 'staff', 'ward', 'reception'],
        default: 'interior'
      }
    }],
    videos: [{
      url: String,
      title: String,
      description: String
    }]
  },
  
  // User Association (owner/manager)
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  managers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: String,
    permissions: [String]
  }],
  
  // Ratings and Reviews
  rating: {
    overall: { type: Number, default: 0, min: 0, max: 5 },
    cleanliness: { type: Number, default: 0, min: 0, max: 5 },
    staff: { type: Number, default: 0, min: 0, max: 5 },
    facilities: { type: Number, default: 0, min: 0, max: 5 },
    valueForMoney: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 }
  },
  
  reviews: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: { type: Number, min: 1, max: 5 },
    review: String,
    aspects: {
      cleanliness: Number,
      staff: Number,
      facilities: Number,
      valueForMoney: Number
    },
    date: { type: Date, default: Date.now },
    isVerified: { type: Boolean, default: false }
  }],
  
  // Verification and Compliance
  verification: {
    isVerified: { type: Boolean, default: false },
    verifiedBy: String,
    verificationDate: Date,
    documents: [{
      type: {
        type: String,
        enum: ['license', 'registration', 'tax_certificate', 'noc', 'pollution_certificate', 'fire_certificate']
      },
      number: String,
      url: String,
      issueDate: Date,
      expiryDate: Date,
      issuingAuthority: String
    }]
  },
  
  // Business Information
  business: {
    establishedYear: Number,
    registrationNumber: {
      type: String,
      unique: true,
      sparse: true
    },
    licenseNumber: String,
    gstNumber: String,
    panNumber: String,
    ownership: {
      type: String,
      enum: ['private', 'government', 'trust', 'society', 'partnership', 'corporate']
    }
  },
  
  // Operational Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'under_maintenance', 'temporarily_closed'],
    default: 'active'
  },
  
  // Features for different facility types
  pharmacyFeatures: {
    homeDelivery: { type: Boolean, default: false },
    onlineOrdering: { type: Boolean, default: false },
    prescriptionUpload: { type: Boolean, default: false },
    medicineReminder: { type: Boolean, default: false },
    inventoryManagement: { type: Boolean, default: false }
  },
  
  hospitalFeatures: {
    bedCapacity: {
      general: { type: Number, default: 0 },
      icu: { type: Number, default: 0 },
      private: { type: Number, default: 0 },
      emergency: { type: Number, default: 0 }
    },
    emergencyServices: { type: Boolean, default: false },
    ambulanceService: { type: Boolean, default: false },
    onlineAppointment: { type: Boolean, default: false }
  },
  
  // Search and Analytics
  tags: [String],
  searchKeywords: [String],
  
  analytics: {
    totalViews: { type: Number, default: 0 },
    totalBookings: { type: Number, default: 0 },
    monthlyPatients: { type: Number, default: 0 },
    lastVisitDate: Date
  },
  
  // Additional Information
  awards: [{
    title: String,
    issuedBy: String,
    year: Number,
    description: String
  }],
  
  affiliations: [{
    organization: String,
    type: String, // 'medical_college', 'hospital_chain', 'professional_body'
    since: Date
  }]
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
healthcareFacilitySchema.index({ 'address.pincode': 1 });
healthcareFacilitySchema.index({ 'address.city': 1 });
healthcareFacilitySchema.index({ type: 1 });
healthcareFacilitySchema.index({ specialties: 1 });
healthcareFacilitySchema.index({ name: 'text', description: 'text', tags: 'text' });
healthcareFacilitySchema.index({ 'address.coordinates': '2dsphere' });
healthcareFacilitySchema.index({ 'rating.overall': -1 });

// Virtual for full address
healthcareFacilitySchema.virtual('fullAddress').get(function() {
  const parts = [
    this.address.street,
    this.address.area,
    this.address.city,
    this.address.state,
    this.address.pincode
  ].filter(Boolean);
  return parts.join(', ');
});

// Virtual for current status
healthcareFacilitySchema.virtual('isCurrentlyOpen').get(function() {
  if (this.is24x7) return true;
  
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const currentTime = now.toTimeString().slice(0, 5);
  
  const todaySchedule = this.operatingHours.find(oh => oh.day === currentDay);
  
  if (!todaySchedule || !todaySchedule.isOpen) return false;
  
  return currentTime >= todaySchedule.openTime && currentTime <= todaySchedule.closeTime;
});

// Method to calculate distance
healthcareFacilitySchema.methods.calculateDistance = function(lat, lng) {
  if (!this.address.coordinates.latitude || !this.address.coordinates.longitude) {
    return null;
  }
  
  const R = 6371; // Earth's radius in km
  const dLat = (this.address.coordinates.latitude - lat) * Math.PI / 180;
  const dLng = (this.address.coordinates.longitude - lng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat * Math.PI / 180) * Math.cos(this.address.coordinates.latitude * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Static method to find nearby facilities
healthcareFacilitySchema.statics.findNearby = function(lat, lng, maxDistance = 10, type = null) {
  const matchStage = {
    status: 'active',
    'address.coordinates.latitude': { $exists: true, $ne: null },
    'address.coordinates.longitude': { $exists: true, $ne: null }
  };
  
  if (type) {
    matchStage.type = type;
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $addFields: {
        distance: {
          $multiply: [
            6371,
            {
              $acos: {
                $add: [
                  {
                    $multiply: [
                      { $sin: { $multiply: [{ $divide: [{ $subtract: ['$address.coordinates.latitude', lat] }, 180] }, Math.PI] } },
                      { $sin: { $multiply: [{ $divide: [{ $subtract: ['$address.coordinates.longitude', lng] }, 180] }, Math.PI] } }
                    ]
                  },
                  {
                    $multiply: [
                      { $cos: { $multiply: [lat, Math.PI, { $divide: [1, 180] }] } },
                      { $cos: { $multiply: ['$address.coordinates.latitude', Math.PI, { $divide: [1, 180] }] } },
                      { $cos: { $multiply: [{ $subtract: ['$address.coordinates.longitude', lng] }, Math.PI, { $divide: [1, 180] }] } }
                    ]
                  }
                ]
              }
            }
          ]
        }
      }
    },
    { $match: { distance: { $lte: maxDistance } } },
    { $sort: { distance: 1 } }
  ]);
};

export default mongoose.model('HealthcareFacility', healthcareFacilitySchema);