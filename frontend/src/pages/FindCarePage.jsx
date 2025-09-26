import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Stethoscope, 
  Star, 
  Search, 
  Phone, 
  Clock,
  Heart,
  Brain,
  Eye,
  Bone,
  Baby,
  Zap,
  Building2,
  Hospital,
  Cross,
  Pill,
  ChevronRight,
  Filter,
  Navigation,
  Calendar,
  Award,
  Users
} from 'lucide-react';

import healthcareFacilitiesAPI from '@/services/healthcareFacilitiesAPI';
import FacilityDetailsModal from '@/components/facility/FacilityDetailsModal';
import { doctorAPI } from '@/services/api';
import mockPrimaryCareData from '@/data/mockPrimaryCareData';
import mockHospitalsData from '@/data/mockHospitalsData';
import mockClinicsData from '@/data/mockClinicsData';

// Default specialty care categories structure
const defaultSpecialtyCategories = [
  {
    id: 'cardiology',
    name: 'Cardiology',
    icon: Heart,
    description: 'Heart and cardiovascular specialists',
    doctorCount: 0
  },
  {
    id: 'neurology',
    name: 'Neurology',
    icon: Brain,
    description: 'Brain and nervous system specialists',
    doctorCount: 0
  },
  {
    id: 'ophthalmology',
    name: 'Ophthalmology',
    icon: Eye,
    description: 'Eye care specialists',
    doctorCount: 0
  },
  {
    id: 'orthopedics',
    name: 'Orthopedics',
    icon: Bone,
    description: 'Bone and joint specialists',
    doctorCount: 0
  },
  {
    id: 'pediatrics',
    name: 'Pediatrics',
    icon: Baby,
    description: 'Children health specialists',
    doctorCount: 0
  },
  {
    id: 'dermatology',
    name: 'Dermatology',
    icon: Stethoscope,
    description: 'Skin care specialists',
    doctorCount: 0
  },
  {
    id: 'endocrinology',
    name: 'Endocrinology',
    icon: Zap,
    description: 'Hormone and metabolism specialists',
    doctorCount: 0
  },
  {
    id: 'gastroenterology',
    name: 'Gastroenterology',
    icon: Stethoscope,
    description: 'Digestive system specialists',
    doctorCount: 0
  }
];

const FindCarePage = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('primary-care');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPincode, setSelectedPincode] = useState('');
  const [facilities, setFacilities] = useState([]);
  const [filteredFacilities, setFilteredFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [showFacilityModal, setShowFacilityModal] = useState(false);
  const [specialtyCategories, setSpecialtyCategories] = useState(defaultSpecialtyCategories);

  const getUserInitial = () => {
    if (!user) return 'G';
    return user.firstName?.[0]?.toUpperCase() || 'U';
  };

  // Load facilities on component mount and when activeTab changes
  useEffect(() => {
    if (activeTab === 'primary-care') {
      loadPrimaryCare();
    } else if (activeTab === 'specialty-care') {
      loadSpecialtyDoctorCounts();
    } else if (activeTab === 'hospitals') {
      loadHospitals();
    } else if (activeTab === 'clinics') {
      loadClinics();
    }
  }, [activeTab]);

  // Filter facilities based on search and pincode
  useEffect(() => {
    let filtered = facilities;

    if (searchQuery) {
      filtered = filtered.filter(facility =>
        facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        healthcareFacilitiesAPI.utils.formatType(facility.type, facility.subCategory)
          .toLowerCase().includes(searchQuery.toLowerCase()) ||
        facility.services?.some(service => 
          service.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    if (selectedPincode) {
      filtered = filtered.filter(facility =>
        facility.address?.pincode?.includes(selectedPincode)
      );
    }

    setFilteredFacilities(filtered);
  }, [searchQuery, selectedPincode, facilities]);

  const loadPrimaryCare = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 300));
      const facilitiesData = mockPrimaryCareData.data || [];
      setFacilities(facilitiesData);
      setFilteredFacilities(facilitiesData);
    } catch (error) {
      console.error('Error loading primary care facilities:', error);
      setFacilities([]);
      setFilteredFacilities([]);
    } finally {
      setLoading(false);
    }
  };

  const loadHospitals = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 300));
      const hospitalsData = mockHospitalsData.data || [];
      setFacilities(hospitalsData);
      setFilteredFacilities(hospitalsData);
    } catch (error) {
      console.error('Error loading hospitals:', error);
      setFacilities([]);
      setFilteredFacilities([]);
    } finally {
      setLoading(false);
    }
  };

  const loadClinics = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 300));
      const clinicsData = mockClinicsData.data || [];
      setFacilities(clinicsData);
      setFilteredFacilities(clinicsData);
    } catch (error) {
      console.error('Error loading clinics:', error);
      setFacilities([]);
      setFilteredFacilities([]);
    } finally {
      setLoading(false);
    }
  };

  // Map API specialties to our category IDs
  const mapSpecialtyToCategoryId = (specialty) => {
    const specialtyLower = specialty?.toLowerCase();
    const mappings = {
      'cardiology': 'cardiology',
      'neurology': 'neurology', 
      'ophthalmology': 'ophthalmology',
      'orthopedics': 'orthopedics',
      'pediatrics': 'pediatrics',
      'dermatology': 'dermatology',
      'endocrinology': 'endocrinology',
      'gastroenterology': 'gastroenterology',
      // Additional mappings for API specialties
      'pulmonology': 'cardiology', // Heart/lung related
      'radiology': 'neurology', // Brain/imaging related
      'obstetrics': 'pediatrics', // Child/birth related
      'family medicine': 'pediatrics', // General family care
      'emergency medicine': 'cardiology', // Emergency/heart related
      'rheumatology': 'orthopedics', // Joint/bone related
      'psychiatry': 'neurology' // Brain/mental health
    };
    return mappings[specialtyLower] || null;
  };

  const loadSpecialtyDoctorCounts = async () => {
    try {
      // Fetch all doctors from the API
      const response = await doctorAPI.list();
      const doctors = response.doctors || [];
      
      // Count doctors by specialty
      const specialtyCounts = {};
      doctors.forEach(doctor => {
        const specialty = doctor.primarySpecialty;
        const categoryId = mapSpecialtyToCategoryId(specialty);
        if (categoryId) {
          specialtyCounts[categoryId] = (specialtyCounts[categoryId] || 0) + 1;
        }
      });
      
      // Update specialty categories with real counts
      const updatedCategories = defaultSpecialtyCategories.map(category => ({
        ...category,
        doctorCount: specialtyCounts[category.id] || 0
      }));
      
      setSpecialtyCategories(updatedCategories);
    } catch (error) {
      console.error('Error loading specialty doctor counts:', error);
      // Keep default categories with 0 counts on error
      setSpecialtyCategories(defaultSpecialtyCategories);
    }
  };

  const handleFacilityClick = (facility) => {
    setSelectedFacility(facility);
    setShowFacilityModal(true);
  };

  const handleSpecialtyClick = (specialty) => {
    // Navigate to doctors page with specialty filter
    navigate(`/doctors?specialty=${specialty.id}`);
  };

  const careCategories = [
    {
      id: 'primary-care',
      name: 'Primary Care',
      description: 'Family Medicine, Internal Medicine, Pediatrics',
      icon: Stethoscope,
      color: 'bg-blue-500'
    },
    {
      id: 'specialty-care',
      name: 'Specialty Care',
      description: 'Specialized medical care by experts',
      icon: Heart,
      color: 'bg-red-500'
    },
    {
      id: 'urgent-care',
      name: 'Urgent Care / Emergency',
      description: 'Immediate medical attention',
      icon: Zap,
      color: 'bg-orange-500'
    },
    {
      id: 'hospitals',
      name: 'Hospitals',
      description: 'Full-service medical facilities',
      icon: Hospital,
      color: 'bg-green-500'
    },
    {
      id: 'clinics',
      name: 'Clinics',
      description: 'Outpatient medical centers',
      icon: Building2,
      color: 'bg-purple-500'
    },
    {
      id: 'pharmacies',
      name: 'Pharmacies',
      description: 'Prescription and over-the-counter medications',
      icon: Pill,
      color: 'bg-teal-500'
    }
  ];

  const renderFacilities = () => (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={`Search ${activeTab === 'primary-care' ? 'primary care providers' : activeTab === 'hospitals' ? 'hospitals' : 'clinics'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div>
          <Input
            placeholder="Enter pincode"
            value={selectedPincode}
            onChange={(e) => setSelectedPincode(e.target.value)}
          />
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {loading ? 'Loading...' : `${filteredFacilities.length} medical facilities found`}
          </span>
        </div>
        <Button variant="outline" size="sm">
          <Navigation className="h-4 w-4 mr-2" />
          Sort by distance
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Medical Facilities List */}
      {!loading && (
        <div className="grid gap-6">
          {filteredFacilities.length > 0 ? filteredFacilities.map((facility) => (
            <Card 
              key={facility._id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleFacilityClick(facility)}
            >
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={facility.media?.images?.[0]?.url || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'} 
                      alt={facility.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold">{facility.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {healthcareFacilitiesAPI.utils.formatType(facility.type, facility.subCategory)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{facility.rating?.overall || 'N/A'}</span>
                        <span className="text-sm text-muted-foreground">
                          ({facility.rating?.totalReviews || 0})
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{facility.fullAddress || facility.address?.street}</span>
                      {facility.address?.pincode && (
                        <Badge variant="outline" className="text-xs">
                          {facility.address.pincode}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {facility.services?.slice(0, 3).map((service, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {service.name}
                          </Badge>
                        ))}
                        {facility.services?.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{facility.services.length - 3} more
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {healthcareFacilitiesAPI.utils.formatOperatingHours(
                            facility.operatingHours, 
                            facility.is24x7
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          <span className="text-primary cursor-pointer hover:underline">
                            Call
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Building2 className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No facilities found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or location.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderSpecialtyCare = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Choose Your Specialty</h2>
        <p className="text-muted-foreground">Find specialized doctors for your specific health needs</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {specialtyCategories.map((specialty) => {
          const IconComponent = specialty.icon;
          return (
            <Card 
              key={specialty.id}
              className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1"
              onClick={() => handleSpecialtyClick(specialty)}
            >
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IconComponent className="h-8 w-8 text-primary" />
                </div>
                
                <h3 className="text-lg font-semibold mb-2">{specialty.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{specialty.description}</p>
                
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {specialty.doctorCount} doctors
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderComingSoon = (category) => (
    <div className="text-center py-16">
      <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
        <category.icon className="h-12 w-12 text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-bold mb-2">{category.name}</h2>
      <p className="text-muted-foreground mb-6">{category.description}</p>
      <Badge variant="outline" className="text-sm py-2 px-4">
        Coming Soon
      </Badge>
    </div>
  );

  const renderContent = () => {
    const activeCategory = careCategories.find(cat => cat.id === activeTab);
    
    switch (activeTab) {
      case 'primary-care':
      case 'hospitals':
      case 'clinics':
        return renderFacilities();
      case 'specialty-care':
        return renderSpecialtyCare();
      default:
        return renderComingSoon(activeCategory);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-light">
      <Header 
        isAuthenticated={isAuthenticated}
        userInitial={getUserInitial()}
        userType={user?.userType || 'guest'}
        onLogout={logout}
        showSearch={true}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Find Quality Healthcare Near You</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Discover trusted healthcare providers, specialists, and medical facilities in your area
          </p>
        </div>

        {/* Care Category Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {careCategories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Button
                key={category.id}
                variant={activeTab === category.id ? "default" : "outline"}
                className={`h-auto p-4 flex-col ${
                  activeTab === category.id ? '' : 'hover:bg-accent'
                }`}
                onClick={() => setActiveTab(category.id)}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                  activeTab === category.id ? 'bg-primary-foreground' : category.color
                }`}>
                  <IconComponent className={`h-5 w-5 ${
                    activeTab === category.id ? 'text-primary' : 'text-white'
                  }`} />
                </div>
                <span className="text-xs font-medium text-center leading-tight">
                  {category.name}
                </span>
              </Button>
            );
          })}
        </div>

        <Separator className="mb-8" />

        {/* Content Area */}
        <div className="min-h-[500px]">
          {renderContent()}
        </div>
      </div>
      
      {/* Facility Details Modal */}
      <FacilityDetailsModal
        facilityId={selectedFacility?._id}
        facility={selectedFacility}
        isOpen={showFacilityModal}
        onClose={() => {
          setShowFacilityModal(false);
          setSelectedFacility(null);
        }}
      />
    </div>
  );
};

export default FindCarePage;
