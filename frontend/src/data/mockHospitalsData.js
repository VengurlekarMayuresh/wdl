// Mock data for Hospitals
export const mockHospitalsData = {
  success: true,
  data: [
    {
      _id: "mock-hospital-001",
      name: "NewYork-Presbyterian Hospital",
      type: "hospital",
      providerType: "hospital",
      subCategory: "general_hospital",
      fullAddress: "525 E 68th Street, Upper East Side",
      address: {
        street: "525 E 68th Street",
        city: "New York",
        state: "NY",
        pincode: "10065",
        country: "USA"
      },
      phone: "+1-212-746-5454",
      rating: { overall: 4.6, totalReviews: 1247 },
      services: [
        { name: "Emergency Care" },
        { name: "Surgery" },
        { name: "Cardiology" },
        { name: "Oncology" },
        { name: "Pediatrics" },
        { name: "Maternity Care" },
        { name: "Intensive Care Unit" },
        { name: "Radiology" }
      ],
      operatingHours: {
        monday: "24 hours",
        tuesday: "24 hours",
        wednesday: "24 hours",
        thursday: "24 hours",
        friday: "24 hours",
        saturday: "24 hours",
        sunday: "24 hours"
      },
      is24x7: true,
      specialties: ["General Medicine", "Surgery", "Emergency Medicine"],
      acceptedInsurance: ["All major insurances", "Medicare", "Medicaid"],
      languages: ["English", "Spanish", "Chinese", "Russian"],
      bedCount: 2455,
      emergencyServices: true,
      traumaCenter: "Level I",
      media: {
        images: [
          { url: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" }
        ]
      }
    },
    {
      _id: "mock-hospital-002",
      name: "Mount Sinai Hospital",
      type: "hospital",
      providerType: "hospital",
      subCategory: "teaching_hospital",
      fullAddress: "1 Gustave L. Levy Place, Upper East Side",
      address: {
        street: "1 Gustave L. Levy Place",
        city: "New York",
        state: "NY",
        pincode: "10029",
        country: "USA"
      },
      phone: "+1-212-241-6500",
      rating: { overall: 4.5, totalReviews: 892 },
      services: [
        { name: "Emergency Medicine" },
        { name: "Neurosurgery" },
        { name: "Transplant Surgery" },
        { name: "Cancer Treatment" },
        { name: "Heart Surgery" },
        { name: "Orthopedics" },
        { name: "Psychiatry" }
      ],
      operatingHours: {
        monday: "24 hours",
        tuesday: "24 hours",
        wednesday: "24 hours",
        thursday: "24 hours",
        friday: "24 hours",
        saturday: "24 hours",
        sunday: "24 hours"
      },
      is24x7: true,
      specialties: ["Neurology", "Cardiology", "Oncology", "Transplant Medicine"],
      acceptedInsurance: ["Most major insurances", "Medicare", "Medicaid"],
      languages: ["English", "Spanish", "Hebrew", "Russian"],
      bedCount: 1171,
      emergencyServices: true,
      traumaCenter: "Level I",
      media: {
        images: [
          { url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" }
        ]
      }
    },
    {
      _id: "mock-hospital-003",
      name: "NYU Langone Health",
      type: "hospital",
      providerType: "hospital", 
      subCategory: "academic_medical_center",
      fullAddress: "550 1st Avenue, Kips Bay",
      address: {
        street: "550 1st Avenue",
        city: "New York",
        state: "NY",
        pincode: "10016",
        country: "USA"
      },
      phone: "+1-212-263-7300",
      rating: { overall: 4.7, totalReviews: 1156 },
      services: [
        { name: "Emergency Department" },
        { name: "Cancer Center" },
        { name: "Heart Center" },
        { name: "Neurosurgery" },
        { name: "Pediatrics" },
        { name: "Transplant Institute" },
        { name: "Orthopedic Surgery" }
      ],
      operatingHours: {
        monday: "24 hours",
        tuesday: "24 hours",
        wednesday: "24 hours",
        thursday: "24 hours",
        friday: "24 hours",
        saturday: "24 hours",
        sunday: "24 hours"
      },
      is24x7: true,
      specialties: ["Cardiac Surgery", "Neurosurgery", "Oncology", "Transplant Surgery"],
      acceptedInsurance: ["All major insurances", "Medicare", "Medicaid", "NYU Employee Plans"],
      languages: ["English", "Spanish", "Chinese", "Arabic"],
      bedCount: 1056,
      emergencyServices: true,
      traumaCenter: "Level I",
      media: {
        images: [
          { url: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" }
        ]
      }
    },
    {
      _id: "mock-hospital-004",
      name: "Hospital for Special Surgery",
      type: "hospital",
      providerType: "hospital",
      subCategory: "specialty_hospital",
      fullAddress: "535 E 70th Street, Upper East Side",
      address: {
        street: "535 E 70th Street",
        city: "New York",
        state: "NY",
        pincode: "10021",
        country: "USA"
      },
      phone: "+1-212-606-1000",
      rating: { overall: 4.8, totalReviews: 678 },
      services: [
        { name: "Orthopedic Surgery" },
        { name: "Rheumatology" },
        { name: "Sports Medicine" },
        { name: "Physical Therapy" },
        { name: "Pain Management" },
        { name: "Spine Surgery" }
      ],
      operatingHours: {
        monday: "6:00 AM - 10:00 PM",
        tuesday: "6:00 AM - 10:00 PM",
        wednesday: "6:00 AM - 10:00 PM",
        thursday: "6:00 AM - 10:00 PM",
        friday: "6:00 AM - 10:00 PM",
        saturday: "7:00 AM - 6:00 PM",
        sunday: "7:00 AM - 6:00 PM"
      },
      is24x7: false,
      specialties: ["Orthopedics", "Rheumatology", "Sports Medicine"],
      acceptedInsurance: ["Most major insurances", "Medicare", "Workers' Compensation"],
      languages: ["English", "Spanish", "French", "Italian"],
      bedCount: 205,
      emergencyServices: false,
      traumaCenter: "None",
      media: {
        images: [
          { url: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" }
        ]
      }
    },
    {
      _id: "mock-hospital-005",
      name: "Brooklyn Methodist Hospital",
      type: "hospital",
      providerType: "hospital",
      subCategory: "community_hospital",
      fullAddress: "506 6th Street, Park Slope",
      address: {
        street: "506 6th Street",
        city: "Brooklyn",
        state: "NY",
        pincode: "11215",
        country: "USA"
      },
      phone: "+1-718-780-3000",
      rating: { overall: 4.3, totalReviews: 543 },
      services: [
        { name: "Emergency Services" },
        { name: "Maternity Ward" },
        { name: "Surgical Services" },
        { name: "Intensive Care" },
        { name: "Rehabilitation" },
        { name: "Laboratory Services" },
        { name: "Cardiology" }
      ],
      operatingHours: {
        monday: "24 hours",
        tuesday: "24 hours", 
        wednesday: "24 hours",
        thursday: "24 hours",
        friday: "24 hours",
        saturday: "24 hours",
        sunday: "24 hours"
      },
      is24x7: true,
      specialties: ["Emergency Medicine", "Maternity Care", "General Surgery"],
      acceptedInsurance: ["Most major insurances", "Medicare", "Medicaid", "Brooklyn Health Plans"],
      languages: ["English", "Spanish", "Arabic", "Haitian Creole"],
      bedCount: 651,
      emergencyServices: true,
      traumaCenter: "Level II",
      media: {
        images: [
          { url: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" }
        ]
      }
    }
  ]
};

// Generate additional hospitals
const additionalHospitals = [];
const hospitalNeighborhoods = [
  { name: 'Lenox Hill', pincode: '10075', city: 'New York' },
  { name: 'Midtown East', pincode: '10017', city: 'New York' },
  { name: 'Financial District', pincode: '10005', city: 'New York' },
  { name: 'Harlem', pincode: '10027', city: 'New York' },
  { name: 'Washington Heights', pincode: '10032', city: 'New York' },
  { name: 'Crown Heights', pincode: '11213', city: 'Brooklyn' },
  { name: 'Fort Greene', pincode: '11205', city: 'Brooklyn' },
  { name: 'Bay Ridge', pincode: '11209', city: 'Brooklyn' },
  { name: 'Astoria', pincode: '11102', city: 'Queens' },
  { name: 'Flushing', pincode: '11354', city: 'Queens' },
  { name: 'Jamaica', pincode: '11432', city: 'Queens' },
  { name: 'Bronx', pincode: '10451', city: 'Bronx' }
];

const hospitalTypes = [
  { subCategory: 'general_hospital', name: 'General Hospital', bedRange: [200, 800] },
  { subCategory: 'community_hospital', name: 'Medical Center', bedRange: [150, 500] },
  { subCategory: 'specialty_hospital', name: 'Specialty Hospital', bedRange: [100, 300] }
];

for (let i = 0; i < 15; i++) { // Adding 15 more to reach 20 total
  const neighborhood = hospitalNeighborhoods[i % hospitalNeighborhoods.length];
  const hospitalType = hospitalTypes[i % hospitalTypes.length];
  const hospitalNumber = String(i + 6).padStart(3, '0');
  
  const hospital = {
    _id: `mock-hospital-${hospitalNumber}`,
    name: `${neighborhood.name} ${hospitalType.name}`,
    type: "hospital",
    providerType: "hospital",
    subCategory: hospitalType.subCategory,
    fullAddress: `${200 + i} ${neighborhood.name} Avenue, ${neighborhood.name}`,
    address: {
      street: `${200 + i} ${neighborhood.name} Avenue`,
      city: neighborhood.city,
      state: 'NY',
      pincode: neighborhood.pincode,
      country: 'USA'
    },
    phone: `+1-${neighborhood.city === 'New York' ? '212' : neighborhood.city === 'Brooklyn' ? '718' : neighborhood.city === 'Queens' ? '347' : '929'}-${Math.floor(100 + Math.random() * 900)}-${String(Math.floor(1000 + Math.random() * 9000))}`,
    rating: { 
      overall: parseFloat((4.0 + Math.random() * 1.0).toFixed(1)), 
      totalReviews: Math.floor(200 + Math.random() * 800) 
    },
    services: [
      { name: 'Emergency Care' },
      { name: 'Surgery' },
      { name: 'Internal Medicine' },
      { name: 'Laboratory Services' },
      { name: 'Radiology' },
      { name: i % 2 === 0 ? 'Cardiology' : 'Orthopedics' }
    ],
    operatingHours: i % 3 === 0 ? {
      monday: '24 hours',
      tuesday: '24 hours',
      wednesday: '24 hours',
      thursday: '24 hours',
      friday: '24 hours',
      saturday: '24 hours',
      sunday: '24 hours'
    } : {
      monday: '6:00 AM - 10:00 PM',
      tuesday: '6:00 AM - 10:00 PM',
      wednesday: '6:00 AM - 10:00 PM',
      thursday: '6:00 AM - 10:00 PM',
      friday: '6:00 AM - 10:00 PM',
      saturday: '7:00 AM - 8:00 PM',
      sunday: '7:00 AM - 8:00 PM'
    },
    is24x7: i % 3 === 0,
    specialties: ['General Medicine', 'Surgery', i % 2 === 0 ? 'Emergency Medicine' : 'Internal Medicine'],
    acceptedInsurance: ['Most major insurances', 'Medicare', 'Medicaid'],
    languages: ['English', i % 3 === 0 ? 'Spanish' : i % 3 === 1 ? 'Chinese' : 'Russian'],
    bedCount: Math.floor(hospitalType.bedRange[0] + Math.random() * (hospitalType.bedRange[1] - hospitalType.bedRange[0])),
    emergencyServices: i % 3 !== 2, // Most hospitals have emergency services
    traumaCenter: i % 4 === 0 ? 'Level I' : i % 4 === 1 ? 'Level II' : 'None',
    media: {
      images: [
        { url: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' }
      ]
    }
  };
  
  additionalHospitals.push(hospital);
}

// Combine base data with additional hospitals
mockHospitalsData.data = [...mockHospitalsData.data, ...additionalHospitals];

export default mockHospitalsData;