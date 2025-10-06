import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  User, 
  Calendar, 
  FileText, 
  Heart, 
  Edit as EditIcon, 
  Phone, 
  Mail,
  MapPin,
  Pill,
  Activity,
  AlertTriangle,
  Download,
  Plus,
  Stethoscope,
  Star,
  Camera
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ProfileImageUpload from "@/components/ui/ProfileImageUpload";
import { patientAPI, authAPI, appointmentsAPI } from "@/services/api";

const PatientProfilePage = () => {
  const { user, isAuthenticated, logout, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingHealth, setIsEditingHealth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [patient, setPatient] = useState(null);
  const [emergencyEdit, setEmergencyEdit] = useState({ name: '', relationship: '', phone: '' });
  const [contactEdit, setContactEdit] = useState({ phone: '', street: '', city: '' });
  const [healthEdit, setHealthEdit] = useState({
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    heartRate: '',
    weight: '',
    bloodSugar: ''
  });
  // Appointments state
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [completedAppointments, setCompletedAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const profile = await patientAPI.getProfile();
        setPatient(profile);
      } catch (e) {
        console.error('Patient profile fetch error:', e);
        if (e.message?.includes('404') || e.message?.includes('not found')) {
          // Patient profile doesn't exist yet, create an empty state
          setPatient({});
          setError('');
        } else {
          setError(e.message || "Failed to load patient profile");
        }
      } finally {
        setLoading(false);
      }
    };
    const fetchAppointments = async () => {
      try {
        setAppointmentsLoading(true);
        setAppointmentsError('');
        const myAppointments = await appointmentsAPI.getMyAppointments('all');
        // Separate upcoming and completed
        const now = new Date();
        const upcoming = myAppointments.filter(a => ['pending','confirmed','rescheduled'].includes(a.status) && new Date(a.appointmentDate) >= now);
        const completed = myAppointments.filter(a => a.status === 'completed');
        setUpcomingAppointments(upcoming);
        setCompletedAppointments(completed);
      } catch (e) {
        console.error('Appointments fetch error:', e);
        setAppointmentsError(e.message || 'Failed to load appointments');
        setUpcomingAppointments([]);
        setCompletedAppointments([]);
      } finally {
        setAppointmentsLoading(false);
      }
    };
    if (isAuthenticated) {
      fetchProfile();
      fetchAppointments();
    }
  }, [isAuthenticated]);

  const primaryEmergency = useMemo(() => {
    if (!patient?.emergencyContacts?.length) return null;
    return patient.emergencyContacts.find(c => c.isPrimary) || patient.emergencyContacts[0];
  }, [patient]);

  useEffect(() => {
    if (primaryEmergency) {
      setEmergencyEdit({
        name: primaryEmergency.name || '',
        relationship: primaryEmergency.relationship || '',
        phone: primaryEmergency.phone || ''
      });
    }
  }, [primaryEmergency]);

  const activeMeds = useMemo(() => patient?.medications?.current?.filter(m => m.isActive) || [], [patient]);
  const allergies = useMemo(() => patient?.allergies || [], [patient]);

  // Get proper patient name from populated userId or fallback to user
  const patientName = patient?.userId ? 
    `${patient.userId.firstName || ""} ${patient.userId.lastName || ""}`.trim() :
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Patient";

  // Get contact info from populated patient userId or fallback to user
  const patientEmail = patient?.userId?.email || user?.email || 'N/A';
  const patientPhone = patient?.userId?.phone || user?.phone || 'N/A';
  const patientAddress = patient?.userId?.address || user?.address || {};
  const patientDOB = patient?.userId?.dateOfBirth || user?.dateOfBirth;
  const patientProfilePicture = patient?.userId?.profilePicture || user?.profilePicture;

  useEffect(() => {
    setContactEdit({
      phone: patientPhone !== 'N/A' ? patientPhone : '',
      street: patientAddress?.street || '',
      city: patientAddress?.city || ''
    });
  }, [patientPhone, patientAddress]);

  // Initialize health edit form with existing values
  useEffect(() => {
    if (patient) {
      const bp = patient.vitalSigns?.bloodPressure;
      const hr = patient.vitalSigns?.heartRate;
      const weight = patient.vitalSigns?.weight;
      const bloodSugar = patient.customVitals?.bloodSugar;
      
      setHealthEdit({
        bloodPressureSystolic: bp?.systolic?.toString() || '',
        bloodPressureDiastolic: bp?.diastolic?.toString() || '',
        heartRate: hr?.value?.toString() || '',
        weight: weight?.value?.toString() || '',
        bloodSugar: bloodSugar?.value?.toString() || ''
      });
    }
  }, [patient]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6">Please login to view your profile.</CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  // Derived quick info
  const quickAllergies = allergies.slice(0, 4).map(a => a.allergen);
  const bloodType = patient?.medicalHistory?.bloodType || "N/A";

  // Fallback meds list
  const medications = activeMeds.length ? activeMeds.map(m => ({ name: m.name, dosage: m.dosage || "", frequency: m.frequency || "" })) : [];

  // Removed static upcomingAppointments and recentAppointments; using dynamic data from API

  const labResults = [
    {
      id: 1,
      testName: "Comprehensive Metabolic Panel",
      date: "Nov 25, 2024",
      status: "Normal",
      doctor: "Dr. Emily Rodriguez"
    },
    {
      id: 2,
      testName: "HbA1c Test",
      date: "Nov 25, 2024",
      status: "Elevated",
      doctor: "Dr. Emily Rodriguez"
    },
    {
      id: 3,
      testName: "Lipid Panel",
      date: "Aug 10, 2024",
      status: "Normal",
      doctor: "Dr. Sarah Johnson"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-light patient-profile">
      <Header 
        isAuthenticated={isAuthenticated}
        userInitial={(user?.firstName?.[0]?.toUpperCase?.() || 'U')}
        userType={user?.userType || 'patient'}
        onLogout={logout}
      />
      
      {/* Patient Profile Header */}
      <section className="py-8 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <Card className="shadow-medium border-0">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row gap-8">
                
                {/* Profile Photo & Basic Info */}
                <div className="flex flex-col items-center lg:items-start">
                  <ProfileImageUpload 
                    currentImage={patientProfilePicture}
                    size="lg"
                    onImageUpdate={(url, publicId) => {
                      console.log('Profile image updated:', url, publicId);
                      // Refresh patient data after image update
                      const fetchProfile = async () => {
                        try {
                          const profile = await patientAPI.getProfile();
                          setPatient(profile);
                        } catch (e) {
                          console.error('Error refreshing patient profile:', e);
                        }
                      };
                      fetchProfile();
                    }}
                  />
                  
                  <div className="text-center lg:text-left">
                    <h1 className="text-2xl font-bold text-foreground mb-2">
                      {patientName}
                    </h1>
                    <p className="text-muted-foreground mb-4">
                      Patient ID: {patient?.patientId || 'N/A'}
                    </p>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant={isEditing ? "default" : "outline"} 
                        size="sm"
                        onClick={async () => {
                          if (isEditing) {
                            // Save edits: currently only emergency contact via patient profile
                            try {
                              if (emergencyEdit) {
                                await patientAPI.updateProfile({
                                  emergencyContacts: [{
                                    name: emergencyEdit.name,
                                    relationship: emergencyEdit.relationship || 'spouse',
                                    phone: emergencyEdit.phone,
                                    isPrimary: true
                                  }]
                                });
                              }
                              // Save user contact info
                              await authAPI.updateProfile({
                                phone: contactEdit.phone,
                                address: {
                                  ...(user?.address || {}),
                                  street: contactEdit.street,
                                  city: contactEdit.city
                                }
                              });
                              await refreshUser();
                              // Re-fetch patient profile to reflect updates
                              const profile = await patientAPI.getProfile();
                              setPatient(profile);
                            } catch (e) {
                              console.error(e);
                            }
                          }
                          setIsEditing(!isEditing);
                        }}
                      >
                        <EditIcon className="h-4 w-4 mr-2" />
                        {isEditing ? "Done" : "Edit Profile"}
                      </Button>
                      <Button variant="medical" size="sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        Book Appointment
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Contact & Emergency Info */}
                <div className="flex-1 grid md:grid-cols-2 gap-6">
                  
                  {/* Personal Information */}
                  <div>
                    <h3 className="font-semibold text-foreground mb-4">Contact Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{patientEmail}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {isEditing ? (
                          <Input value={contactEdit.phone} onChange={(e) => setContactEdit(prev => ({...prev, phone: e.target.value}))} className="text-sm" />
                        ) : (
                          <span className="text-muted-foreground">{patientPhone}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {isEditing ? (
                          <div className="grid gap-2 w-full">
                            <Input placeholder="Street" value={contactEdit.street} onChange={(e) => setContactEdit(prev => ({...prev, street: e.target.value}))} className="text-sm" />
                            <Input placeholder="City" value={contactEdit.city} onChange={(e) => setContactEdit(prev => ({...prev, city: e.target.value}))} className="text-sm" />
                          </div>
                        ) : (
                          <span className="text-muted-foreground">{patientAddress?.street || patientAddress?.city || 'N/A'}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Born: {patientDOB ? new Date(patientDOB).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div>
                    <h3 className="font-semibold text-foreground mb-4">Emergency Contact</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {isEditing ? (
                          <Input value={emergencyEdit?.name || ''} onChange={(e) => setEmergencyEdit(prev => ({...prev, name: e.target.value}))} className="text-sm" />
                        ) : (
                          <span className="text-muted-foreground">{primaryEmergency?.name || 'N/A'}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <Heart className="h-4 w-4 text-muted-foreground" />
                        {isEditing ? (
                          <Input value={emergencyEdit?.relationship || ''} onChange={(e) => setEmergencyEdit(prev => ({...prev, relationship: e.target.value}))} className="text-sm" />
                        ) : (
                          <span className="text-muted-foreground">{primaryEmergency?.relationship || 'N/A'}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {isEditing ? (
                          <Input value={emergencyEdit?.phone || ''} onChange={(e) => setEmergencyEdit(prev => ({...prev, phone: e.target.value}))} className="text-sm" />
                        ) : (
                          <span className="text-muted-foreground">{primaryEmergency?.phone || 'N/A'}</span>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Main Content Tabs */}
      <section className="pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
              <TabsTrigger value="medical">Medical History</TabsTrigger>
              <TabsTrigger value="medications">Medications</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              
              {/* Vital Signs & Health Metrics */}
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card className="shadow-soft border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Activity className="h-5 w-5 text-primary" />
                          Health Overview
                        </span>
                        <Button 
                          variant={isEditingHealth ? "default" : "outline"}
                          size="sm"
                          onClick={async () => {
                            if (isEditingHealth) {
                              // Save health data
                              try {
                                await patientAPI.updateHealthOverview(healthEdit);
                                // Refresh patient data
                                const profile = await patientAPI.getProfile();
                                setPatient(profile);
                              } catch (e) {
                                console.error('Error updating health overview:', e);
                              }
                            }
                            setIsEditingHealth(!isEditingHealth);
                          }}
                        >
                          <EditIcon className="h-4 w-4 mr-2" />
                          {isEditingHealth ? "Save" : "Edit"}
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Blood Pressure */}
                        <div className="p-4 bg-accent/30 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Blood Pressure</span>
                            {isEditingHealth ? (
                              <div className="flex gap-1 items-center">
                                <Input 
                                  className="w-16 h-8 text-sm" 
                                  placeholder="120" 
                                  value={healthEdit.bloodPressureSystolic}
                                  onChange={(e) => setHealthEdit(prev => ({...prev, bloodPressureSystolic: e.target.value}))}
                                />
                                <span>/</span>
                                <Input 
                                  className="w-16 h-8 text-sm" 
                                  placeholder="80" 
                                  value={healthEdit.bloodPressureDiastolic}
                                  onChange={(e) => setHealthEdit(prev => ({...prev, bloodPressureDiastolic: e.target.value}))}
                                />
                              </div>
                            ) : (
                              <span className="text-sm font-medium text-yellow-600">
                                {patient?.vitalSigns?.bloodPressure ? 
                                  `${patient.vitalSigns.bloodPressure.systolic}/${patient.vitalSigns.bloodPressure.diastolic}` : 
                                  'N/A'
                                }
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Heart Rate */}
                        <div className="p-4 bg-accent/30 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Heart Rate</span>
                            {isEditingHealth ? (
                              <Input 
                                className="w-20 h-8 text-sm" 
                                placeholder="72" 
                                value={healthEdit.heartRate}
                                onChange={(e) => setHealthEdit(prev => ({...prev, heartRate: e.target.value}))}
                              />
                            ) : (
                              <span className="text-sm font-medium text-green-600">
                                {patient?.vitalSigns?.heartRate?.value ? 
                                  `${patient.vitalSigns.heartRate.value} bpm` : 
                                  'N/A'
                                }
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Weight */}
                        <div className="p-4 bg-accent/30 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Weight</span>
                            {isEditingHealth ? (
                              <Input 
                                className="w-20 h-8 text-sm" 
                                placeholder="165" 
                                value={healthEdit.weight}
                                onChange={(e) => setHealthEdit(prev => ({...prev, weight: e.target.value}))}
                              />
                            ) : (
                              <span className="text-sm font-medium text-green-600">
                                {patient?.vitalSigns?.weight?.value ? 
                                  `${patient.vitalSigns.weight.value} ${patient.vitalSigns.weight.unit || 'lbs'}` : 
                                  'N/A'
                                }
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Blood Sugar */}
                        <div className="p-4 bg-accent/30 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Blood Sugar</span>
                            {isEditingHealth ? (
                              <Input 
                                className="w-20 h-8 text-sm" 
                                placeholder="145" 
                                value={healthEdit.bloodSugar}
                                onChange={(e) => setHealthEdit(prev => ({...prev, bloodSugar: e.target.value}))}
                              />
                            ) : (
                              <span className="text-sm font-medium text-red-600">
                                {patient?.customVitals?.bloodSugar?.value ? 
                                  `${patient.customVitals.bloodSugar.value} ${patient.customVitals.bloodSugar.unit || 'mg/dL'}` : 
                                  'N/A'
                                }
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Medical Info */}
                <Card className="shadow-soft border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Quick Medical Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Blood Type</div>
                      <Badge variant="secondary">{bloodType}</Badge>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Allergies</div>
                      <div className="space-y-1">
                        {quickAllergies.length === 0 && (
                          <span className="text-muted-foreground text-sm">No allergies recorded</span>
                        )}
                        {quickAllergies.map((allergy, index) => (
                          <Badge key={index} variant="destructive" className="text-xs mr-2">
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Upcoming Appointments */}
              <Card className="shadow-soft border-0">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      Upcoming Appointments
                    </span>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule New
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {appointmentsError && (
                    <div className="text-sm text-red-600 mb-3">{appointmentsError}</div>
                  )}
                  <div className="space-y-4">
                    {appointmentsLoading ? (
                      <div className="text-sm text-muted-foreground">Loading appointments...</div>
                    ) : upcomingAppointments.length === 0 ? (
                      <div className="text-sm text-muted-foreground">No upcoming appointments</div>
                    ) : (
                      upcomingAppointments.map((apt) => {
                        const date = new Date(apt.appointmentDate);
                        const doctorName = `Dr. ${apt.doctorId?.userId?.firstName || ''} ${apt.doctorId?.userId?.lastName || ''}`.trim();
                        return (
                          <div key={apt._id} className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                <Stethoscope className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <div className="font-medium">{doctorName || 'Doctor'}</div>
                                <div className="text-sm text-muted-foreground">{apt.doctorId?.primarySpecialty || 'Specialty'}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{date.toLocaleDateString()}</div>
                              <div className="text-sm text-muted-foreground">{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                              <Badge variant="secondary" className="mt-1 capitalize">{apt.appointmentType || 'consultation'}</Badge>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Appointments Tab */}
            <TabsContent value="appointments" className="space-y-6">
              
              {/* Upcoming Appointments */}
              <Card className="shadow-soft border-0">
                <CardHeader>
                  <CardTitle>Upcoming Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  {appointmentsError && (
                    <div className="text-sm text-red-600 mb-3">{appointmentsError}</div>
                  )}
                  <div className="space-y-4">
                    {appointmentsLoading ? (
                      <div className="text-sm text-muted-foreground">Loading...</div>
                    ) : upcomingAppointments.length === 0 ? (
                      <div className="text-sm text-muted-foreground">No upcoming appointments</div>
                    ) : (
                      upcomingAppointments.map((apt) => {
                        const date = new Date(apt.appointmentDate);
                        const doctorName = `Dr. ${apt.doctorId?.userId?.firstName || ''} ${apt.doctorId?.userId?.lastName || ''}`.trim();
                        return (
                          <div key={apt._id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                <Stethoscope className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <div className="font-medium">{doctorName || 'Doctor'}</div>
                                <div className="text-sm text-muted-foreground">{apt.doctorId?.primarySpecialty || 'Specialty'}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{date.toLocaleDateString()}</div>
                              <div className="text-sm text-muted-foreground">{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                              <div className="flex gap-2 mt-2">
                                <Button variant="outline" size="sm">Reschedule</Button>
                                {apt.consultationType === 'telemedicine' && (
                                  <Button variant="medical" size="sm">Join Call</Button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Past Appointments */}
              <Card className="shadow-soft border-0">
                <CardHeader>
                  <CardTitle>Recent Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {appointmentsLoading ? (
                      <div className="text-sm text-muted-foreground">Loading...</div>
                    ) : completedAppointments.length === 0 ? (
                      <div className="text-sm text-muted-foreground">No completed appointments</div>
                    ) : (
                      completedAppointments.map((apt) => {
                        const date = new Date(apt.appointmentDate);
                        const doctorName = `Dr. ${apt.doctorId?.userId?.firstName || ''} ${apt.doctorId?.userId?.lastName || ''}`.trim();
                        const diagnosis = apt.diagnosis?.primary || 'Diagnosis';
                        const notes = apt.doctorNotes || 'No feedback provided.';
                        return (
                          <div key={apt._id} className="p-4 border rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <div className="font-medium">{doctorName || 'Doctor'}</div>
                                <div className="text-sm text-muted-foreground">{apt.doctorId?.primarySpecialty || 'Specialty'}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-muted-foreground">{date.toLocaleDateString()}</div>
                              </div>
                            </div>
                            <div className="mb-2">
                              <Badge variant="secondary">{diagnosis}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{notes}</p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Medical History Tab */}
            <TabsContent value="medical" className="space-y-6">
              
              {/* Chronic Conditions */}
              <Card className="shadow-soft border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-primary" />
                    Chronic Conditions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {(patient?.medicalHistory?.currentConditions || []).map((cond, index) => (
                      <Badge key={index} variant="destructive" className="text-sm">
                        {cond?.condition || 'Condition'}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Lab Results */}
              <Card className="shadow-soft border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Recent Lab Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {labResults.map((result) => (
                      <div key={result.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">{result.testName}</div>
                          <div className="text-sm text-muted-foreground">
                            Ordered by {result.doctor} â€¢ {result.date}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={result.status === "Normal" ? "secondary" : "destructive"}
                          >
                            {result.status}
                          </Badge>
                          <Button variant="outline" size="icon">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Medications Tab */}
            <TabsContent value="medications" className="space-y-6">
              <Card className="shadow-soft border-0">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Pill className="h-5 w-5 text-primary" />
                      Current Medications
                    </span>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Medication
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {medications.map((medication, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <Pill className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{medication.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {medication.dosage} â€¢ {medication.frequency}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="destructive" size="sm">Stop</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="space-y-6">
              <Card className="shadow-soft border-0">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Medical Documents
                    </span>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Upload Document
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      No documents uploaded yet
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Upload medical documents, test results, and other important files here.
                    </p>
                    <Button variant="medical">
                      <Plus className="h-4 w-4 mr-2" />
                      Upload Your First Document
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default PatientProfilePage;
