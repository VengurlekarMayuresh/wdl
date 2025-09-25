import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Stethoscope, Star, Search, UserCircle2, Clock, Phone, Calendar, Filter, Users, Award, CheckCircle, CalendarCheck } from 'lucide-react';
import { doctorAPI, slotsAPI } from '@/services/api';

const FindCarePage = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [specialty, setSpecialty] = useState("");
  const [city, setCity] = useState("");
  const [accepting, setAccepting] = useState("any");
  const [sortBy, setSortBy] = useState("relevance");
  const [isLoading, setIsLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [doctorSlots, setDoctorSlots] = useState({});
  const [slotsLoading, setSlotsLoading] = useState(false);

  const loadDoctors = async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (specialty) params.specialty = specialty;
      if (city) params.city = city;
      if (accepting !== "any") params.acceptingNewPatients = accepting === "yes";
      if (sortBy && sortBy !== 'relevance') params.sortBy = sortBy;
      const { doctors: list } = await doctorAPI.list(params);
      setDoctors(list || []);
      
      // Load available slots for each doctor
      loadDoctorSlots(list || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDoctorSlots = async (doctorList) => {
    try {
      setSlotsLoading(true);
      const slotsData = {};
      
      // Load slots for each doctor in parallel
        await Promise.all(
          doctorList.map(async (doctor) => {
            try {
              const slots = await slotsAPI.getDoctorSlots(doctor._id);
              console.log(`Slots for doctor ${doctor._id}:`, slots); // Debug logging
              
              // Filter slots to show only available ones that are not booked and in the future
              const availableSlots = slots.filter(slot => {
                const slotDate = new Date(slot.dateTime);
                const now = new Date();
                const isAvailable = slot.isAvailable !== false; // Default to true if not specified
                const isNotBooked = !slot.isBooked;
                const isFuture = slotDate > now;
                
                return isAvailable && isNotBooked && isFuture;
              });
              
              slotsData[doctor._id] = availableSlots;
              console.log(`Available slots for doctor ${doctor._id}:`, availableSlots); // Debug logging
            } catch (e) {
              console.log(`Failed to load slots for doctor ${doctor._id}:`, e);
              // If failed to load slots for this doctor, set empty array
              slotsData[doctor._id] = [];
            }
          })
        );
      
      setDoctorSlots(slotsData);
    } catch (e) {
      console.error('Failed to load doctor slots:', e);
    } finally {
      setSlotsLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-light">
<Header 
        isAuthenticated={isAuthenticated}
        userInitial={(user?.firstName?.[0]?.toUpperCase?.() || 'U')}
        userType={user?.userType || 'patient'}
        onLogout={logout}
      />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Find Care</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="col-span-1">
            <label className="block text-sm font-medium mb-2">Specialty</label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. Cardiology, Pediatrics, Dermatology"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
              />
              <Button onClick={loadDoctors} disabled={isLoading}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-medium mb-2">City</label>
            <Input
              placeholder="e.g. Mumbai, Delhi"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Accepting New Patients</label>
            <Select value={accepting} onValueChange={setAccepting}>
              <SelectTrigger>
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Sort By</label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Relevance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="experience">Experience</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button className="w-full" onClick={loadDoctors} disabled={isLoading}>
              {isLoading ? "Searching..." : "Search"}
            </Button>
          </div>
        </div>

        {/* Search Results Summary */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {doctors.length} {doctors.length === 1 ? 'doctor' : 'doctors'} found
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {isLoading && (
            <div className="col-span-2 text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Searching for doctors...</p>
            </div>
          )}
          
          {!isLoading && doctors.length === 0 && (
            <div className="col-span-2 text-center py-8">
              <p className="text-muted-foreground">No doctors found. Try changing your filters.</p>
            </div>
          )}
          
          {doctors.map((doc) => (
            <Card key={doc._id} className="border-none shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {doc?.userId?.profilePicture ? (
                      <img src={doc.userId.profilePicture} alt={`Dr. ${doc?.userId?.firstName} ${doc?.userId?.lastName}`} className="w-full h-full object-cover" />
                    ) : (
                      <UserCircle2 className="h-12 w-12 text-primary" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-semibold text-foreground truncate">
                          Dr. {doc?.userId?.firstName} {doc?.userId?.lastName}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            <Stethoscope className="h-3 w-3 mr-1" />
                            {doc.primarySpecialty || 'General Practice'}
                          </Badge>
                          {doc.isAcceptingNewPatients && (
                            <Badge variant="success" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Accepting Patients
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 text-yellow-500 flex-shrink-0">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm font-medium">{doc.averageRating?.toFixed?.(1) ?? "N/A"}</span>
                      </div>
                    </div>
                    
                    {/* Location & Contact */}
                    <div className="space-y-1 mb-3">
                      {doc?.userId?.address?.city && (
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          <span>{doc.userId.address.city}</span>
                          {doc.userId.address.state && <span>, {doc.userId.address.state}</span>}
                        </div>
                      )}
                      
                      {doc.yearsOfExperience && (
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Award className="h-3 w-3" />
                          <span>{doc.yearsOfExperience} years experience</span>
                        </div>
                      )}
                      
                      {doc?.userId?.phone && (
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          <span>{doc.userId.phone}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Availability */}
                    {doc.availability && doc.availability.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Clock className="h-3 w-3" />
                          <span>Available:</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {doc.availability.slice(0, 3).map((slot, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {slot.day} {slot.startTime}-{slot.endTime}
                            </Badge>
                          ))}
                          {doc.availability.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{doc.availability.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Specialties */}
                    {doc.specializations && doc.specializations.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {doc.specializations.slice(0, 2).map((spec, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                          {doc.specializations.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{doc.specializations.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Available Slots */}
                    {doctorSlots[doc._id] && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Available Slots:</span>
                          <Badge variant={doctorSlots[doc._id].length > 0 ? "success" : "secondary"} className="text-xs">
                            {slotsLoading ? (
                              <div className="flex items-center gap-1">
                                <div className="animate-spin rounded-full h-3 w-3 border-b border-current" />
                                <span>Loading...</span>
                              </div>
                            ) : (
                              `${doctorSlots[doc._id].length} available`
                            )}
                          </Badge>
                        </div>
                        
                        {doctorSlots[doc._id].length > 0 && (
                          <div className="space-y-1">
                            {/* Show first 2 slots */}
                            {doctorSlots[doc._id].slice(0, 2).map((slot, index) => {
                              const slotDate = new Date(slot.dateTime);
                              return (
                                <div key={slot._id || index} className="flex items-center justify-between text-xs p-2 bg-primary/5 rounded">
                                  <div className="flex items-center gap-2">
                                    <CalendarCheck className="h-3 w-3" />
                                    <span>
                                      {slotDate.toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric' 
                                      })} at {slotDate.toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                  {slot.type && (
                                    <Badge variant="outline" className="text-xs px-1 py-0">
                                      {slot.type}
                                    </Badge>
                                  )}
                                </div>
                              );
                            })}
                            {doctorSlots[doc._id].length > 2 && (
                              <div className="text-xs text-muted-foreground text-center py-1">
                                +{doctorSlots[doc._id].length - 2} more slots available
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex gap-2 pt-2 border-t">
                      <Link to={`/doctor/${doc._id}`} className="flex-1">
                        <Button variant="outline" className="w-full" size="sm">
                          <Users className="h-4 w-4 mr-2" />
                          View Profile
                        </Button>
                      </Link>
                      {doc.isAcceptingNewPatients && doctorSlots[doc._id] && doctorSlots[doc._id].length > 0 ? (
                        <Link to={`/doctor/${doc._id}?tab=availability`}>
                          <Button variant="medical" size="sm">
                            <Calendar className="h-4 w-4 mr-2" />
                            Book Now
                          </Button>
                        </Link>
                      ) : (
                        <Button variant="secondary" size="sm" disabled>
                          <Calendar className="h-4 w-4 mr-2" />
                          {!doc.isAcceptingNewPatients ? 'Not Accepting' : 'No Slots'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FindCarePage;