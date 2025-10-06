import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Stethoscope,
  Star,
  Search,
  Phone,
  Clock,
  ArrowLeft,
  Calendar,
  Award,
  Users,
  Filter,
  User
} from 'lucide-react';
import { doctorAPI } from '@/services/api';

const DoctorsPage = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getUserInitial = () => {
    if (!user) return 'G';
    return user.firstName?.[0]?.toUpperCase() || 'U';
  };

  // Load all doctors on mount
  useEffect(() => {
    loadAllDoctors();
  }, []);

  const loadAllDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await doctorAPI.list({ limit: 200 });
      console.log('Doctors API response:', response);
      const allDoctors = response.doctors || response || [];
      setDoctors(allDoctors);
      setFilteredDoctors(allDoctors);
    } catch (error) {
      console.error('Error loading doctors:', error);
      setError('Failed to load doctors');
      setDoctors([]);
      setFilteredDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter doctors based on search and location
  useEffect(() => {
    let filtered = doctors;

    if (searchQuery) {
      filtered = filtered.filter(doctor => {
        const doctorName = `Dr. ${doctor.userId?.firstName} ${doctor.userId?.lastName}`;
        const primarySpecialty = doctor.primarySpecialty || '';
        const specializations = doctor.specializations?.join(' ') || '';
        
        return doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
               primarySpecialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
               specializations.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }

    if (selectedLocation) {
      filtered = filtered.filter(doctor => {
        const city = doctor.userId?.address?.city || '';
        const state = doctor.userId?.address?.state || '';
        const location = `${city} ${state}`.toLowerCase();
        return location.includes(selectedLocation.toLowerCase());
      });
    }

    setFilteredDoctors(filtered);
  }, [searchQuery, selectedLocation, doctors]);

  const handleDoctorClick = (doctor) => {
    // Navigate to doctor profile or booking page
    navigate(`/doctor/${doctor._id}`);
  };


  return (
    <div className="min-h-screen bg-gradient-light">
      <Header 
        isAuthenticated={isAuthenticated}
        userInitial={getUserInitial()}
        userType={user?.userType || 'guest'}
        onLogout={logout}
      />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/find-care')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Find Care
            </Button>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Stethoscope className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">All Doctors</h1>
              <p className="text-muted-foreground">Browse and book appointments with doctors</p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search doctors, hospitals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div>
              <Input
                placeholder="Enter city or location"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              />
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center gap-2 mt-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {loading ? 'Loading...' : `${filteredDoctors.length} ${filteredDoctors.length === 1 ? 'doctor' : 'doctors'} found`}
            </span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Stethoscope className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Error Loading Doctors</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={loadDoctorsBySpecialty}>
              Try Again
            </Button>
          </div>
        )}

        {/* Doctors List */}
        {!loading && !error && (
          <>        
            {filteredDoctors.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                  <Stethoscope className="h-12 w-12 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-semibold mb-2">No doctors found</h2>
                <p className="text-muted-foreground mb-6">Try adjusting your search criteria or location</p>
                <Button onClick={() => navigate('/find-care')}>
                  Browse All Specialties
                </Button>
              </div>
            ) : (
              <div className="grid gap-6">
                {filteredDoctors.map((doctor) => {
                  const doctorName = `Dr. ${doctor.userId?.firstName} ${doctor.userId?.lastName}`;
                  const doctorImage = doctor.userId?.profilePicture;
                  const location = doctor.userId?.address ? `${doctor.userId.address.city}, ${doctor.userId.address.state}` : 'Location not specified';
                  const phone = doctor.userId?.phone;
                  
                  return (
                    <Card 
                      key={doctor._id} 
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => handleDoctorClick(doctor)}
                    >
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0">
                            {doctorImage ? (
                              <img 
                                src={doctorImage} 
                                alt={doctorName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                                <User className="h-12 w-12 text-primary" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-xl font-semibold">{doctorName}</h3>
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="secondary" className="text-xs">
                                    <Stethoscope className="h-3 w-3 mr-1" />
                                    {doctor.primarySpecialty || 'General Practice'}
                                  </Badge>
                                  {doctor.specializations && doctor.specializations.length > 0 && (
                                    <Badge variant="outline" className="text-xs">
                                      {doctor.specializations[0]}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {doctor.affiliations?.[0]?.organization || 'Medical Professional'}
                                </p>
                              </div>
                              
                              <div className="text-right">
                                <div className="flex items-center gap-1 mb-1">
                                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                  <span className="text-sm font-medium">
                                    {doctor.averageRating?.toFixed(1) || 'N/A'}
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    ({doctor.totalReviews || 0})
                                  </span>
                                </div>
                                <div className="text-lg font-semibold text-green-600">
                                  ₹{doctor.consultationFee || 500}
                                </div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Award className="h-4 w-4" />
                                <span>{doctor.yearsOfExperience || 0} years exp</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                <span>{location}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {doctor.isAcceptingNewPatients ? 'Accepting Patients' : 'Not Available'}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between pt-4 border-t">
                              <div className="flex flex-wrap gap-1">
                                {doctor.specializations?.slice(0, 2).map((spec, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {spec}
                                  </Badge>
                                ))}
                                {doctor.specializations?.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{doctor.specializations.length - 2} more
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {phone && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.open(`tel:${phone}`);
                                    }}
                                  >
                                    <Phone className="h-4 w-4 mr-2" />
                                    Call
                                  </Button>
                                )}
                                <Button 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/doctor/${doctor._id}?tab=availability`);
                                  }}
                                >
                                  <Calendar className="h-4 w-4 mr-2" />
                                  Book Appointment
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DoctorsPage;
