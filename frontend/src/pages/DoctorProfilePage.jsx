import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Calendar, Stethoscope, Award, Clock, Star, MapPin, Phone, Mail, UserCircle2, BookOpen, Heart, Shield, Users, MessageCircle, Share2, ArrowLeft, CheckCircle, Video, Building, GraduationCap, Languages, DollarSign } from 'lucide-react';
import { doctorAPI } from '@/services/api';

const DoctorProfilePage = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        const doc = await doctorAPI.getById(id);
        setDoctor(doc);
      } catch (e) {
        setError(e.message || 'Failed to load doctor');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  const handleBookAppointment = () => {
    if (!isAuthenticated) {
      // Redirect to login or show login modal
      navigate('/login', { state: { returnTo: `/doctor/${id}` } });
      return;
    }
    setShowBookingModal(true);
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
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Star className="h-5 w-5" />
                          <span>{doctor.averageRating?.toFixed?.(1) ?? 'N/A'}</span>
                        </div>
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

              {/* Availability */}
              <TabsContent value="availability" className="mt-6">
                <Card className="border-none shadow-soft">
                  <CardHeader>
                    <CardTitle>Available Slots</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {doctor.availability && doctor.availability.length > 0 ? (
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {doctor.availability.map((slot, i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-md border bg-card">
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4" />
                              <span>{slot.day}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {slot.startTime} - {slot.endTime}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No availability posted.</p>
                    )}
                    <div className="mt-4">
                      <Button variant="medical" onClick={handleBookAppointment}>
                        <Calendar className="h-4 w-4 mr-2" /> Book Appointment
                      </Button>
                    </div>
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
                    {mockReviews.map((r) => (
                      <div key={r.id} className="p-4 rounded-md border">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span className="font-medium">{r.patientName}</span>
                          </div>
                          <div className="flex items-center gap-1 text-yellow-500">
                            <Star className="h-4 w-4" />
                            <span className="text-sm">{r.rating}.0</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{r.comment}</p>
                        <div className="text-xs text-muted-foreground mt-2">{new Date(r.date).toLocaleDateString()}</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Booking Modal - Simple placeholder for now */}
        {showBookingModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowBookingModal(false)}>
            <Card className="w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
              <CardHeader>
                <CardTitle>Book Appointment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Book an appointment with Dr. {doctor?.userId?.firstName} {doctor?.userId?.lastName}
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Preferred Date</label>
                    <input 
                      type="date" 
                      className="w-full px-3 py-2 border border-input rounded-md text-sm" 
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Preferred Time</label>
                    <select className="w-full px-3 py-2 border border-input rounded-md text-sm">
                      <option value="">Select time</option>
                      <option value="09:00">9:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="14:00">2:00 PM</option>
                      <option value="15:00">3:00 PM</option>
                      <option value="16:00">4:00 PM</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Reason for visit</label>
                    <textarea 
                      className="w-full px-3 py-2 border border-input rounded-md text-sm" 
                      rows={3}
                      placeholder="Brief description of your concern"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowBookingModal(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button variant="medical" className="flex-1">
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Appointment
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
