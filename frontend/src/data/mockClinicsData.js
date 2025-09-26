// Mock data for Clinics
export const mockClinicsData = {
  success: true,
  data: [
    {
      _id: "mock-clinic-001",
      name: "Manhattan Eye, Ear and Throat Clinic",
      type: "clinic",
      providerType: "clinic",
      subCategory: "specialty_clinic",
      fullAddress: "210 E 64th Street, Upper East Side",
      address: {
        street: "210 E 64th Street",
        city: "New York",
        state: "NY",
        pincode: "10065",
        country: "USA"
      },
      phone: "+1-212-838-9200",
      rating: { overall: 4.8, totalReviews: 324 },
      services: [
        { name: "Ophthalmology" },
        { name: "ENT Surgery" },
        { name: "Plastic Surgery" },
        { name: "Audiology" },
        { name: "Allergy Treatment" },
        { name: "Facial Reconstruction" }
      ],
      operatingHours: {
        monday: "7:00 AM - 6:00 PM",
        tuesday: "7:00 AM - 6:00 PM",
        wednesday: "7:00 AM - 6:00 PM",
        thursday: "7:00 AM - 6:00 PM",
        friday: "7:00 AM - 6:00 PM",
        saturday: "8:00 AM - 4:00 PM",
        sunday: "Closed"
      },
      is24x7: false,
      specialties: ["Ophthalmology", "Otolaryngology", "Plastic Surgery"],
      acceptedInsurance: ["Most major insurances", "Medicare", "Vision insurance"],
      languages: ["English", "Spanish", "French"],
      clinicType: "Specialty",
      appointmentRequired: true,
      media: {
        images: [
          { url: "https://images.unsplash.com/photo-1666214280557-f1b5022eb634?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" }
        ]
      }
    },
    {
      _id: "mock-clinic-002", 
      name: "CityMD Urgent Care - Chelsea",
      type: "clinic",
      providerType: "clinic",
      subCategory: "urgent_care",
      fullAddress: "200 W 23rd Street, Chelsea",
      address: {
        street: "200 W 23rd Street",
        city: "New York",
        state: "NY",
        pincode: "10011",
        country: "USA"
      },
      phone: "+1-212-255-3900",
      rating: { overall: 4.2, totalReviews: 456 },
      services: [
        { name: "Walk-in Care" },
        { name: "Minor Injuries" },
        { name: "X-rays" },
        { name: "Lab Tests" },
        { name: "Vaccinations" },
        { name: "Physical Exams" },
        { name: "COVID Testing" }
      ],
      operatingHours: {
        monday: "8:00 AM - 10:00 PM",
        tuesday: "8:00 AM - 10:00 PM",
        wednesday: "8:00 AM - 10:00 PM",
        thursday: "8:00 AM - 10:00 PM",
        friday: "8:00 AM - 10:00 PM",
        saturday: "9:00 AM - 9:00 PM",
        sunday: "9:00 AM - 9:00 PM"
      },
      is24x7: false,
      specialties: ["Urgent Care", "Emergency Medicine", "Family Medicine"],
      acceptedInsurance: ["Most major insurances", "Medicare", "Medicaid", "No insurance welcome"],
      languages: ["English", "Spanish"],
      clinicType: "Urgent Care",
      appointmentRequired: false,
      media: {
        images: [
          { url: "https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" }
        ]
      }
    },
    {
      _id: "mock-clinic-003",
      name: "Upper West Side Cardiology Clinic", 
      type: "clinic",
      providerType: "clinic",
      subCategory: "specialty_clinic",
      fullAddress: "2315 Broadway, Upper West Side",
      address: {
        street: "2315 Broadway",
        city: "New York",
        state: "NY",
        pincode: "10024",
        country: "USA"
      },
      phone: "+1-212-362-3333",
      rating: { overall: 4.7, totalReviews: 287 },
      services: [
        { name: "Cardiology Consultation" },
        { name: "EKG/ECG Testing" },
        { name: "Stress Testing" },
        { name: "Echocardiogram" },
        { name: "Holter Monitoring" },
        { name: "Cardiac Catheterization" }
      ],
      operatingHours: {
        monday: "8:00 AM - 5:00 PM",
        tuesday: "8:00 AM - 5:00 PM",
        wednesday: "8:00 AM - 5:00 PM",
        thursday: "8:00 AM - 7:00 PM",
        friday: "8:00 AM - 5:00 PM",
        saturday: "9:00 AM - 2:00 PM",
        sunday: "Closed"
      },
      is24x7: false,
      specialties: ["Cardiology", "Interventional Cardiology"],
      acceptedInsurance: ["Most major insurances", "Medicare", "Heart-specific plans"],
      languages: ["English", "Spanish", "Italian"],
      clinicType: "Specialty",
      appointmentRequired: true,
      media: {
        images: [
          { url: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" }
        ]
      }
    },
    {
      _id: "mock-clinic-004",
      name: "Brooklyn Heights Women's Health Clinic",
      type: "clinic", 
      providerType: "clinic",
      subCategory: "specialty_clinic",
      fullAddress: "142 Joralemon Street, Brooklyn Heights",
      address: {
        street: "142 Joralemon Street",
        city: "Brooklyn",
        state: "NY",
        pincode: "11201",
        country: "USA"
      },
      phone: "+1-718-624-6500",
      rating: { overall: 4.6, totalReviews: 412 },
      services: [
        { name: "Gynecology" },
        { name: "Obstetrics" },
        { name: "Prenatal Care" },
        { name: "Family Planning" },
        { name: "Mammograms" },
        { name: "Pap Smears" },
        { name: "Menopause Treatment" }
      ],
      operatingHours: {
        monday: "7:00 AM - 7:00 PM",
        tuesday: "7:00 AM - 7:00 PM",
        wednesday: "7:00 AM - 7:00 PM",
        thursday: "7:00 AM - 7:00 PM",
        friday: "7:00 AM - 6:00 PM",
        saturday: "8:00 AM - 4:00 PM",
        sunday: "10:00 AM - 2:00 PM"
      },
      is24x7: false,
      specialties: ["Gynecology", "Obstetrics", "Women's Health"],
      acceptedInsurance: ["Most major insurances", "Medicare", "Medicaid", "Women's health plans"],
      languages: ["English", "Spanish", "Arabic"],
      clinicType: "Specialty",
      appointmentRequired: true,
      media: {
        images: [
          { url: "https://images.unsplash.com/photo-1516549655169-df83a0774514?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" }
        ]
      }
    },
    {
      _id: "mock-clinic-005",
      name: "Queens Dermatology & Skin Care",
      type: "clinic",
      providerType: "clinic", 
      subCategory: "specialty_clinic",
      fullAddress: "789 Northern Blvd, Woodside",
      address: {
        street: "789 Northern Blvd",
        city: "Queens",
        state: "NY",
        pincode: "11377",
        country: "USA"
      },
      phone: "+1-718-555-SKIN",
      rating: { overall: 4.5, totalReviews: 298 },
      services: [
        { name: "General Dermatology" },
        { name: "Cosmetic Dermatology" },
        { name: "Skin Cancer Screening" },
        { name: "Acne Treatment" },
        { name: "Botox & Fillers" },
        { name: "Laser Treatments" }
      ],
      operatingHours: {
        monday: "9:00 AM - 6:00 PM",
        tuesday: "9:00 AM - 6:00 PM",
        wednesday: "9:00 AM - 6:00 PM",
        thursday: "9:00 AM - 8:00 PM",
        friday: "9:00 AM - 6:00 PM",
        saturday: "9:00 AM - 4:00 PM",
        sunday: "Closed"
      },
      is24x7: false,
      specialties: ["Dermatology", "Cosmetic Dermatology", "Dermatopathology"],
      acceptedInsurance: ["Most major insurances", "Cosmetic procedures cash pay"],
      languages: ["English", "Spanish", "Korean"],
      clinicType: "Specialty",
      appointmentRequired: true,
      media: {
        images: [
          { url: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" }
        ]
      }
    }
  ]
};

// Generate additional clinics
const additionalClinics = [];
const clinicNeighborhoods = [
  { name: 'Tribeca', pincode: '10013', city: 'New York' },
  { name: 'SoHo', pincode: '10012', city: 'New York' },
  { name: 'East Village', pincode: '10003', city: 'New York' },
  { name: 'West Village', pincode: '10014', city: 'New York' },
  { name: 'Murray Hill', pincode: '10016', city: 'New York' },
  { name: 'Gramercy', pincode: '10003', city: 'New York' },
  { name: 'Financial District', pincode: '10005', city: 'New York' },
  { name: 'Chinatown', pincode: '10013', city: 'New York' },
  { name: 'Park Slope', pincode: '11215', city: 'Brooklyn' },
  { name: 'Williamsburg', pincode: '11211', city: 'Brooklyn' },
  { name: 'DUMBO', pincode: '11201', city: 'Brooklyn' },
  { name: 'Greenpoint', pincode: '11222', city: 'Brooklyn' },
  { name: 'Astoria', pincode: '11102', city: 'Queens' },
  { name: 'Long Island City', pincode: '11101', city: 'Queens' },
  { name: 'Jackson Heights', pincode: '11372', city: 'Queens' }
];

const clinicTypes = [
  { 
    subCategory: 'urgent_care', 
    name: 'Urgent Care', 
    services: ['Walk-in Care', 'Minor Injuries', 'X-rays', 'Lab Tests'],
    appointmentRequired: false,
    type: 'Urgent Care'
  },
  { 
    subCategory: 'specialty_clinic', 
    name: 'Specialty Clinic', 
    services: ['Specialist Consultation', 'Diagnostic Services', 'Treatment Planning'],
    appointmentRequired: true,
    type: 'Specialty'
  },
  { 
    subCategory: 'outpatient_clinic', 
    name: 'Outpatient Clinic', 
    services: ['Outpatient Procedures', 'Follow-up Care', 'Rehabilitation'],
    appointmentRequired: true,
    type: 'Outpatient'
  },
  { 
    subCategory: 'diagnostic_clinic', 
    name: 'Diagnostic Center', 
    services: ['MRI', 'CT Scans', 'Ultrasound', 'Blood Tests'],
    appointmentRequired: true,
    type: 'Diagnostic'
  }
];

const specialtyTypes = ['Orthopedic', 'Dermatology', 'Cardiology', 'Mental Health', 'Physical Therapy', 'Dental', 'Ophthalmology', 'ENT', 'Gastroenterology'];

for (let i = 0; i < 20; i++) { // Adding 20 more to reach 25 total
  const neighborhood = clinicNeighborhoods[i % clinicNeighborhoods.length];
  const clinicType = clinicTypes[i % clinicTypes.length];
  const specialty = specialtyTypes[i % specialtyTypes.length];
  const clinicNumber = String(i + 6).padStart(3, '0');
  
  const clinic = {
    _id: `mock-clinic-${clinicNumber}`,
    name: `${neighborhood.name} ${specialty} ${clinicType.name}`,
    type: "clinic",
    providerType: "clinic",
    subCategory: clinicType.subCategory,
    fullAddress: `${300 + i} ${neighborhood.name} Street, ${neighborhood.name}`,
    address: {
      street: `${300 + i} ${neighborhood.name} Street`,
      city: neighborhood.city,
      state: 'NY',
      pincode: neighborhood.pincode,
      country: 'USA'
    },
    phone: `+1-${neighborhood.city === 'New York' ? '212' : neighborhood.city === 'Brooklyn' ? '718' : '347'}-${Math.floor(100 + Math.random() * 900)}-${String(Math.floor(1000 + Math.random() * 9000))}`,
    rating: { 
      overall: parseFloat((4.0 + Math.random() * 1.0).toFixed(1)), 
      totalReviews: Math.floor(50 + Math.random() * 400) 
    },
    services: clinicType.services.concat([`${specialty} Consultation`, 'Patient Education']).map(name => ({ name })),
    operatingHours: clinicType.subCategory === 'urgent_care' ? {
      monday: '8:00 AM - 10:00 PM',
      tuesday: '8:00 AM - 10:00 PM',
      wednesday: '8:00 AM - 10:00 PM',
      thursday: '8:00 AM - 10:00 PM',
      friday: '8:00 AM - 10:00 PM',
      saturday: '9:00 AM - 8:00 PM',
      sunday: '9:00 AM - 6:00 PM'
    } : {
      monday: '9:00 AM - 6:00 PM',
      tuesday: '9:00 AM - 6:00 PM',
      wednesday: '9:00 AM - 6:00 PM',
      thursday: '9:00 AM - 7:00 PM',
      friday: '9:00 AM - 6:00 PM',
      saturday: '9:00 AM - 3:00 PM',
      sunday: i % 5 === 0 ? '10:00 AM - 2:00 PM' : 'Closed'
    },
    is24x7: false,
    specialties: [specialty, clinicType.subCategory === 'urgent_care' ? 'Urgent Care' : 'Specialty Medicine'],
    acceptedInsurance: ['Most major insurances', 'Medicare', clinicType.subCategory === 'urgent_care' ? 'Walk-in payments' : 'Specialty insurance plans'],
    languages: ['English', i % 3 === 0 ? 'Spanish' : i % 3 === 1 ? 'Chinese' : 'Russian'],
    clinicType: clinicType.type,
    appointmentRequired: clinicType.appointmentRequired,
    media: {
      images: [
        { url: clinicType.subCategory === 'urgent_care' ? 
          'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' :
          'https://images.unsplash.com/photo-1551190822-a9333d879b1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
        }
      ]
    }
  };
  
  additionalClinics.push(clinic);
}

// Combine base data with additional clinics
mockClinicsData.data = [...mockClinicsData.data, ...additionalClinics];

export default mockClinicsData;