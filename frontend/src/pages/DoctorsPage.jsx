import React, { useState, useEffect, useMemo } from 'react';
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
  Filter,
  User
} from 'lucide-react';
import { doctorAPI } from '@/services/api';

// Small presentational card to keep JSX simple and avoid parser edge cases
const DoctorCard = ({ doctor, onClick, navigate }) => {
  const doctorName = `Dr. ${doctor?.userId?.firstName || ''} ${doctor?.userId?.lastName || ''}`.trim();
  const doctorImage = doctor?.userId?.profilePicture;
  // Build dynamic address from available fields without stray commas
  const addr = doctor?.userId?.address || {};
  const addressParts = [addr.street, addr.city, addr.state, addr.zipCode].filter((p) => !!p && String(p).trim().length > 0);
  const address = addressParts.length > 0 ? addressParts.join(', ') : 'Address not provided';
  const phone = doctor?.userId?.phone;
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex gap-4">
          <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0">
            {doctorImage ? (
              <img src={doctorImage} alt={doctorName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                <User className="h-12 w-12 text-primary" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-xl font-semibold">{doctorName || 'Doctor'}</h3>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="text-xs">
                    <Stethoscope className="h-3 w-3 mr-1" />
                    {doctor?.primarySpecialty || 'General Practice'}
                  </Badge>
                  {Array.isArray(doctor?.specializations) && doctor.specializations.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {doctor.specializations[0]}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {doctor?.affiliations?.[0]?.organization || 'Medical Professional'}
                </p>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-1 mb-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">
                    {Number(doctor?.averageRating || 0).toFixed(1)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({doctor?.totalReviews || 0})
                  </span>
                </div>
                <div className="text-lg font-semibold text-green-600">
                  {doctor?.consultationFee !== undefined && doctor?.consultationFee !== null 
                    ? `₹${doctor.consultationFee}` 
                    : 'Fee not set'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Award className="h-4 w-4" />
                <span>{doctor?.yearsOfExperience || 0} years exp</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{address}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex flex-wrap gap-1">
                {Array.isArray(doctor?.specializations) && doctor.specializations.slice(0, 2).map((spec, index) => (
                  <Badge key={index} variant="outline" className="text-xs">{spec}</Badge>
                ))}
                {Array.isArray(doctor?.specializations) && doctor.specializations.length > 2 && (
                  <Badge variant="outline" className="text-xs">+{doctor.specializations.length - 2} more</Badge>
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
                    navigate(`/doctor/${doctor?._id}?tab=availability`);
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
};

const DoctorsPage = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;

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
      const response = await doctorAPI.list({ limit: 200 }).catch((e) => { throw e; });
      console.log('Doctors API response:', response);
      // Normalize to an array
      const raw = Array.isArray(response?.doctors)
        ? response.doctors
        : (Array.isArray(response) ? response : []);
      // Filter out obviously invalid entries and de-dup by _id
      const seen = new Set();
      const allDoctors = raw
        .filter((d) => d && typeof d === 'object')
        .filter((d) => {
          if (!d._id) return false;
          if (seen.has(d._id)) return false;
          seen.add(d._id);
          return true;
        });
      setDoctors(allDoctors);
      setFilteredDoctors(allDoctors);
    } catch (error) {
      console.error('Error loading doctors:', error);
      setError(error?.message || 'Failed to load doctors');
      setDoctors([]);
      setFilteredDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter doctors based on search and location
  useEffect(() => {
    const list = Array.isArray(doctors) ? doctors : [];
    let filtered = list;

    if (searchQuery) {
      const q = (searchQuery || '').toString().toLowerCase();
      filtered = filtered.filter(doctor => {
        const doctorName = `Dr. ${doctor?.userId?.firstName || ''} ${doctor?.userId?.lastName || ''}`;
        const primarySpecialty = doctor?.primarySpecialty || '';
        const specializations = Array.isArray(doctor?.specializations) ? doctor.specializations.join(' ') : '';
        return (
          doctorName.toLowerCase().includes(q) ||
          primarySpecialty.toLowerCase().includes(q) ||
          specializations.toLowerCase().includes(q)
        );
      });
    }

    if (selectedLocation) {
      const lq = (selectedLocation || '').toString().toLowerCase();
      filtered = filtered.filter(doctor => {
        const city = doctor?.userId?.address?.city || '';
        const state = doctor?.userId?.address?.state || '';
        const location = `${city} ${state}`.trim().toLowerCase();
        return location.includes(lq);
      });
    }

    setFilteredDoctors(filtered);
    setPage(1); // reset to first page on new filter
  }, [searchQuery, selectedLocation, doctors]);

  // Derived: sorted by rating desc, then name
  const sortedDoctors = useMemo(() => {
    const list = Array.isArray(filteredDoctors) ? filteredDoctors : [];
    return list.slice().sort((a, b) => {
      const ra = Number(a?.averageRating || 0);
      const rb = Number(b?.averageRating || 0);
      if (rb !== ra) return rb - ra;
      const an = `${a?.userId?.firstName || ''} ${a?.userId?.lastName || ''}`.trim().toLowerCase();
      const bn = `${b?.userId?.firstName || ''} ${b?.userId?.lastName || ''}`.trim().toLowerCase();
      return an.localeCompare(bn);
    });
  }, [filteredDoctors]);

  // Pagination slice
  const total = sortedDoctors.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * pageSize;
  const end = start + pageSize;
  const pageSlice = sortedDoctors.slice(start, end);

  const handleDoctorClick = (doctor) => {
    const id = doctor?._id;
    if (!id) return; // guard
    navigate(`/doctor/${id}`);
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
            <p className="text-muted-foreground mb-2">{error}</p>
            <p className="text-xs text-muted-foreground mb-6">Open console for more details. We will retry with a safer parser.</p>
            <Button onClick={loadAllDoctors}>
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
              <>
                <div className="grid gap-6">
                  {pageSlice.map((doctor) => (
                    <DoctorCard
                      key={doctor?._id || Math.random()}
                      doctor={doctor}
                      navigate={navigate}
                      onClick={() => handleDoctorClick(doctor)}
                    />
                  ))}
                </div>
                {/* Pagination Controls */}
                {total > pageSize && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <Button variant="outline" size="sm" disabled={current <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                      Prev
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {current} of {totalPages}
                    </span>
                    <Button variant="outline" size="sm" disabled={current >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DoctorsPage;
