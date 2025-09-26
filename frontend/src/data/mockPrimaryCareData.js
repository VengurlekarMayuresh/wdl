// Mock data for Primary Care medical providers
export const mockPrimaryCareData = {
  success: true,
  data: [
    {
      _id: "mock-primary-001",
      name: "Manhattan Family Medicine",
      type: "primary_care",
      providerType: "primary",
      subCategory: "family_medicine",
      fullAddress: "150 W 55th Street, Midtown",
      address: {
        street: "150 W 55th Street",
        city: "New York",
        state: "NY",
        pincode: "10019",
        country: "USA"
      },
      phone: "+1-212-555-0101",
      rating: { overall: 4.7, totalReviews: 324 },
      services: [
        { name: "Annual Physical Exams" },
        { name: "Preventive Care" },
        { name: "Chronic Disease Management" },
        { name: "Vaccinations" },
        { name: "Health Screenings" },
        { name: "Minor Illness Treatment" }
      ],
      operatingHours: {
        monday: "8:00 AM - 6:00 PM",
        tuesday: "8:00 AM - 6:00 PM",
        wednesday: "8:00 AM - 6:00 PM",
        thursday: "8:00 AM - 8:00 PM",
        friday: "8:00 AM - 6:00 PM",
        saturday: "9:00 AM - 4:00 PM",
        sunday: "Closed"
      },
      is24x7: false,
      specialties: ["Family Medicine", "Internal Medicine"],
      acceptedInsurance: ["Blue Cross Blue Shield", "Aetna", "UnitedHealth", "Medicare"],
      languages: ["English", "Spanish"],
      media: {
        images: [
          { url: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" }
        ]
      }
    },
    {
      _id: "mock-primary-002",
      name: "Brooklyn Heights Primary Care",
      type: "primary_care", 
      providerType: "primary",
      subCategory: "internal_medicine",
      fullAddress: "142 Joralemon Street, Brooklyn Heights",
      address: {
        street: "142 Joralemon Street",
        city: "Brooklyn",
        state: "NY",
        pincode: "11201",
        country: "USA"
      },
      phone: "+1-718-555-0102",
      rating: { overall: 4.5, totalReviews: 198 },
      services: [
        { name: "Internal Medicine" },
        { name: "Executive Physicals" },
        { name: "Wellness Programs" },
        { name: "Diabetes Management" },
        { name: "Hypertension Treatment" },
        { name: "Laboratory Services" }
      ],
      operatingHours: {
        monday: "7:00 AM - 7:00 PM",
        tuesday: "7:00 AM - 7:00 PM",
        wednesday: "7:00 AM - 7:00 PM",
        thursday: "7:00 AM - 7:00 PM",
        friday: "7:00 AM - 5:00 PM",
        saturday: "8:00 AM - 2:00 PM",
        sunday: "Closed"
      },
      is24x7: false,
      specialties: ["Internal Medicine", "Geriatrics"],
      acceptedInsurance: ["Medicare", "Medicaid", "Blue Cross", "Cigna"],
      languages: ["English", "Italian"],
      media: {
        images: [
          { url: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" }
        ]
      }
    },
    {
      _id: "mock-primary-003",
      name: "Tribeca Pediatrics",
      type: "primary_care",
      providerType: "primary", 
      subCategory: "pediatrics",
      fullAddress: "12 Warren Street, Tribeca",
      address: {
        street: "12 Warren Street",
        city: "New York",
        state: "NY",
        pincode: "10007",
        country: "USA"
      },
      phone: "+1-212-555-0103",
      rating: { overall: 4.9, totalReviews: 567 },
      services: [
        { name: "Well-Child Visits" },
        { name: "Immunizations" },
        { name: "Developmental Screenings" },
        { name: "Sick Child Visits" },
        { name: "Newborn Care" },
        { name: "Adolescent Health" }
      ],
      operatingHours: {
        monday: "8:00 AM - 6:00 PM",
        tuesday: "8:00 AM - 6:00 PM",
        wednesday: "8:00 AM - 6:00 PM",
        thursday: "8:00 AM - 8:00 PM",
        friday: "8:00 AM - 6:00 PM",
        saturday: "9:00 AM - 4:00 PM",
        sunday: "10:00 AM - 3:00 PM"
      },
      is24x7: false,
      specialties: ["Pediatrics", "Adolescent Medicine"],
      acceptedInsurance: ["All major insurances", "Medicaid", "CHIP"],
      languages: ["English", "Spanish", "French"],
      media: {
        images: [
          { url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" }
        ]
      }
    },
    {
      _id: "mock-primary-004",
      name: "Queens Family Health Center",
      type: "primary_care",
      providerType: "primary",
      subCategory: "family_medicine",
      fullAddress: "789 Northern Blvd, Woodside",
      address: {
        street: "789 Northern Blvd",
        city: "Queens",
        state: "NY", 
        pincode: "11377",
        country: "USA"
      },
      phone: "+1-718-555-0104",
      rating: { overall: 4.3, totalReviews: 276 },
      services: [
        { name: "Family Medicine" },
        { name: "Women's Health" },
        { name: "Men's Health" },
        { name: "Geriatric Care" },
        { name: "Mental Health Screening" },
        { name: "Nutrition Counseling" }
      ],
      operatingHours: {
        monday: "8:00 AM - 7:00 PM",
        tuesday: "8:00 AM - 7:00 PM",
        wednesday: "8:00 AM - 7:00 PM", 
        thursday: "8:00 AM - 7:00 PM",
        friday: "8:00 AM - 6:00 PM",
        saturday: "9:00 AM - 3:00 PM",
        sunday: "Closed"
      },
      is24x7: false,
      specialties: ["Family Medicine", "Preventive Medicine"],
      acceptedInsurance: ["Most major insurances", "Medicare", "Medicaid"],
      languages: ["English", "Spanish", "Bengali"],
      media: {
        images: [
          { url: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" }
        ]
      }
    }
  ]
};

// Generate additional primary care providers
const additionalProviders = [];
const neighborhoods = [
  { name: 'Upper East Side', pincode: '10021', city: 'New York' },
  { name: 'Upper West Side', pincode: '10024', city: 'New York' },
  { name: 'Chelsea', pincode: '10011', city: 'New York' },
  { name: 'Greenwich Village', pincode: '10014', city: 'New York' },
  { name: 'SoHo', pincode: '10012', city: 'New York' },
  { name: 'East Village', pincode: '10003', city: 'New York' },
  { name: 'Lower East Side', pincode: '10002', city: 'New York' },
  { name: 'Park Slope', pincode: '11215', city: 'Brooklyn' },
  { name: 'Williamsburg', pincode: '11211', city: 'Brooklyn' },
  { name: 'DUMBO', pincode: '11201', city: 'Brooklyn' },
  { name: 'Astoria', pincode: '11102', city: 'Queens' },
  { name: 'Long Island City', pincode: '11101', city: 'Queens' }
];

const primaryCareTypes = [
  { subCategory: 'family_medicine', name: 'Family Medicine', services: ['Family Medicine', 'Preventive Care', 'Health Screenings'] },
  { subCategory: 'internal_medicine', name: 'Internal Medicine', services: ['Internal Medicine', 'Chronic Disease Management', 'Executive Physicals'] },
  { subCategory: 'pediatrics', name: 'Pediatrics', services: ['Pediatric Care', 'Immunizations', 'Well-Child Visits'] }
];

for (let i = 0; i < 16; i++) { // Adding 16 more to reach 20 total
  const neighborhood = neighborhoods[i % neighborhoods.length];
  const careType = primaryCareTypes[i % primaryCareTypes.length];
  const providerNumber = String(i + 5).padStart(3, '0');
  
  const provider = {
    _id: `mock-primary-${providerNumber}`,
    name: `${neighborhood.name} ${careType.name}`,
    type: "primary_care",
    providerType: "primary",
    subCategory: careType.subCategory,
    fullAddress: `${100 + i} ${neighborhood.name} Avenue, ${neighborhood.name}`,
    address: {
      street: `${100 + i} ${neighborhood.name} Avenue`,
      city: neighborhood.city,
      state: 'NY',
      pincode: neighborhood.pincode,
      country: 'USA'
    },
    phone: `+1-${neighborhood.city === 'New York' ? '212' : neighborhood.city === 'Brooklyn' ? '718' : '347'}-555-0${String(105 + i).slice(-3)}`,
    rating: { 
      overall: parseFloat((4.0 + Math.random() * 1.0).toFixed(1)), 
      totalReviews: Math.floor(80 + Math.random() * 300) 
    },
    services: careType.services.concat(['Minor Illness Treatment', 'Health Consultations']).map(name => ({ name })),
    operatingHours: {
      monday: '8:00 AM - 6:00 PM',
      tuesday: '8:00 AM - 6:00 PM',
      wednesday: '8:00 AM - 6:00 PM',
      thursday: '8:00 AM - 7:00 PM',
      friday: '8:00 AM - 6:00 PM',
      saturday: '9:00 AM - 3:00 PM',
      sunday: i % 4 === 0 ? '10:00 AM - 2:00 PM' : 'Closed'
    },
    is24x7: false,
    specialties: [careType.name, 'Preventive Medicine'],
    acceptedInsurance: ['Medicare', 'Medicaid', 'Blue Cross Blue Shield', 'Aetna'],
    languages: ['English', i % 3 === 0 ? 'Spanish' : i % 3 === 1 ? 'Chinese' : 'Russian'],
    media: {
      images: [
        { url: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' }
      ]
    }
  };
  
  additionalProviders.push(provider);
}

// Combine base data with additional providers
mockPrimaryCareData.data = [...mockPrimaryCareData.data, ...additionalProviders];

export default mockPrimaryCareData;