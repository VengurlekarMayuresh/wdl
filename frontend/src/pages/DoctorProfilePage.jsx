import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Calendar, Stethoscope, Award, Clock, Star, MapPin, Phone, Mail, UserCircle2, BookOpen, Heart, Shield, Users, MessageCircle, Share2, ArrowLeft, CheckCircle, Video, Building, GraduationCap, Languages, DollarSign, AlertCircle } from 'lucide-react';
import { doctorAPI, slotsAPI, appointmentsAPI, reviewsAPI } from '@/services/api';
import { toast } from '@/components/ui/sonner';

const DoctorProfilePage = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [reviews, setReviews] = useState([]);
  const [doctorSlots, setDoctorSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingReason, setBookingReason] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [requestMode, setRequestMode] = useState('slot'); // 'slot' or 'custom'
  const [customDate, setCustomDate] = useState('');
  const [customTime, setCustomTime] = useState('');

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        const doc = await doctorAPI.getById(id);
        setDoctor(doc);
        // Load slots and reviews after doctor is loaded
        loadDoctorSlots();
        try {
          const r = await doctorAPI.getReviews(id);
          setReviews(r);
        } catch (re) {
          console.log('Reviews load error', re.message);
        }
      } catch (e) {
        setError(e.message || 'Failed to load doctor');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  const loadDoctorSlots = async () => {
    try {
      setSlotsLoading(true);
      const slots = await slotsAPI.getDoctorSlots(id);
      console.log('Raw slots from API:', slots); // Debug logging
      
      // Filter slots to show only available ones that are not booked and in the future
      const availableSlots = slots.filter(slot => {
        const slotDate = new Date(slot.dateTime);
        const now = new Date();
        const isAvailable = slot.isAvailable !== false; // Default to true if not specified
        const isNotBooked = !slot.isBooked;
        const isFuture = slotDate > now;
        
        console.log('Slot filtering:', {
          slotId: slot._id,
          dateTime: slot.dateTime,
          isAvailable,
          isNotBooked,
          isFuture,
          shouldShow: isAvailable && isNotBooked && isFuture
        });
        
        return isAvailable && isNotBooked && isFuture;
      });
      
      console.log('Filtered available slots:', availableSlots); // Debug logging
      setDoctorSlots(availableSlots);
    } catch (e) {
      console.error('Failed to load doctor slots:', e);
      setDoctorSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleBookAppointment = (slot = null) => {
    if (!isAuthenticated) {
      // Redirect to login or show login modal
      navigate('/login', { state: { returnTo: `/doctor/${id}` } });
      return;
    }
    setSelectedSlot(slot);
    setRequestMode(slot ? 'slot' : 'custom');
    setShowBookingModal(true);
  };

  const handleBookSlot = async () => {
    if (requestMode === 'slot' && !selectedSlot) return;
    
    try {
      setBookingLoading(true);

        if (requestMode === 'slot') {
          await appointmentsAPI.bookAppointment({
            slotId: selectedSlot._id,
            reasonForVisit: bookingReason || 'General consultation',
            symptoms: '',
            relevantMedicalHistory: '',
            currentMedications: [],
            allergies: [],
            contactPreferences: {}
          });
          // Immediate confirmation now
          toast.success('Appointment booked and confirmed!');
        } else {
        // Custom request flow
        if (!customDate || !customTime) {
          alert('Please select a date and time for your request.');
          return;
        }
        const iso = new Date(`${customDate}T${customTime}`).toISOString();
        await appointmentsAPI.bookAppointment({
          doctorId: doctor._id,
          requestedDateTime: iso,
          reasonForVisit: bookingReason || 'General consultation',
          appointmentType: 'consultation',
          symptoms: '',
          relevantMedicalHistory: '',
          currentMedications: [],
          allergies: [],
          contactPreferences: {}
        });
        toast.success('Appointment request sent! The doctor will review and approve or reject your request.');
      }
      
      // Refresh slots to show updated availability
      loadDoctorSlots();
      
      // Close modal and reset
      setShowBookingModal(false);
      setSelectedSlot(null);
      setBookingReason('');
      setCustomDate('');
      setCustomTime('');
    } catch (e) {
      alert('Failed to submit: ' + e.message);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Mock reviews data (replace with API call)
  const mockReviews = [
    {
      id: 1,
      patientName: 'Sarah M.',
      rating: 5,
      date: '2024-01-15',
      comment: 'Excellent doctor! Very thorough and caring. Explained everything clearly.'
    },
    {
      id: 2,
      patientName: 'John D.',
      rating: 4,
      date: '2024-01-10',
      comment: 'Great experience. Professional and knowledgeable.'
    },
    {
      id: 3,
      patientName: 'Emma K.',
      rating: 5,
      date: '2024-01-05',
      comment: 'Dr. was very patient and answered all my questions. Highly recommend!'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-light">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-lg font-medium">Loading doctor profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-light">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center text-red-600">
            <p className="text-lg font-medium">Error loading doctor profile</p>
            <p className="text-sm">{error}</p>
            <Button variant="outline" onClick={() => navigate('/find-care')} className="mt-4">
              Back to Find Care
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-light">
<Header 
        isAuthenticated={isAuthenticated}
        userInitial={(user?.firstName?.[0]?.toUpperCase?.() || 'U')}
        userType={user?.userType || 'patient'}
        onLogout={logout}
      />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-4">
          <Button variant="ghost" onClick={handleBack} className="text-muted-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        </div>

        {doctor && (
          <div className="space-y-6">
            {/* Header Card */}
            <Card className="border-none shadow-soft">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                    {doctor?.userId?.profilePicture ? (
                      <img src={doctor.userId.profilePicture} alt={`Dr. ${doctor?.userId?.firstName} ${doctor?.userId?.lastName}`} className="w-full h-full object-cover" />
                    ) : (
                      <UserCircle2 className="h-12 w-12 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div>
                        <h1 className="text-2xl font-bold">
                          Dr. {doctor?.userId?.firstName} {doctor?.userId?.lastName}
                        </h1>
                        <div className="text-muted-foreground flex items-center gap-2 mt-1">
                          <Stethoscope className="h-4 w-4" />
                          <span>{doctor.primarySpecialty || 'General Practice'}</span>
                          {doctor.yearsOfExperience && (
                            <>
                              <Separator orientation="vertical" className="mx-2 h-4" />
                              <span>{doctor.yearsOfExperience} yrs experience</span>
                            </>
                          )}
                        </div>
                        {doctor?.userId?.address?.city && (
                          <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>
                              {doctor.userId.address.city}
                              {doctor.userId.address.state ? `, ${doctor.userId.address.state}` : ''}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-6">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="font-medium">{doctor.averageRating?.toFixed?.(1) ?? 'N/A'}</span>
                          <span className="text-xs text-muted-foreground">({doctor.totalReviews || 0})</span>
                        </Badge>
                        {doctor.isAcceptingNewPatients && (
                          <Badge variant="success" className="flex items-center">
                            <CheckCircle className="h-4 w-4 mr-1" /> Accepting new patients
                          </Badge>
                        )}
                        <Button variant="medical" onClick={handleBookAppointment}>
                          <Calendar className="h-4 w-4 mr-2" /> Book Appointment
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{doctor?.userId?.phone || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{doctor?.userId?.email || 'N/A'}</span>
                      </div>
                      {doctor.telemedicineEnabled && (
                        <div className="flex items-center gap-2">
                          <Video className="h-4 w-4" />
                          <span>Telemedicine available</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>


            {/* Tabs */}
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="grid grid-cols-3 max-w-md">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="availability">Availability</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              {/* Overview */}
              <TabsContent value="overview" className="mt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="border-none shadow-soft">
                    <CardHeader>
                      <CardTitle>About</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-muted-foreground">
                      <p>{doctor.bio || 'No bio available.'}</p>
                      {doctor.languages && doctor.languages.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Languages className="h-4 w-4" />
                          <span>Languages: {doctor.languages.join(', ')}</span>
                        </div>
                      )}
                      {doctor.hospitalAffiliations && doctor.hospitalAffiliations.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          <span>Affiliations: {doctor.hospitalAffiliations.join(', ')}</span>
                        </div>
                      )}
                      {doctor.consultationFee && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          <span>Consultation fee: ₹{doctor.consultationFee}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-soft">
                    <CardHeader>
                      <CardTitle>Qualifications</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        <span>License: {doctor.medicalLicenseNumber} {doctor.licenseState ? `(${doctor.licenseState})` : ''}</span>
                      </div>
                      {doctor?.education?.length > 0 && (
                        <div>
                          <div className="font-medium mb-2 flex items-center gap-2"><GraduationCap className="h-4 w-4" /> Education</div>
                          <div className="grid gap-2">
                            {doctor.education.map((edu) => (
                              <div key={edu._id} className="text-sm text-muted-foreground">
                                {edu.degree} in {edu.fieldOfStudy} - {edu.institution} ({edu.graduationYear || 'Year N/A'})
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {doctor.certifications && doctor.certifications.length > 0 && (
                        <div>
                          <div className="font-medium mb-2 flex items-center gap-2"><Shield className="h-4 w-4" /> Certifications</div>
                          <div className="flex flex-wrap gap-2">
                            {doctor.certifications.map((c, idx) => (
                              <Badge key={idx} variant="secondary">{c}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {doctor.specializations && doctor.specializations.length > 0 && (
                        <div>
                          <div className="font-medium mb-2 flex items-center gap-2"><Heart className="h-4 w-4" /> Specializations</div>
                          <div className="flex flex-wrap gap-2">
                            {doctor.specializations.map((s, idx) => (
                              <Badge key={idx} variant="secondary">{s}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Available Slots */}
              <TabsContent value="availability" className="mt-6">
                <Card className="border-none shadow-soft">
                  <CardHeader>
                    <CardTitle>Available Appointment Slots</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Click on any available slot to book your appointment
                    </p>
                  </CardHeader>
                  <CardContent>
                    {slotsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                        <span className="ml-2 text-sm">Loading available slots...</span>
                      </div>
                    ) : doctorSlots.length > 0 ? (
                      <div className="grid gap-3">
                        {doctorSlots.map((slot) => {
                          const slotDate = new Date(slot.dateTime);
                          const endTime = slot.endTime ? new Date(`1970-01-01T${slot.endTime}`) : null;
                          
                          return (
                            <Card key={slot._id} className="border hover:border-primary/50 transition-colors cursor-pointer" 
                                  onClick={() => handleBookAppointment(slot)}>
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                      <Calendar className="h-4 w-4 text-primary" />
                                      <span className="font-medium">
                                        {slotDate.toLocaleDateString('en-US', {
                                          weekday: 'short',
                                          month: 'short',
                                          day: 'numeric',
                                          year: 'numeric'
                                        })}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-sm">
                                        {slotDate.toLocaleTimeString('en-US', {
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                        {endTime && ` - ${endTime.toLocaleTimeString('en-US', {
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}`}
                                      </span>
                                    </div>
                                    {slot.type && (
                                      <Badge variant="secondary" className="text-xs">
                                        {slot.type}
                                      </Badge>
                                    )}
                                  </div>
                                  <Button variant="medical" size="sm" onClick={(e) => {
                                    e.stopPropagation();
                                    handleBookAppointment(slot);
                                  }}>
                                    <Calendar className="h-4 w-4 mr-1" /> Book
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground">No available slots at the moment.</p>
                        <p className="text-sm text-muted-foreground">Please check back later or contact the doctor directly.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Reviews */}
              <TabsContent value="reviews" className="mt-6">
                <Card className="border-none shadow-soft">
                  <CardHeader>
                    <CardTitle>Patient Reviews</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {reviews.length === 0 ? (
                      <div className="text-sm text-muted-foreground">No reviews yet</div>
                    ) : reviews.map((r, idx) => (
                      <div key={idx} className="p-4 rounded-md border">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span className="font-medium">{r.patientName || 'Patient'}</span>
                          </div>
                          <div className="flex items-center gap-1 text-yellow-500">
                            <Star className="h-4 w-4" />
                            <span className="text-sm">{r.rating}.0</span>
                          </div>
                        </div>
                        {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                        <div className="text-xs text-muted-foreground mt-2">{new Date(r.date).toLocaleDateString()}</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Booking Modal */}
        {showBookingModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => {
            setShowBookingModal(false);
            setSelectedSlot(null);
            setBookingReason('');
            setCustomDate('');
            setCustomTime('');
          }}>
            <Card className="w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
              <CardHeader>
                <CardTitle>Book Appointment</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Book an appointment with Dr. {doctor?.userId?.firstName} {doctor?.userId?.lastName}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Mode Toggle */}
                <div className="flex gap-2">
                  <Button 
                    variant={requestMode === 'slot' ? 'medical' : 'outline'}
                    size="sm"
                    onClick={() => setRequestMode('slot')}
                    disabled={!selectedSlot}
                  >
                    Use Selected Slot
                  </Button>
                  <Button 
                    variant={requestMode === 'custom' ? 'medical' : 'outline'}
                    size="sm"
                    onClick={() => setRequestMode('custom')}
                  >
                    Request Specific Time
                  </Button>
                </div>

                {/* Selected Slot Info (only if in slot mode and a slot is chosen) */}
                {requestMode === 'slot' && selectedSlot && (
                  <div className="p-3 bg-primary/5 border border-primary/20 rounded-md">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">Selected Slot</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(selectedSlot.dateTime).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-3 w-3" />
                        <span>
                          {new Date(selectedSlot.dateTime).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                          {selectedSlot.endTime && ` - ${new Date(`1970-01-01T${selectedSlot.endTime}`).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}`}
                        </span>
                      </div>
                      {selectedSlot.type && (
                        <Badge variant="secondary" className="text-xs mt-2">
                          {selectedSlot.type}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Custom Date/Time Inputs (only if in custom mode) */}
                {requestMode === 'custom' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-2">Preferred Date *</label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-input rounded-md text-sm"
                        value={customDate}
                        onChange={(e) => setCustomDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Preferred Time *</label>
                      <input
                        type="time"
                        className="w-full px-3 py-2 border border-input rounded-md text-sm"
                        value={customTime}
                        onChange={(e) => setCustomTime(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Consultation Fee */}
                {doctor.consultationFee && (
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                    <span className="text-sm font-medium">Consultation Fee:</span>
                    <span className="text-sm font-semibold">₹{doctor.consultationFee}</span>
                  </div>
                )}

                {/* Reason for visit */}
                <div>
                  <label className="block text-sm font-medium mb-2">Reason for visit *</label>
                  <textarea 
                    className="w-full px-3 py-2 border border-input rounded-md text-sm" 
                    rows={3}
                    placeholder="Please describe your symptoms or reason for consultation"
                    value={bookingReason}
                    onChange={(e) => setBookingReason(e.target.value)}
                    required
                  />
                </div>

                {/* Notice */}
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                    <div className="text-xs text-amber-700">
                      <p className="font-medium mb-1">Please Note:</p>
                      {requestMode === 'slot' ? (
                        <p>This slot will be booked immediately and confirmed.</p>
                      ) : (
                        <p>Your request will be sent to the doctor for approval.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowBookingModal(false);
                      setSelectedSlot(null);
                      setBookingReason('');
                      setCustomDate('');
                      setCustomTime('');
                    }} 
                    className="flex-1"
                    disabled={bookingLoading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="medical" 
                    className="flex-1" 
                    onClick={handleBookSlot}
                    disabled={bookingLoading || !bookingReason.trim() || (requestMode === 'custom' && (!customDate || !customTime))}
                  >
                    {bookingLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        {requestMode === 'slot' ? 'Booking...' : 'Sending...'}
                      </>
                    ) : (
                      <>
                        <Calendar className="h-4 w-4 mr-2" />
                        {requestMode === 'slot' ? 'Book Now' : 'Send Request'}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorProfilePage;
