import { useState } from "react";
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

const PatientProfilePage = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  // Mock patient data (structure from your TSX). You can wire real API later.
  const patient = {
    id: 1,
    firstName: user?.firstName || "John",
    lastName: user?.lastName || "Doe", 
    email: user?.email || "john.doe@email.com",
    phone: user?.phone || "+1 (555) 123-4567",
    dateOfBirth: user?.dateOfBirth || "1985-06-15",
    address: user?.address?.street || "123 Main Street, Downtown District",
    emergencyContact: {
      name: "Jane Doe",
      relationship: "Spouse",
      phone: "+1 (555) 987-6543"
    },
    medicalInfo: {
      bloodType: "O+",
      height: "5'10\"",
      weight: "165 lbs",
      allergies: ["Penicillin", "Shellfish"],
      chronicConditions: ["Hypertension", "Type 2 Diabetes"],
      medications: [
        { name: "Lisinopril", dosage: "10mg", frequency: "Daily" },
        { name: "Metformin", dosage: "500mg", frequency: "Twice daily" }
      ]
    }
  };

  const upcomingAppointments = [
    {
      id: 1,
      doctor: "Dr. Sarah Johnson",
      specialty: "Cardiology",
      date: "Dec 15, 2024",
      time: "2:00 PM",
      type: "Follow-up",
      location: "Heart Care Medical Center"
    },
    {
      id: 2,
      doctor: "Dr. Michael Chen",
      specialty: "Endocrinology", 
      date: "Dec 22, 2024",
      time: "10:30 AM",
      type: "Consultation",
      location: "Diabetes Care Clinic"
    }
  ];

  const recentAppointments = [
    {
      id: 1,
      doctor: "Dr. Emily Rodriguez",
      specialty: "General Medicine",
      date: "Nov 28, 2024",
      diagnosis: "Annual Physical Exam",
      notes: "Patient in good health. Continue current medications.",
      rating: 5
    },
    {
      id: 2,
      doctor: "Dr. David Park",
      specialty: "Orthopedics",
      date: "Oct 15, 2024",
      diagnosis: "Knee Pain Assessment",
      notes: "Recommended physical therapy. Follow up in 6 weeks.",
      rating: 4
    }
  ];

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

  const medications = patient.medicalInfo.medications;

  return (
    <div className="min-h-screen bg-gradient-light">
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
                    currentImage={user?.profilePicture}
                    size="lg"
                    onImageUpdate={(url, publicId) => {
                      console.log('Profile image updated:', url, publicId);
                    }}
                  />
                  
                  <div className="text-center lg:text-left">
                    <h1 className="text-2xl font-bold text-foreground mb-2">
                      {patient.firstName} {patient.lastName}
                    </h1>
                    <p className="text-muted-foreground mb-4">
                      Patient ID: #PAT-{patient.id.toString().padStart(6, '0')}
                    </p>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant={isEditing ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setIsEditing(!isEditing)}
                      >
                        <EditIcon className="h-4 w-4 mr-2" />
                        {isEditing ? "Save Changes" : "Edit Profile"}
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
                        {isEditing ? (
                          <Input defaultValue={patient.email} className="text-sm" />
                        ) : (
                          <span className="text-muted-foreground">{patient.email}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {isEditing ? (
                          <Input defaultValue={patient.phone} className="text-sm" />
                        ) : (
                          <span className="text-muted-foreground">{patient.phone}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {isEditing ? (
                          <Input defaultValue={patient.address} className="text-sm" />
                        ) : (
                          <span className="text-muted-foreground">{patient.address}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Born: {new Date(patient.dateOfBirth).toLocaleDateString()}
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
                          <Input defaultValue={patient.emergencyContact.name} className="text-sm" />
                        ) : (
                          <span className="text-muted-foreground">{patient.emergencyContact.name}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <Heart className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{patient.emergencyContact.relationship}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {isEditing ? (
                          <Input defaultValue={patient.emergencyContact.phone} className="text-sm" />
                        ) : (
                          <span className="text-muted-foreground">{patient.emergencyContact.phone}</span>
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
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        Health Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        {[{ label: "Blood Pressure", current: "128/82", color: "text-yellow-600" },{ label: "Heart Rate", current: "72 bpm", color: "text-green-600" },{ label: "Weight", current: "165 lbs", color: "text-green-600" },{ label: "Blood Sugar", current: "145 mg/dL", color: "text-red-600" }].map((vital, index) => (
                          <div key={index} className="p-4 bg-accent/30 rounded-lg">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{vital.label}</span>
                              <span className={`text-sm font-medium ${vital.color}`}>
                                {vital.current}
                              </span>
                            </div>
                          </div>
                        ))}
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
                      <Badge variant="secondary">{patient.medicalInfo.bloodType}</Badge>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Height / Weight</div>
                      <div className="font-medium">{patient.medicalInfo.height} / {patient.medicalInfo.weight}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Allergies</div>
                      <div className="space-y-1">
                        {patient.medicalInfo.allergies.map((allergy, index) => (
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
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <Stethoscope className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{appointment.doctor}</div>
                            <div className="text-sm text-muted-foreground">{appointment.specialty}</div>
                            <div className="text-sm text-muted-foreground">{appointment.location}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{appointment.date}</div>
                          <div className="text-sm text-muted-foreground">{appointment.time}</div>
                          <Badge variant="secondary" className="mt-1">
                            {appointment.type}
                          </Badge>
                        </div>
                      </div>
                    ))}
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
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <Stethoscope className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{appointment.doctor}</div>
                            <div className="text-sm text-muted-foreground">{appointment.specialty}</div>
                            <div className="text-sm text-muted-foreground">{appointment.location}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{appointment.date}</div>
                          <div className="text-sm text-muted-foreground">{appointment.time}</div>
                          <div className="flex gap-2 mt-2">
                            <Button variant="outline" size="sm">Reschedule</Button>
                            <Button variant="medical" size="sm">Join Call</Button>
                          </div>
                        </div>
                      </div>
                    ))}
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
                    {recentAppointments.map((appointment) => (
                      <div key={appointment.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium">{appointment.doctor}</div>
                            <div className="text-sm text-muted-foreground">{appointment.specialty}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">{appointment.date}</div>
                            <div className="flex items-center gap-1">
                              {[...Array(appointment.rating)].map((_, i) => (
                                <Star key={i} className="h-3 w-3 text-yellow-500 fill-current" />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="mb-2">
                          <Badge variant="secondary">{appointment.diagnosis}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{appointment.notes}</p>
                      </div>
                    ))}
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
                    {patient.medicalInfo.chronicConditions.map((condition, index) => (
                      <Badge key={index} variant="destructive" className="text-sm">
                        {condition}
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
