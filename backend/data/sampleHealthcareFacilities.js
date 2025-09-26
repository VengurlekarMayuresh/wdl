const sampleHealthcareFacilities = [
  // Pharmacies
  {
    name: "Apollo Pharmacy",
    type: "pharmacy",
    subCategory: "retail_pharmacy",
    description: "Leading healthcare pharmacy chain offering prescription medications, healthcare products, and wellness services with 24/7 availability.",
    contact: {
      phone: {
        primary: "+91 98765 43210",
        secondary: "+91 98765 43211"
      },
      email: "mumbai.apollo@apollopharmacy.in",
      website: "https://www.apollopharmacy.in"
    },
    address: {
      street: "Shop No. 12, Green Valley Complex",
      area: "Sector 15, Vashi",
      city: "Navi Mumbai",
      state: "Maharashtra",
      pincode: "400703",
      landmark: "Near Vashi Railway Station",
      coordinates: {
        latitude: 19.0760,
        longitude: 73.0777
      }
    },
    operatingHours: [
      { day: "monday", isOpen: true, openTime: "08:00", closeTime: "23:00" },
      { day: "tuesday", isOpen: true, openTime: "08:00", closeTime: "23:00" },
      { day: "wednesday", isOpen: true, openTime: "08:00", closeTime: "23:00" },
      { day: "thursday", isOpen: true, openTime: "08:00", closeTime: "23:00" },
      { day: "friday", isOpen: true, openTime: "08:00", closeTime: "23:00" },
      { day: "saturday", isOpen: true, openTime: "08:00", closeTime: "23:00" },
      { day: "sunday", isOpen: true, openTime: "09:00", closeTime: "22:00" }
    ],
    is24x7: true,
    services: [
      {
        name: "Prescription Medicines",
        description: "Wide range of prescription medications",
        category: "pharmacy",
        isAvailable: true
      },
      {
        name: "Health Check-ups",
        description: "Basic health screening and diagnostic tests",
        price: 500,
        duration: 30,
        category: "diagnostic",
        isAvailable: true
      },
      {
        name: "Home Delivery",
        description: "Free home delivery for orders above ₹500",
        category: "pharmacy",
        isAvailable: true
      },
      {
        name: "Medicine Consultation",
        description: "Pharmacist consultation for medication queries",
        price: 100,
        duration: 15,
        category: "consultation",
        isAvailable: true
      }
    ],
    facilities: [
      "parking", "wheelchair_access", "air_conditioning", "digital_payment", "home_delivery"
    ],
    paymentMethods: ["cash", "card", "upi", "net_banking"],
    media: {
      logo: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      images: [
        {
          url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
          caption: "Apollo Pharmacy Store Front",
          type: "exterior"
        },
        {
          url: "https://images.unsplash.com/photo-1585435557343-3b092031d4ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
          caption: "Well-organized medicine shelves",
          type: "interior"
        },
        {
          url: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
          caption: "Professional pharmacy staff",
          type: "staff"
        }
      ]
    },
    rating: {
      overall: 4.5,
      cleanliness: 4.6,
      staff: 4.4,
      facilities: 4.3,
      valueForMoney: 4.5,
      totalReviews: 247
    },
    pharmacyFeatures: {
      homeDelivery: true,
      onlineOrdering: true,
      prescriptionUpload: true,
      medicineReminder: true
    },
    verification: {
      isVerified: true,
      verifiedBy: "Drug Control Administration",
      verificationDate: new Date('2024-01-15')
    },
    business: {
      establishedYear: 2018,
      licenseNumber: "DL-MH-2018-001234",
      ownership: "corporate"
    },
    status: "active",
    tags: ["24x7", "home-delivery", "prescription", "healthcare", "apollo"]
  },

  {
    name: "MedPlus Health Services",
    type: "pharmacy",
    subCategory: "retail_pharmacy",
    description: "Comprehensive healthcare pharmacy with diagnostic lab services, offering quality medicines and health products at affordable prices.",
    contact: {
      phone: {
        primary: "+91 98765 43220",
        secondary: "+91 98765 43221"
      },
      email: "andheri@medplus.in",
      website: "https://www.medplusmart.com"
    },
    address: {
      street: "Ground Floor, Shanti Apartment",
      area: "Andheri West",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400058",
      landmark: "Opposite Infinity Mall",
      coordinates: {
        latitude: 19.1136,
        longitude: 72.8697
      }
    },
    operatingHours: [
      { day: "monday", isOpen: true, openTime: "08:00", closeTime: "22:00" },
      { day: "tuesday", isOpen: true, openTime: "08:00", closeTime: "22:00" },
      { day: "wednesday", isOpen: true, openTime: "08:00", closeTime: "22:00" },
      { day: "thursday", isOpen: true, openTime: "08:00", closeTime: "22:00" },
      { day: "friday", isOpen: true, openTime: "08:00", closeTime: "22:00" },
      { day: "saturday", isOpen: true, openTime: "08:00", closeTime: "22:00" },
      { day: "sunday", isOpen: true, openTime: "09:00", closeTime: "21:00" }
    ],
    services: [
      {
        name: "Prescription Medicines",
        description: "All types of prescription and OTC medications",
        category: "pharmacy",
        isAvailable: true
      },
      {
        name: "Lab Tests",
        description: "Blood tests, urine tests, and basic diagnostics",
        price: 300,
        duration: 15,
        category: "diagnostic",
        isAvailable: true
      },
      {
        name: "Health Products",
        description: "Vitamins, supplements, and health accessories",
        category: "pharmacy",
        isAvailable: true
      }
    ],
    facilities: [
      "parking", "wheelchair_access", "lab_onsite", "digital_payment"
    ],
    paymentMethods: ["cash", "card", "upi"],
    media: {
      images: [
        {
          url: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
          caption: "MedPlus store exterior",
          type: "exterior"
        },
        {
          url: "https://images.unsplash.com/photo-1586549122536-c8c3cdc3b504?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
          caption: "Modern pharmacy interior",
          type: "interior"
        }
      ]
    },
    rating: {
      overall: 4.3,
      cleanliness: 4.2,
      staff: 4.4,
      facilities: 4.1,
      valueForMoney: 4.5,
      totalReviews: 156
    },
    pharmacyFeatures: {
      homeDelivery: true,
      onlineOrdering: false,
      prescriptionUpload: false
    },
    status: "active"
  },

  // Primary Care Clinics
  {
    name: "LifeCare Medical Center",
    type: "primary_care",
    subCategory: "general_clinic",
    description: "Comprehensive primary healthcare center providing general medicine, pediatrics, and preventive care services with experienced doctors.",
    contact: {
      phone: {
        primary: "+91 98765 43230",
        emergency: "+91 98765 43231"
      },
      email: "info@lifecaremc.com",
      website: "https://www.lifecaremc.com"
    },
    address: {
      street: "203, Business Hub",
      area: "Bandra East",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400051",
      landmark: "Near Bandra-Kurla Complex",
      coordinates: {
        latitude: 19.0596,
        longitude: 72.8656
      }
    },
    operatingHours: [
      { day: "monday", isOpen: true, openTime: "09:00", closeTime: "21:00" },
      { day: "tuesday", isOpen: true, openTime: "09:00", closeTime: "21:00" },
      { day: "wednesday", isOpen: true, openTime: "09:00", closeTime: "21:00" },
      { day: "thursday", isOpen: true, openTime: "09:00", closeTime: "21:00" },
      { day: "friday", isOpen: true, openTime: "09:00", closeTime: "21:00" },
      { day: "saturday", isOpen: true, openTime: "09:00", closeTime: "18:00" },
      { day: "sunday", isOpen: true, openTime: "10:00", closeTime: "17:00" }
    ],
    specialties: ["general_medicine", "pediatrics"],
    services: [
      {
        name: "General Consultation",
        description: "Consultation with general physician",
        price: 800,
        duration: 20,
        category: "consultation",
        isAvailable: true
      },
      {
        name: "Pediatric Care",
        description: "Specialized care for children",
        price: 900,
        duration: 25,
        category: "consultation",
        isAvailable: true
      },
      {
        name: "Health Check-up",
        description: "Comprehensive health screening",
        price: 2500,
        duration: 60,
        category: "diagnostic",
        isAvailable: true
      },
      {
        name: "Vaccination",
        description: "Adult and child immunizations",
        price: 1200,
        duration: 15,
        category: "treatment",
        isAvailable: true
      }
    ],
    facilities: [
      "parking", "wheelchair_access", "waiting_area", "pharmacy_onsite", "air_conditioning"
    ],
    paymentMethods: ["cash", "card", "upi", "insurance"],
    staff: {
      totalDoctors: 3,
      totalNurses: 2,
      totalStaff: 8
    },
    media: {
      images: [
        {
          url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
          caption: "Modern medical clinic exterior",
          type: "exterior"
        },
        {
          url: "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
          caption: "Clean and comfortable waiting area",
          type: "interior"
        },
        {
          url: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
          caption: "Well-equipped consultation room",
          type: "interior"
        }
      ]
    },
    rating: {
      overall: 4.7,
      cleanliness: 4.8,
      staff: 4.7,
      facilities: 4.6,
      valueForMoney: 4.5,
      totalReviews: 189
    },
    insurance: {
      accepted: [
        { provider: "Star Health", types: ["cashless", "reimbursement"] },
        { provider: "HDFC Ergo", types: ["cashless"] },
        { provider: "ICICI Lombard", types: ["reimbursement"] }
      ]
    },
    verification: {
      isVerified: true
    },
    status: "active"
  },

  // Hospital
  {
    name: "Sunrise Multi-Specialty Hospital",
    type: "hospital",
    subCategory: "multi_specialty_hospital",
    description: "State-of-the-art multi-specialty hospital with 150 beds, ICU, emergency services, and expert medical professionals across various specialties.",
    contact: {
      phone: {
        primary: "+91 98765 43240",
        emergency: "+91 98765 43241"
      },
      email: "info@sunrisehospital.com",
      website: "https://www.sunrisehospital.com"
    },
    address: {
      street: "Medical Complex, Sector 22",
      area: "Nerul",
      city: "Navi Mumbai",
      state: "Maharashtra",
      pincode: "400706",
      landmark: "Near Nerul Railway Station",
      coordinates: {
        latitude: 19.0330,
        longitude: 73.0297
      }
    },
    operatingHours: [
      { day: "monday", isOpen: true, openTime: "00:00", closeTime: "23:59" },
      { day: "tuesday", isOpen: true, openTime: "00:00", closeTime: "23:59" },
      { day: "wednesday", isOpen: true, openTime: "00:00", closeTime: "23:59" },
      { day: "thursday", isOpen: true, openTime: "00:00", closeTime: "23:59" },
      { day: "friday", isOpen: true, openTime: "00:00", closeTime: "23:59" },
      { day: "saturday", isOpen: true, openTime: "00:00", closeTime: "23:59" },
      { day: "sunday", isOpen: true, openTime: "00:00", closeTime: "23:59" }
    ],
    is24x7: true,
    specialties: [
      "cardiology", "neurology", "orthopedics", "pediatrics", "gynecology",
      "general_medicine", "general_surgery", "emergency_medicine", "radiology"
    ],
    departments: [
      {
        name: "Cardiology",
        head: "Dr. Rajesh Kumar",
        contactNumber: "+91 98765 43242",
        services: ["ECG", "Echo", "Angiography", "Cardiac Surgery"]
      },
      {
        name: "Emergency",
        head: "Dr. Priya Sharma",
        contactNumber: "+91 98765 43241",
        services: ["24x7 Emergency", "Trauma Care", "Ambulance"]
      }
    ],
    services: [
      {
        name: "Emergency Services",
        description: "24x7 emergency medical care",
        category: "emergency",
        isAvailable: true
      },
      {
        name: "Cardiac Consultation",
        description: "Expert cardiologist consultation",
        price: 1500,
        duration: 30,
        category: "consultation",
        isAvailable: true
      },
      {
        name: "Surgery",
        description: "Various surgical procedures",
        category: "treatment",
        isAvailable: true
      }
    ],
    facilities: [
      "parking", "wheelchair_access", "lift", "cafeteria", "pharmacy_onsite",
      "lab_onsite", "radiology", "icu", "operation_theater", "emergency_ward",
      "ambulance_service", "blood_bank"
    ],
    staff: {
      totalDoctors: 25,
      totalNurses: 60,
      totalStaff: 120
    },
    hospitalFeatures: {
      bedCapacity: {
        general: 80,
        icu: 20,
        private: 30,
        emergency: 20
      },
      emergencyServices: true,
      ambulanceService: true,
      onlineAppointment: true
    },
    media: {
      images: [
        {
          url: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
          caption: "Modern hospital building",
          type: "exterior"
        },
        {
          url: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
          caption: "Hospital reception and lobby",
          type: "reception"
        },
        {
          url: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
          caption: "Advanced medical equipment",
          type: "equipment"
        }
      ]
    },
    rating: {
      overall: 4.4,
      cleanliness: 4.3,
      staff: 4.5,
      facilities: 4.4,
      valueForMoney: 4.2,
      totalReviews: 342
    },
    paymentMethods: ["cash", "card", "upi", "net_banking", "insurance", "emi"],
    verification: {
      isVerified: true
    },
    status: "active"
  },

  // Diagnostic Lab
  {
    name: "Precision Diagnostics",
    type: "lab",
    subCategory: "diagnostic_lab",
    description: "Advanced diagnostic laboratory offering comprehensive pathology tests, imaging services, and health check-up packages with accurate and timely results.",
    contact: {
      phone: {
        primary: "+91 98765 43250"
      },
      email: "reports@precisiondiagnostics.com",
      website: "https://www.precisiondiagnostics.com"
    },
    address: {
      street: "Lab Complex, Plot 15",
      area: "Kopar Khairane",
      city: "Navi Mumbai",
      state: "Maharashtra",
      pincode: "400709",
      coordinates: {
        latitude: 19.1004,
        longitude: 73.0164
      }
    },
    operatingHours: [
      { day: "monday", isOpen: true, openTime: "07:00", closeTime: "19:00" },
      { day: "tuesday", isOpen: true, openTime: "07:00", closeTime: "19:00" },
      { day: "wednesday", isOpen: true, openTime: "07:00", closeTime: "19:00" },
      { day: "thursday", isOpen: true, openTime: "07:00", closeTime: "19:00" },
      { day: "friday", isOpen: true, openTime: "07:00", closeTime: "19:00" },
      { day: "saturday", isOpen: true, openTime: "07:00", closeTime: "17:00" },
      { day: "sunday", isOpen: true, openTime: "08:00", closeTime: "14:00" }
    ],
    services: [
      {
        name: "Blood Tests",
        description: "Complete blood count, biochemistry panels",
        price: 800,
        duration: 15,
        category: "diagnostic",
        isAvailable: true
      },
      {
        name: "X-Ray",
        description: "Digital X-ray imaging",
        price: 400,
        duration: 10,
        category: "diagnostic",
        isAvailable: true
      },
      {
        name: "ECG",
        description: "Electrocardiogram",
        price: 300,
        duration: 15,
        category: "diagnostic",
        isAvailable: true
      },
      {
        name: "Health Package",
        description: "Comprehensive health check-up",
        price: 3500,
        duration: 60,
        category: "diagnostic",
        isAvailable: true
      }
    ],
    facilities: [
      "parking", "wheelchair_access", "air_conditioning", "waiting_area"
    ],
    media: {
      images: [
        {
          url: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
          caption: "Modern diagnostic laboratory",
          type: "interior"
        },
        {
          url: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
          caption: "Advanced laboratory equipment",
          type: "equipment"
        }
      ]
    },
    rating: {
      overall: 4.6,
      cleanliness: 4.7,
      staff: 4.5,
      facilities: 4.4,
      valueForMoney: 4.6,
      totalReviews: 98
    },
    status: "active"
  }
];

export default sampleHealthcareFacilities;