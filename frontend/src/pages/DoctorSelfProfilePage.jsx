import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/contexts/AuthContext";
import { doctorAPI, authAPI } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { 
  Star, 
  MapPin, 
  Clock, 
  Calendar, 
  Phone, 
  Mail,
  User,
  GraduationCap,
  Award,
  Heart,
  MessageSquare,
  Share2,
  ArrowLeft,
  CheckCircle,
  Stethoscope,
  Edit as EditIcon,
  Plus,
  Trash2,
  Save,
  Camera
} from "lucide-react";
import ProfileImageUpload from "@/components/ui/ProfileImageUpload";

const DoctorSelfProfilePage = () => {
  const { user, isAuthenticated, logout, refreshUser } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingSection, setEditingSection] = useState(null);
  
  // Form states for different sections
  const [aboutForm, setAboutForm] = useState("");
  const [educationForm, setEducationForm] = useState({
    degree: "",
    institution: "",
    year: ""
  });
  
  const [certificationForm, setCertificationForm] = useState("");
  const [specializationForm, setSpecializationForm] = useState("");
  
  const [workingHoursForm, setWorkingHoursForm] = useState({
    Monday: "8:00 AM - 5:00 PM",
    Tuesday: "8:00 AM - 5:00 PM", 
    Wednesday: "8:00 AM - 5:00 PM",
    Thursday: "8:00 AM - 5:00 PM",
    Friday: "8:00 AM - 3:00 PM",
    Saturday: "Closed",
    Sunday: "Closed"
  });
  
  // Mock doctor data with editable structure
  const [doctorData, setDoctorData] = useState({
    id: 1,
    name: "Dr. Priya Sharma",
    specialty: "Cardiologist",
    subSpecialty: "Interventional Cardiology",
    rating: 4.9,
    reviews: 156,
    experience: "15+ years",
    location: "Heart Care Medical Center",
    address: "123 Medical Plaza, Downtown District",
    phone: "+1 (555) 123-4567",
    email: "dr.sharma@heartcare.com",
    languages: ["English", "Hindi", "Spanish"],
    acceptingNew: true,
    image: "/api/placeholder/300/300",
    about: "Dr. Priya Sharma is a board-certified cardiologist with over 15 years of experience in treating complex cardiovascular conditions. She specializes in interventional cardiology and has performed over 2,000 cardiac procedures. Dr. Sharma is committed to providing personalized, compassionate care to each of her patients.",
    education: [
      {
        degree: "MD - Doctor of Medicine",
        institution: "Harvard Medical School",
        year: "2008"
      },
      {
        degree: "Residency in Internal Medicine",
        institution: "Johns Hopkins Hospital",
        year: "2011"
      },
      {
        degree: "Fellowship in Cardiology",
        institution: "Mayo Clinic",
        year: "2013"
      }
    ],
    certifications: [
      "Board Certified - American Board of Internal Medicine",
      "Board Certified - American Board of Cardiovascular Disease",
      "Fellow of the American College of Cardiology",
      "Advanced Cardiac Life Support (ACLS)"
    ],
    specializations: [
      "Coronary Artery Disease",
      "Heart Failure Management",
      "Cardiac Catheterization",
      "Angioplasty and Stenting",
      "Preventive Cardiology",
      "Echocardiography"
    ],
    workingHours: {
      "Monday": "8:00 AM - 5:00 PM",
      "Tuesday": "8:00 AM - 5:00 PM", 
      "Wednesday": "8:00 AM - 5:00 PM",
      "Thursday": "8:00 AM - 5:00 PM",
      "Friday": "8:00 AM - 3:00 PM",
      "Saturday": "Closed",
      "Sunday": "Closed"
    }
  });

  // Mock reviews data
  const reviews = [
    {
      id: 1,
      patientName: "Sarah M.",
      rating: 5,
      date: "2 weeks ago",
      comment: "Dr. Sharma is exceptional. She took the time to explain my condition thoroughly and made me feel comfortable throughout the entire process. Highly recommend!"
    },
    {
      id: 2,
      patientName: "John D.",
      rating: 5,
      date: "1 month ago", 
      comment: "Professional, knowledgeable, and caring. Dr. Sharma's expertise in cardiology is evident, and her bedside manner is excellent."
    },
    {
      id: 3,
      patientName: "Maria R.",
      rating: 4,
      date: "2 months ago",
      comment: "Great experience overall. Dr. Sharma was very thorough in her examination and provided clear treatment options."
    }
  ];

  // Mock booked appointments data
  const bookedAppointments = [
    {
      id: 1,
      patientName: "Sarah Johnson",
      patientEmail: "sarah@example.com",
      date: "Dec 28, 2024",
      time: "10:00 AM",
      type: "Consultation",
      status: "Confirmed",
      reason: "Chest pain and shortness of breath",
      phone: "+1 (555) 123-4567"
    },
    {
      id: 2,
      patientName: "John Davis",
      patientEmail: "john@example.com",
      date: "Dec 28, 2024",
      time: "2:00 PM",
      type: "Follow-up",
      status: "Confirmed",
      reason: "Post-surgery checkup",
      phone: "+1 (555) 987-6543"
    },
    {
      id: 3,
      patientName: "Maria Rodriguez",
      patientEmail: "maria@example.com",
      date: "Dec 29, 2024",
      time: "11:00 AM",
      type: "New Patient",
      status: "Pending",
      reason: "General cardiology consultation",
      phone: "+1 (555) 456-7890"
    }
  ];

  // Available slots that doctor can manage
  const [availableSlots, setAvailableSlots] = useState([
    { id: 1, date: "Dec 30, 2024", time: "9:00 AM", isAvailable: true },
    { id: 2, date: "Dec 30, 2024", time: "10:00 AM", isAvailable: true },
    { id: 3, date: "Dec 30, 2024", time: "11:00 AM", isAvailable: true },
    { id: 4, date: "Dec 30, 2024", time: "2:00 PM", isAvailable: true },
    { id: 5, date: "Dec 30, 2024", time: "3:00 PM", isAvailable: true },
    { id: 6, date: "Dec 31, 2024", time: "9:00 AM", isAvailable: true },
    { id: 7, date: "Dec 31, 2024", time: "10:00 AM", isAvailable: false },
    { id: 8, date: "Dec 31, 2024", time: "11:00 AM", isAvailable: true }
  ]);

  // New slot form
  const [newSlot, setNewSlot] = useState({ date: "", time: "" });

  // Set initial doctor data from user info immediately
  useEffect(() => {
    if (user && isAuthenticated) {
      console.log('=== Setting doctor data from user ===');
      console.log('User object:', user);
      console.log('User firstName:', user.firstName);
      console.log('User lastName:', user.lastName);
      console.log('User profilePicture:', user.profilePicture);
      console.log('User email:', user.email);
      
      const doctorName = `Dr. ${user.firstName || 'Unknown'} ${user.lastName || 'Doctor'}`;
      console.log('Generated doctor name:', doctorName);
      
      setDoctorData(prev => {
        const newData = {
          ...prev,
          name: doctorName,
          email: user.email || prev.email,
          phone: user.phone || prev.phone,
          image: user.profilePicture || prev.image,
          specialty: user.primarySpecialty || prev.specialty,
          experience: user.yearsOfExperience ? `${user.yearsOfExperience}+ years` : prev.experience
        };
        console.log('Updated doctor data:', newData);
        return newData;
      });
    } else {
      console.log('User not available yet - user:', user, 'isAuthenticated:', isAuthenticated);
    }
  }, [user, isAuthenticated]);

  // Fetch additional doctor profile data from API
  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated || !user) return;
      
      try {
        setLoading(true);
        const d = await doctorAPI.getProfile();
        
        console.log('Fetched doctor profile data:', d);
        
        // Merge API data with existing user data
        setDoctorData(prev => ({
          ...prev,
          // Keep user data for name, email, etc.
          specialty: d?.primarySpecialty || prev.specialty,
          about: d?.bio || prev.about,
          education: d?.education || prev.education,
          certifications: d?.certificationsList || prev.certifications,
          specializations: d?.areasOfExpertise || prev.specializations,
          workingHours: d?.workingHours || prev.workingHours,
          acceptingNew: d?.isAcceptingNewPatients ?? prev.acceptingNew,
          experience: d?.yearsOfExperience ? `${d.yearsOfExperience}+ years` : prev.experience,
          image: user.profilePicture || d?.profileImage || prev.image,
          rating: d?.averageRating || prev.rating,
          reviews: d?.totalReviews || prev.reviews
        }));
        setDoctor(d);
      } catch (e) {
        console.log('Doctor profile API not available, using user data only:', e.message);
        // User data is already set in the first useEffect
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [isAuthenticated, user]);

  // Save functions
  const saveAbout = async () => {
    try {
      if (doctor) {
        await doctorAPI.updateProfile({ bio: aboutForm });
      }
      setDoctorData(prev => ({ ...prev, about: aboutForm }));
      setEditingSection(null);
    } catch (e) {
      alert(e.message || "Failed to update about section");
    }
  };

  const addEducation = () => {
    if (!educationForm.degree || !educationForm.institution) {
      alert('Please fill in all education fields');
      return;
    }
    const newEducation = [...doctorData.education, educationForm];
    setDoctorData(prev => ({ ...prev, education: newEducation }));
    setEducationForm({ degree: "", institution: "", year: "" });
    setEditingSection(null);
  };

  const addCertification = () => {
    if (!certificationForm.trim()) return;
    const newCerts = [...doctorData.certifications, certificationForm];
    setDoctorData(prev => ({ ...prev, certifications: newCerts }));
    setCertificationForm("");
  };

  const addSpecialization = () => {
    if (!specializationForm.trim()) return;
    const newSpecs = [...doctorData.specializations, specializationForm];
    setDoctorData(prev => ({ ...prev, specializations: newSpecs }));
    setSpecializationForm("");
  };

  const saveWorkingHours = async () => {
    try {
      if (doctor) {
        await doctorAPI.updateProfile({ workingHours: workingHoursForm });
      }
      setDoctorData(prev => ({ ...prev, workingHours: workingHoursForm }));
      setEditingSection(null);
    } catch (e) {
      alert(e.message || "Failed to update working hours");
    }
  };

  // Available slots management functions
  const addSlot = () => {
    if (!newSlot.date || !newSlot.time) {
      alert('Please select both date and time');
      return;
    }
    const newSlotData = {
      id: Date.now(),
      date: newSlot.date,
      time: newSlot.time,
      isAvailable: true
    };
    setAvailableSlots(prev => [...prev, newSlotData]);
    setNewSlot({ date: "", time: "" });
  };

  const deleteSlot = (slotId) => {
    setAvailableSlots(prev => prev.filter(slot => slot.id !== slotId));
  };

  const toggleSlotAvailability = (slotId) => {
    setAvailableSlots(prev => 
      prev.map(slot => 
        slot.id === slotId 
          ? { ...slot, isAvailable: !slot.isAvailable }
          : slot
      )
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6">Please login to view your profile.</CardContent>
        </Card>
      </div>
    );
  }
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-light">
      <Header 
        isAuthenticated={isAuthenticated} 
        userInitial={(user?.firstName?.[0]?.toUpperCase?.() || 'D')} 
        userType={user?.userType || 'doctor'} 
        onLogout={logout} 
      />
      
      {/* Back Navigation */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        <Link to="/find-care" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      {/* Doctor Profile Header */}
      <section className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <Card className="shadow-medium border-0">
            <CardContent className="p-8">
              <div className="grid lg:grid-cols-4 gap-8">
                
                {/* Doctor Photo & Quick Actions */}
                <div className="lg:col-span-1">
                  <div className="text-center">
                    <div className="relative inline-block">
                      {/* Profile Image Container */}
                      <div className="w-48 h-48 rounded-full overflow-hidden relative mx-auto mb-4 border-4 border-white shadow-lg group cursor-pointer">
                        {(doctorData.image && doctorData.image !== '/api/placeholder/300/300') ? (
                          <>
                            <img 
                              src={doctorData.image}
                              alt={doctorData.name}
                              className="w-full h-full object-cover transition-transform group-hover:scale-110"
                              onError={(e) => {
                                console.log('Image failed to load:', doctorData.image);
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            {/* Overlay for upload */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Camera className="h-8 w-8 text-white" />
                              <span className="text-white text-sm ml-2">Update Photo</span>
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary-light/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary-light/30 transition-colors">
                            <div className="text-center">
                              <User className="h-16 w-16 text-primary/50 mx-auto mb-2" />
                              <Camera className="h-6 w-6 text-primary/50 mx-auto" />
                              <span className="text-xs text-primary/70 block mt-1">Add Photo</span>
                            </div>
                          </div>
                        )}
                        
                        {/* Hidden file input for photo upload */}
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              console.log('File selected for upload:', file);
                              
                              try {
                                // First show preview immediately
                                const previewUrl = URL.createObjectURL(file);
                                setDoctorData(prev => ({ ...prev, image: previewUrl }));
                                
                                // Upload to backend
                                const { uploadAPI } = await import('@/services/api');
                                const uploadResult = await uploadAPI.uploadProfilePicture(file);
                                console.log('Profile picture upload result:', uploadResult);
                                
                                // Update with the actual uploaded URL
                                if (uploadResult.success && uploadResult.data) {
                                  const uploadedUrl = uploadResult.data.profilePicture || uploadResult.data.url;
                                  setDoctorData(prev => ({ ...prev, image: uploadedUrl }));
                                  
                                  // Refresh user data
                                  await refreshUser();
                                }
                                
                                // Clean up preview URL
                                URL.revokeObjectURL(previewUrl);
                                
                              } catch (error) {
                                console.error('Profile picture upload failed:', error);
                                // Revert to original image on error
                                setDoctorData(prev => ({ ...prev, image: user?.profilePicture || prev.image }));
                                alert('Failed to upload profile picture. Please try again.');
                              }
                            }
                          }}
                        />
                      </div>
                      
                      {doctorData.acceptingNew && (
                        <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-green-500 hover:bg-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Accepting New Patients
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-3 mt-6">
                      <Button variant="medical" size="lg" className="w-full">
                        <Calendar className="h-4 w-4 mr-2" />
                        Book Appointment
                      </Button>
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" className="flex-1">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="flex-1">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Doctor Information */}
                <div className="lg:col-span-3">
                  <div className="mb-6">
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                      {doctorData.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                      <Badge variant="secondary" className="text-primary font-medium">
                        <Stethoscope className="h-3 w-3 mr-1" />
                        {doctorData.specialty}
                      </Badge>
                      <Badge variant="outline">
                        {doctorData.subSpecialty}
                      </Badge>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="font-medium">{doctorData.rating}</span>
                        <span className="text-muted-foreground">({doctorData.reviews} reviews)</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{doctorData.experience} experience</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{doctorData.location}</div>
                          <div className="text-sm text-muted-foreground">{doctorData.address}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{doctorData.phone}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{doctorData.email}</span>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Languages:</div>
                        <div className="flex flex-wrap gap-2">
                          {doctorData.languages.map((lang) => (
                            <Badge key={lang} variant="outline" className="text-xs">
                              {lang}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Detailed Information Tabs */}
      <section className="pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <Tabs defaultValue="about" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
              <TabsTrigger value="slots">Available Slots</TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="space-y-6">
              <Card className="shadow-soft border-0">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      About Dr. {doctorData.name.split(' ').pop()}
                    </span>
                    {editingSection === 'about' ? (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setEditingSection(null)}>
                          Cancel
                        </Button>
                        <Button size="sm" onClick={saveAbout}>
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setAboutForm(doctorData.about);
                          setEditingSection('about');
                        }}
                      >
                        <EditIcon className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {editingSection === 'about' ? (
                    <Textarea 
                      placeholder="Write about yourself, your experience, and approach to patient care..."
                      value={aboutForm}
                      onChange={(e) => setAboutForm(e.target.value)}
                      rows={6}
                      className="w-full"
                    />
                  ) : (
                    <p className="text-muted-foreground leading-relaxed">
                      {doctorData.about}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-soft border-0">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-primary" />
                      Areas of Specialization
                    </span>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add specialization..."
                        value={specializationForm}
                        onChange={(e) => setSpecializationForm(e.target.value)}
                        className="w-48"
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={addSpecialization}
                        disabled={!specializationForm.trim()}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-3">
                    {doctorData.specializations.map((spec, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{spec}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="experience" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="shadow-soft border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-primary" />
                        Education
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setEditingSection(editingSection === 'education' ? null : 'education')}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {editingSection === 'education' && (
                      <div className="space-y-3 mb-6 p-4 border rounded-lg bg-accent/20">
                        <Input
                          placeholder="Degree (e.g., MD, DO, MBBS)"
                          value={educationForm.degree}
                          onChange={(e) => setEducationForm(prev => ({ ...prev, degree: e.target.value }))}
                        />
                        <Input
                          placeholder="Institution"
                          value={educationForm.institution}
                          onChange={(e) => setEducationForm(prev => ({ ...prev, institution: e.target.value }))}
                        />
                        <Input
                          placeholder="Year"
                          value={educationForm.year}
                          onChange={(e) => setEducationForm(prev => ({ ...prev, year: e.target.value }))}
                        />
                        <div className="flex gap-2">
                          <Button onClick={addEducation} size="sm">
                            Save Education
                          </Button>
                          <Button variant="outline" onClick={() => setEditingSection(null)} size="sm">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      {doctorData.education.map((edu, index) => (
                        <div key={index} className="border-l-2 border-primary/20 pl-4">
                          <div className="font-semibold">{edu.degree}</div>
                          <div className="text-primary">{edu.institution}</div>
                          <div className="text-sm text-muted-foreground">{edu.year}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-soft border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-primary" />
                        Certifications
                      </span>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add certification..."
                          value={certificationForm}
                          onChange={(e) => setCertificationForm(e.target.value)}
                          className="w-48"
                        />
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={addCertification}
                          disabled={!certificationForm.trim()}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {doctorData.certifications.map((cert, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{cert}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6">
              <Card className="shadow-soft border-0">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-primary" />
                      Patient Reviews
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="font-medium">{doctorData.rating}</span>
                      </div>
                      <span className="text-muted-foreground">({doctorData.reviews} reviews)</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-border last:border-0 pb-6 last:pb-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium">{review.patientName}</div>
                            <div className="flex items-center gap-1 text-yellow-500">
                              {[...Array(review.rating)].map((_, i) => (
                                <Star key={i} className="h-3 w-3 fill-current" />
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground">{review.date}</span>
                        </div>
                        <p className="text-muted-foreground">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appointments" className="space-y-6">
              <Card className="shadow-soft border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    My Appointments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bookedAppointments.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p>No appointments scheduled yet.</p>
                      </div>
                    ) : (
                      bookedAppointments.map((appointment) => (
                        <div key={appointment.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold text-lg">{appointment.patientName}</h3>
                              <p className="text-sm text-muted-foreground">{appointment.patientEmail}</p>
                              <p className="text-sm text-muted-foreground">{appointment.phone}</p>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{appointment.date}</div>
                              <div className="text-sm text-muted-foreground">{appointment.time}</div>
                              <Badge 
                                variant={appointment.status === 'Confirmed' ? 'default' : 'secondary'}
                                className="mt-1"
                              >
                                {appointment.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{appointment.type}</Badge>
                            </div>
                            <div>
                              <p className="text-sm"><strong>Reason:</strong> {appointment.reason}</p>
                            </div>
                            <div className="flex gap-2 mt-3">
                              <Button size="sm" variant="outline">
                                View Details
                              </Button>
                              <Button size="sm" variant="outline">
                                Reschedule
                              </Button>
                              {appointment.status === 'Pending' && (
                                <>
                                  <Button size="sm" variant="default">
                                    Confirm
                                  </Button>
                                  <Button size="sm" variant="destructive">
                                    Decline
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="slots" className="space-y-6">
              {/* Add New Slot */}
              <Card className="shadow-soft border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5 text-primary" />
                    Add New Available Slot
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Date</label>
                      <Input
                        type="date"
                        value={newSlot.date}
                        onChange={(e) => setNewSlot(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Time</label>
                      <Input
                        type="time"
                        value={newSlot.time}
                        onChange={(e) => setNewSlot(prev => ({ ...prev, time: e.target.value }))}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={addSlot} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Slot
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Manage Existing Slots */}
              <Card className="shadow-soft border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Manage Available Slots
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {availableSlots.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>No slots available. Add some slots above.</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {availableSlots.map((slot) => (
                        <div key={slot.id} className="border rounded-lg p-4 space-y-3">
                          <div className="text-center">
                            <div className="font-medium">{slot.date}</div>
                            <div className="text-sm text-muted-foreground">{slot.time}</div>
                            <Badge 
                              variant={slot.isAvailable ? "default" : "secondary"}
                              className="mt-2"
                            >
                              {slot.isAvailable ? "Available" : "Unavailable"}
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => toggleSlotAvailability(slot.id)}
                              className="flex-1"
                            >
                              {slot.isAvailable ? "Disable" : "Enable"}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => deleteSlot(slot.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default DoctorSelfProfilePage;
