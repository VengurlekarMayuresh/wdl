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

import { healthcareFacilitiesAPI } from '@/services/healthcareFacilitiesAPI';
import FacilityDetailsModal from '@/components/facility/FacilityDetailsModal';
import { doctorAPI } from '@/services/api';

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
  const [allFacilities, setAllFacilities] = useState([]);
  const [filteredFacilities, setFilteredFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [showFacilityModal, setShowFacilityModal] = useState(false);
  const [specialtyCategories, setSpecialtyCategories] = useState(defaultSpecialtyCategories);
  // Client-side pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;
  // Specialty care state
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [specialtyDoctors, setSpecialtyDoctors] = useState([]);
  const [loadingSpecialty, setLoadingSpecialty] = useState(false);

  const getUserInitial = () => {
    if (!user) return 'G';
    return user.firstName?.[0]?.toUpperCase() || 'U';
  };

  // Load facilities on component mount and when activeTab or page changes
  useEffect(() => {
    setPage(1); // reset to first page when tab changes
    if (activeTab === 'primary-care') {
      loadFacilitiesFromDB('primary_care');
    } else if (activeTab === 'specialty-care') {
      setSelectedSpecialty(null);
      setSpecialtyDoctors([]);
      loadSpecialtyDoctorCounts();
      setAllFacilities([]);
      setFilteredFacilities([]);
    } else if (activeTab === 'hospitals') {
      loadFacilitiesFromDB('hospital');
    } else if (activeTab === 'clinics') {
      loadFacilitiesFromDB('clinic');
    } else if (activeTab === 'pharmacies') {
      loadFacilitiesFromDB('pharmacy');
    }
  }, [activeTab]);

  // Filter facilities based on search and pincode (client-side across ALL fetched pages)
  useEffect(() => {
    let filtered = allFacilities;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(facility => {
        const nameMatch = (facility.name || '').toLowerCase().includes(q);
        const typeMatch = healthcareFacilitiesAPI.utils
          .formatType(facility.type, facility.subCategory)
          .toLowerCase()
          .includes(q);
        const servicesMatch = Array.isArray(facility.services) && facility.services.some(s => (s.name || '').toLowerCase().includes(q));
        const addr = facility.address || {};
        const cityMatch = (addr.city || '').toLowerCase().includes(q);
        const stateMatch = (addr.state || '').toLowerCase().includes(q);
        const areaMatch = (addr.area || '').toLowerCase().includes(q);
        return nameMatch || typeMatch || servicesMatch || cityMatch || stateMatch || areaMatch;
      });
    }

    if (selectedPincode) {
      filtered = filtered.filter(facility =>
        (facility.address?.pincode || '').toString().includes(selectedPincode)
      );
    }

    setFilteredFacilities(filtered);
    setPage(1); // reset to first page on any filter change
  }, [searchQuery, selectedPincode, allFacilities]);

  const loadFacilitiesFromDB = async (type) => {
    try {
      setLoading(true);
      const batch = 100;
      let skip = 0;
      let all = [];
      while (true) {
        const params = { type, limit: batch, skip };
        const resp = await healthcareFacilitiesAPI.getAll(params);
        const list = resp.data || resp || [];
        all = all.concat(Array.isArray(list) ? list : []);
        if (!list || list.length < batch) break;
        skip += batch;
      }
      setAllFacilities(all);
      // Initialize filtered to all items for the current tab
      setFilteredFacilities(all);
      setPage(1);
    } catch (error) {
      console.error('Error loading facilities:', error);
      setAllFacilities([]);
      setFilteredFacilities([]);
      setPage(1);
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

  const handleSpecialtyClick = async (specialty) => {
    try {
      setSelectedSpecialty(specialty);
      setLoadingSpecialty(true);
      // Try server-side filter; fallback to client filter
      const resp = await doctorAPI.list({ specialty: specialty.name });
      const list = resp?.doctors || resp?.data || [];
      const normalized = list.length ? list : (await doctorAPI.list())?.doctors || [];
      const filtered = normalized.filter(d => (d.primarySpecialty || '').toLowerCase().includes(specialty.name.toLowerCase()));
      setSpecialtyDoctors(filtered);
    } catch (e) {
      console.error('Failed to load doctors for specialty', specialty, e);
      setSpecialtyDoctors([]);
    } finally {
      setLoadingSpecialty(false);
    }
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
    },
    {
      id: 'urgent-care',
      name: 'Urgent Care / Emergency',
      description: 'Immediate medical attention',
      icon: Zap,
      color: 'bg-orange-500'
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
        <div />
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
          {filteredFacilities.length > 0 ? filteredFacilities
            .slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize)
            .map((facility) => (
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

          {/* Pagination */}
          <div className="flex items-center justify-between pt-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</Button>
            <div className="text-sm text-muted-foreground">Page {page} of {Math.max(1, Math.ceil(filteredFacilities.length / pageSize))}</div>
            <Button variant="outline" size="sm" disabled={(page * pageSize) >= filteredFacilities.length} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );

  const renderSpecialtyCare = () => (
    <div className="space-y-6">
      {!selectedSpecialty ? (
        <>
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
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{selectedSpecialty.name} Doctors</h2>
            <Button variant="outline" size="sm" onClick={()=>{ setSelectedSpecialty(null); setSpecialtyDoctors([]); }}>Back</Button>
          </div>
          {loadingSpecialty ? (
            <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {specialtyDoctors.length ? specialtyDoctors.map((d)=> (
                <Card key={d._id} className="hover:shadow"> 
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={d.userId?.profilePicture || 'https://via.placeholder.com/64'} alt="doc" className="w-16 h-16 rounded-full object-cover" />
                      <div>
                        <div className="font-semibold">Dr. {d.userId?.firstName} {d.userId?.lastName}</div>
                        <div className="text-sm text-muted-foreground">{d.primarySpecialty}</div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                      <Award className="h-4 w-4" /> {d.yearsOfExperience || 0} yrs • <Star className="h-4 w-4" /> {d.averageRating || '4.5'}
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={()=>navigate(`/doctor/${String(d._id || d?.userId?._id || '')}`)}>View Profile</Button>
                      <Button size="sm"><Calendar className="h-4 w-4 mr-1" />Book</Button>
                    </div>
                  </CardContent>
                </Card>
              )) : (
                <div className="text-center text-muted-foreground py-8">No doctors found for this specialty.</div>
              )}
            </div>
          )}
        </div>
      )}
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

  const renderUrgentCare = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Emergency Help</h2>
        <p className="text-muted-foreground">If this is a life threatening emergency, call your local emergency number immediately.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <Card><CardContent className="p-4"><div className="font-semibold">Emergency (India)</div><div className="text-muted-foreground">Dial 112</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="font-semibold">Ambulance</div><div className="text-muted-foreground">Dial 102 / 108</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="font-semibold">Women Helpline</div><div className="text-muted-foreground">Dial 181</div></CardContent></Card>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <Card><CardContent className="p-4"><div className="font-semibold mb-2">First Aid Tips</div><ul className="list-disc ml-4 text-sm text-muted-foreground"><li>Stay calm and call for help.</li><li>Control bleeding with clean cloth and pressure.</li><li>Do not move injured person unless necessary.</li></ul></CardContent></Card>
        <Card><CardContent className="p-4"><div className="font-semibold mb-2">When to go to ER</div><ul className="list-disc ml-4 text-sm text-muted-foreground"><li>Chest pain, severe bleeding, difficulty breathing.</li><li>Severe head injury, sudden weakness, seizures.</li><li>Poisoning, major burns, severe allergic reaction.</li></ul></CardContent></Card>
      </div>
    </div>
  );

  const renderContent = () => {
    const activeCategory = careCategories.find(cat => cat.id === activeTab);
    
    switch (activeTab) {
      case 'primary-care':
      case 'hospitals':
      case 'clinics':
      case 'pharmacies':
        return renderFacilities();
      case 'specialty-care':
        return renderSpecialtyCare();
      case 'urgent-care':
        return renderUrgentCare();
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
                onClick={() => { setActiveTab(category.id); setPage(1); }}
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
