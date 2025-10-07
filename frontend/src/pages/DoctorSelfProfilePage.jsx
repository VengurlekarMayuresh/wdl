import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/contexts/AuthContext";
import { doctorAPI, authAPI, appointmentsAPI, slotsAPI } from "@/services/api";
import { reviewsAPI } from "@/services/api";
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
  Camera,
  XCircle,
  AlertCircle
} from "lucide-react";
import { toast } from '@/components/ui/sonner';
import PromptDialog from '@/components/ui/PromptDialog';
import ProfileImageUpload from "@/components/ui/ProfileImageUpload";
import SlotManager from "@/components/appointment/SlotManager";

// Simple appointment card that actually works
const AppointmentCard = ({ appointment, onApprove, onReject, isLoading, showActions = false }) => {
  console.log('📋 Rendering appointment:', appointment);
  
  if (!appointment || !appointment._id) {
    return (
      <Card className="border border-gray-200">
        <CardContent className="p-4 text-center text-gray-500">
          <p>Invalid appointment data</p>
        </CardContent>
      </Card>
    );
  }

  const patient = appointment.patientId || {};
  const slot = appointment.slotId || {};
  
  // Safe date formatting
  const formatDateTime = (dateTime) => {
    try {
      const date = new Date(dateTime);
      return {
        date: date.toLocaleDateString(),
        time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
    } catch (e) {
      return { date: 'Invalid Date', time: 'Invalid Time' };
    }
  };
  
  const { date, time } = formatDateTime(slot.dateTime || appointment.appointmentDate || new Date());
  
  // Status badge
  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        statusColors[status] || statusColors.pending
      }`}>
        {status || 'pending'}
      </span>
    );
  };

  return (
    <Card className="border border-gray-200 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold text-lg">
              {patient?.userId?.firstName || patient?.firstName || 'Patient'} {patient?.userId?.lastName || patient?.lastName || ''}
            </h3>
            <p className="text-sm text-gray-600">
              {patient?.userId?.email || patient?.email || 'No email provided'}
            </p>
            {(patient?.userId?.phone || patient?.phone) && (
              <p className="text-sm text-gray-600">
                📞 {patient?.userId?.phone || patient?.phone}
              </p>
            )}
          </div>
          {getStatusBadge(appointment.status)}
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-sm">{date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-sm">{time}</span>
          </div>
        </div>

        {/* Reason for visit */}
        {appointment.reasonForVisit && (
          <div className="mb-3 p-3 bg-blue-50 border-l-4 border-blue-400">
            <p className="text-sm text-blue-800">
              <strong>Reason:</strong> {appointment.reasonForVisit}
            </p>
          </div>
        )}

        {/* Reschedule reason */}
        {appointment.rescheduledFrom?.reason && (
          <div className="mb-4 p-3 bg-amber-50 border-l-4 border-amber-400">
            <p className="text-sm text-amber-800">
              <strong>Reschedule reason:</strong> {appointment.rescheduledFrom.reason}
            </p>
          </div>
        )}

        {/* Rejection reason */}
        {appointment.rejectionReason && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-400">
            <p className="text-sm text-red-800">
              <strong>Rejection Reason:</strong> {appointment.rejectionReason}
            </p>
          </div>
        )}

        {/* Action buttons */}
        {showActions && appointment.status === 'pending' && (
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={() => {
                console.log('✅ Approving appointment:', appointment._id);
                onApprove(appointment._id);
              }}
              disabled={isLoading === 'approving'}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {isLoading === 'approving' ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Approving...
                </div>
              ) : (
                <>✅ Approve</>
              )}
            </Button>
            <Button
              onClick={() => {
                console.log('❌ Rejecting appointment:', appointment._id);
                onReject(appointment._id);
              }}
              disabled={isLoading === 'rejecting'}
              variant="outline"
              className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
            >
              {isLoading === 'rejecting' ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2" />
                  Rejecting...
                </div>
              ) : (
                <>❌ Reject</>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const DoctorSelfProfilePage = () => {
  const { user, isAuthenticated, logout, refreshUser } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingSection, setEditingSection] = useState(null);
  
  // Dynamic data states
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [prompt, setPrompt] = useState({ open: false, appointmentId: null });
  
  // Load my doctor profile and reviews
  useEffect(() => {
    (async () => {
      try {
        const d = await doctorAPI.getProfile();
        setDoctorProfile(d);
        setLoadingReviews(true);
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/doctors/${d._id}/reviews`, {
            headers: { 'Accept': 'application/json', ...(localStorage.getItem('token') ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {}) }
          });
          const data = await res.json();
          if (data?.success && data?.data?.reviews) setReviews(data.data.reviews);
        } catch (e) {
          console.log('Load reviews failed', e);
        } finally {
          setLoadingReviews(false);
        }
      } catch (e) {
        console.log('Load doctor profile failed', e);
      }
    })();
  }, []);
  
  // Appointment management state
  const [appointments, setAppointments] = useState({
    pending: [],
    upcoming: [],
    completed: [],
    cancelled: []
  });
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [selectedApptTab, setSelectedApptTab] = useState('pending');
  
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
  
  // Complete profile editing form
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialty: "",
    subSpecialty: "",
    bio: "",
    experience: "",
    location: "",
    address: "",
    languages: [],
    acceptingNew: false
  });
  
  // New language input
  const [newLanguage, setNewLanguage] = useState("");
  
  // Dynamic doctor data - initialized from user, then populated from backend
  const [doctorData, setDoctorData] = useState({
    id: null,
    name: "Loading...",
    specialty: "Loading...",
    subSpecialty: "",
    rating: 0,
    reviews: 0,
    experience: "",
    location: "",
    address: "",
    phone: "",
    email: "",
    languages: [],
    acceptingNew: false,
    image: "/api/placeholder/300/300",
    about: "",
    education: [],
    certifications: [],
    specializations: [],
    workingHours: {}
  });


  
  // Extended API functions for missing endpoints
  const extendedAPI = {
    // Note: Review data should come from actual patient reviews
    // For now, we'll show placeholder data until review system is implemented
    async getReviews() {
      console.log('🔄 Reviews are now managed dynamically (placeholder)');
      return []; // Return empty array - no static data
    },
    
    // Note: Appointment data is now managed in the dedicated appointments pages
    // This static data has been removed to use real dynamic appointment management
    
  };

  // Set initial doctor data from user info immediately
  useEffect(() => {
    if (user && isAuthenticated) {
      console.log('=== Setting initial doctor data from flattened user ===');
      console.log('👤 User object:', user);
      console.log('👤 User keys:', Object.keys(user));
      console.log('🔧 Profile data:', user.profile);
      
      const doctorName = `Dr. ${user.firstName || 'Unknown'} ${user.lastName || 'Doctor'}`;
      console.log('🏥 Generated doctor name:', doctorName);
      
      setDoctorData(prev => {
        const newData = {
          ...prev,
          name: doctorName,
          email: user.email || prev.email,
          phone: user.phone || prev.phone,
          image: user.profilePicture || prev.image,
          specialty: user.profile?.primarySpecialty || user.primarySpecialty || "Doctor",
          experience: (() => {
            if (user.profile?.yearsOfExperience) return `${user.profile.yearsOfExperience}+ years`;
            if (user.yearsOfExperience) return `${user.yearsOfExperience}+ years`;
            if (user.age) {
              const estimatedYears = Math.max(0, user.age - 25);
              return estimatedYears > 0 ? `${estimatedYears}+ years` : "New Doctor";
            }
            return "Experienced";
          })(),
          about: user.profile?.bio || user.bio || "Professional healthcare provider committed to patient care.",
          address: (() => {
            const addr = user.address;
            if (typeof addr === 'object' && addr !== null) {
              return `${addr.street || ''}, ${addr.city || ''}, ${addr.state || ''} ${addr.zipCode || ''}`.trim().replace(/,$/, '');
            }
            return addr || "Address not provided";
          })(),
          // Extract profile arrays if available
          education: user.profile?.education || [],
          certifications: user.profile?.certificationsList || user.profile?.certifications || [],
          specializations: user.profile?.areasOfExpertise || user.profile?.specializations || [],
          workingHours: user.profile?.workingHours || {}
        };
        console.log('📊 Initial doctor data updated:', newData);
        return newData;
      });
      
      // Also initialize the profile form with user data
      setProfileForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        specialty: user.profile?.primarySpecialty || user.primarySpecialty || "",
        subSpecialty: user.profile?.subSpecialty || user.profile?.secondarySpecialty || "",
        bio: user.profile?.bio || user.bio || "",
        experience: user.profile?.yearsOfExperience || user.yearsOfExperience || "",
        location: user.profile?.hospitalName || user.profile?.clinicName || "",
        address: (() => {
          const addr = user.address;
          if (typeof addr === 'object' && addr !== null) {
            return `${addr.street || ''}, ${addr.city || ''}, ${addr.state || ''} ${addr.zipCode || ''}`.trim().replace(/,$/, '');
          }
          return addr || "";
        })(),
        languages: user.profile?.languages || ["English"],
        acceptingNew: user.profile?.isAcceptingNewPatients ?? true
      });
    } else {
      console.log('⏳ User not available yet - user:', !!user, 'isAuthenticated:', isAuthenticated);
    }
  }, [user, isAuthenticated]);

  // Fetch all doctor data from backend APIs
  useEffect(() => {
    const fetchAllData = async () => {
      if (!isAuthenticated || !user) return;
      
      try {
        setLoading(true);
        console.log('🚀 Fetching all doctor data dynamically from backend...');
        
        // Since user is already properly structured from AuthContext, we mainly use it
        // But we can still try to fetch additional doctor-specific data
        const additionalDoctorData = await doctorAPI.getProfile().catch(e => {
          console.log('📋 Doctor-specific API not available, using user data only:', e.message);
          return null;
        });
        
        console.log('📊 Additional doctor data from API:', additionalDoctorData);
        
        // Set the doctor state for any components that might need it
        setDoctor(additionalDoctorData || user);
        
        // Update with any additional data from doctor API, but prioritize user data
        if (additionalDoctorData) {
          setDoctorData(prev => {
            const updatedData = {
              ...prev,
              // Only update if we get better data from the doctor API
              rating: additionalDoctorData.averageRating || prev.rating,
              reviews: additionalDoctorData.totalReviews || prev.reviews,
              // Merge any additional professional info
              ...additionalDoctorData
            };
            console.log('🔄 Updated with additional doctor data:', updatedData);
            return updatedData;
          });
        }
        
        // Fetch reviews (appointments are now managed separately)
        await fetchReviews();
        
        console.log('✅ All data fetched successfully!');
        
      } catch (e) {
        console.error('❌ Error fetching doctor data:', e.message);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, [isAuthenticated, user]);
  
  // Fetch reviews
  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const data = await extendedAPI.getReviews();
      console.log('✅ Reviews loaded:', data.length, 'reviews');
      setReviews(data);
    } catch (e) {
      console.error('❌ Error fetching reviews:', e);
      setReviews([]); // Empty array as fallback
    } finally {
      setLoadingReviews(false);
    }
  };
  
  // Simple appointment management functions that actually work
  const loadAppointments = async () => {
    try {
      setAppointmentsLoading(true);
      console.log('🔄 Loading appointments from API...');
      
      const response = await appointmentsAPI.getDoctorAppointments();
      console.log('📋 API Response:', response);
      
      // Handle both array and object responses
      const allAppointments = Array.isArray(response) ? response : (response.appointments || []);
      console.log('📋 Appointments array:', allAppointments);
      
      if (!Array.isArray(allAppointments)) {
        console.error('❌ Invalid appointments data format:', allAppointments);
        setAppointments({ pending: [], upcoming: [], completed: [], cancelled: [] });
        return;
      }
      
      // Simple categorization
      const categorized = {
        pending: allAppointments.filter(apt => apt?.status === 'pending'),
        upcoming: allAppointments.filter(apt => apt?.status === 'confirmed'),
        completed: allAppointments.filter(apt => apt?.status === 'completed'),
        cancelled: allAppointments.filter(apt => apt?.status === 'cancelled' || apt?.status === 'rejected')
      };
      
      console.log('📊 Categorized appointments:', categorized);
      setAppointments(categorized);
      
    } catch (error) {
      console.error('❌ Error loading appointments:', error);
      toast.error('Failed to load appointments: ' + error.message, {
        icon: '❌',
        duration: 5000,
      });
      setAppointments({ pending: [], upcoming: [], completed: [], cancelled: [] });
    } finally {
      setAppointmentsLoading(false);
    }
  };

  const handleApproveAppointment = async (appointmentId) => {
    console.log('🔄 Starting approve for ID:', appointmentId);
    
    try {
      setActionLoading(prev => ({ ...prev, [appointmentId]: 'approving' }));
      
      const result = await appointmentsAPI.approveAppointment(appointmentId);
      console.log('✅ Approve result:', result);
      
      toast.success('✅ Appointment approved successfully!', {
        duration: 3000,
      });
      
      // Reload appointments
      await loadAppointments();
      
    } catch (error) {
      console.error('❌ Error approving appointment:', error);
      toast.error('❌ Failed to approve: ' + error.message, {
        duration: 5000,
      });
    } finally {
      setActionLoading(prev => {
        const newState = { ...prev };
        delete newState[appointmentId];
        return newState;
      });
    }
  };

  const handleRejectAppointment = async (appointmentId) => {
    console.log('🔄 Starting reject for ID:', appointmentId);
    setPrompt({ open: true, appointmentId });
  };

  const submitRejection = async (reason) => {
    const appointmentId = prompt.appointmentId;
    if (reason === undefined) {
      setPrompt({ open: false, appointmentId: null });
      return;
    }
    try {
      setActionLoading(prev => ({ ...prev, [appointmentId]: 'rejecting' }));
      
      const result = await appointmentsAPI.rejectAppointment(appointmentId, reason);
      console.log('✅ Reject result:', result);
      
      toast.success('✅ Appointment rejected successfully!', {
        duration: 3000,
      });
      
      // Reload appointments
      await loadAppointments();
      
    } catch (error) {
      console.error('❌ Error rejecting appointment:', error);
      toast.error('❌ Failed to reject: ' + error.message, {
        duration: 5000,
      });
    } finally {
      setActionLoading(prev => {
        const newState = { ...prev };
        delete newState[appointmentId];
        return newState;
      });
    }
  };

  // Load appointments when component mounts
  useEffect(() => {
    if (isAuthenticated && user) {
      loadAppointments();
    }
  }, [isAuthenticated, user]);

  // Save functions
  const saveAbout = async () => {
    try {
      // Always try to update profile if user is authenticated
      if (isAuthenticated) {
        await doctorAPI.updateProfile({ bio: aboutForm });
      }
      setDoctorData(prev => ({ ...prev, about: aboutForm }));
      setEditingSection(null);
    } catch (e) {
      console.error('Save about error:', e);
      toast.error(e.message || 'Failed to update about section');
    }
  };
  
  // Save complete profile
  const saveProfile = async () => {
    try {
      console.log('💾 Saving complete profile...', profileForm);
      
      // Update basic user info (including address)
      const userUpdate = {
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        email: profileForm.email,
        phone: profileForm.phone,
        bio: profileForm.bio // Add bio to user update too
      };
      
      // Parse and update address for user
      if (profileForm.address) {
        const addressParts = profileForm.address.split(',').map(part => part.trim());
        userUpdate.address = {
          street: addressParts[0] || '',
          city: addressParts[1] || '',
          state: addressParts[2] || '',
          zipCode: addressParts[3] || '',
          country: 'USA' // default
        };
      }
      
      console.log('👤 Updating user data:', userUpdate);
      await authAPI.updateProfile(userUpdate);
      
      // Update doctor-specific profile with all the fields your backend expects
      const doctorProfileUpdate = {
        primarySpecialty: profileForm.specialty,
        secondarySpecialty: profileForm.subSpecialty,
        bio: profileForm.bio,
        yearsOfExperience: parseInt(profileForm.experience) || 0,
        hospitalName: profileForm.location,
        clinicName: profileForm.location, // Also try clinicName
        isAcceptingNewPatients: profileForm.acceptingNew,
        languages: profileForm.languages,
        // Add current specializations from the form
        areasOfExpertise: doctorData.specializations || [],
        // Add current certifications
        certificationsList: doctorData.certifications || [],
        // Add working hours
        workingHours: doctorData.workingHours || {}
      };
      
      console.log('🏥 Updating doctor profile:', doctorProfileUpdate);
      
      // Try to get current profile first to see what fields exist
      try {
        const currentProfile = await doctorAPI.getProfile();
        console.log('🔍 Current profile from backend:', currentProfile);
        console.log('🔍 Available fields:', Object.keys(currentProfile || {}));
      } catch (e) {
        console.log('⚠️ Could not fetch current profile for debugging:', e.message);
      }
      
      const result = await doctorAPI.updateProfile(doctorProfileUpdate);
      console.log('💾 Profile update result:', result);
      
      // Update local state
      const doctorName = `Dr. ${profileForm.firstName} ${profileForm.lastName}`;
      setDoctorData(prev => ({
        ...prev,
        name: doctorName,
        email: profileForm.email,
        phone: profileForm.phone,
        specialty: profileForm.specialty,
        subSpecialty: profileForm.subSpecialty,
        about: profileForm.bio,
        experience: profileForm.experience ? `${profileForm.experience}+ years` : prev.experience,
        location: profileForm.location,
        address: profileForm.address,
        languages: profileForm.languages,
        acceptingNew: profileForm.acceptingNew
      }));
      
      // Refresh user data
      await refreshUser();
      
      setEditingSection(null);
      toast.success('Profile updated successfully!');
      console.log('✅ Profile saved successfully');
      
    } catch (e) {
      console.error('❌ Save profile error:', e);
      console.error('Error details:', e.response || e);
      toast.error(`Failed to update profile: ${e.message}`);
    }
  };
  
  // Add language function
  const addLanguage = () => {
    if (!newLanguage.trim()) return;
    if (profileForm.languages.includes(newLanguage.trim())) {
      toast.error('Language already added');
      return;
    }
    setProfileForm(prev => ({
      ...prev,
      languages: [...prev.languages, newLanguage.trim()]
    }));
    setNewLanguage("");
  };
  
  // Remove language function
  const removeLanguage = (languageToRemove) => {
    setProfileForm(prev => ({
      ...prev,
      languages: prev.languages.filter(lang => lang !== languageToRemove)
    }));
  };
  
  // Test backend connection and field mapping
  const testBackendConnection = async () => {
    try {
      console.log('🗺️ Testing backend connection...');
      
      // Test 1: Get current profile
      console.log('🔍 Test 1: Getting current profile...');
      const currentProfile = await doctorAPI.getProfile();
      console.log('✅ Current profile:', currentProfile);
      
      // Test 2: Try updating just bio
      console.log('🔍 Test 2: Updating just bio...');
      const bioTest = await doctorAPI.updateProfile({ bio: 'Test bio update from frontend' });
      console.log('✅ Bio update result:', bioTest);
      
      // Test 3: Try updating specialization
      console.log('🔍 Test 3: Updating areasOfExpertise...');
      const specTest = await doctorAPI.updateProfile({ areasOfExpertise: ['Test Specialty'] });
      console.log('✅ Specialization update result:', specTest);
      
      // Test 4: Try updating languages
      console.log('🔍 Test 4: Updating languages...');
      const langTest = await doctorAPI.updateProfile({ languages: ['English', 'Spanish'] });
      console.log('✅ Language update result:', langTest);
      
      toast.success('Backend connection test completed! Check console for details.');
      
    } catch (e) {
      console.error('❌ Backend connection test failed:', e);
      console.error('Error details:', e.response?.data || e.message);
      toast.error(`Backend test failed: ${e.message}`);
    }
  };

  const addEducation = async () => {
    if (!educationForm.degree || !educationForm.institution) {
      toast.error('Please fill in all education fields');
      return;
    }
    
    try {
      // First add via dedicated education API if available
      const savedEducation = await doctorAPI.addEducation(educationForm);
      
      // Update local state with the saved education (with ID from backend)
      const newEducation = [...doctorData.education, savedEducation || educationForm];
      setDoctorData(prev => ({ ...prev, education: newEducation }));
      setEducationForm({ degree: "", institution: "", year: "" });
      setEditingSection(null);
      
      console.log('✅ Education added and saved to database');
    } catch (e) {
      console.error('❌ Error saving education:', e);
      // Fallback: try updating the whole education array
      try {
        const newEducation = [...doctorData.education, educationForm];
        await doctorAPI.updateProfile({ education: newEducation });
        setDoctorData(prev => ({ ...prev, education: newEducation }));
        setEducationForm({ degree: "", institution: "", year: "" });
        setEditingSection(null);
        console.log('✅ Education added via profile update');
      } catch (fallbackError) {
        console.error('❌ Fallback education save also failed:', fallbackError);
        alert('Failed to save education: ' + fallbackError.message);
      }
    }
  };

  const addCertification = async () => {
    if (!certificationForm.trim()) return;
    
    try {
      const newCerts = [...doctorData.certifications, certificationForm.trim()];
      
      // Save to database
      await doctorAPI.updateProfile({
        certificationsList: newCerts
      });
      
      // Update local state
      setDoctorData(prev => ({ ...prev, certifications: newCerts }));
      setCertificationForm("");
      
      console.log('✅ Certification added and saved to database');
    } catch (e) {
      console.error('❌ Error saving certification:', e);
      alert('Failed to save certification: ' + e.message);
    }
  };

  const addSpecialization = async () => {
    if (!specializationForm.trim()) return;
    
    try {
      const newSpecs = [...doctorData.specializations, specializationForm.trim()];
      
      // Save to database
      await doctorAPI.updateProfile({
        areasOfExpertise: newSpecs
      });
      
      // Update local state
      setDoctorData(prev => ({ ...prev, specializations: newSpecs }));
      setSpecializationForm("");
      
      console.log('✅ Specialization added and saved to database');
    } catch (e) {
      console.error('❌ Error saving specialization:', e);
      alert('Failed to save specialization: ' + e.message);
    }
  };

  const saveWorkingHours = async () => {
    try {
      // Always try to update profile if user is authenticated
      if (isAuthenticated) {
        await doctorAPI.updateProfile({ workingHours: workingHoursForm });
      }
      setDoctorData(prev => ({ ...prev, workingHours: workingHoursForm }));
      setEditingSection(null);
    } catch (e) {
      console.error('Save working hours error:', e);
      alert(e.message || "Failed to update working hours");
    }
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
  
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-lg font-medium">Loading your profile...</p>
        <p className="text-muted-foreground">Fetching data from backend</p>
      </div>
    </div>
  );
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
                                toast.error('Failed to upload profile picture. Please try again.');
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
                      <Button 
                        variant="medical" 
                        size="lg" 
                        className="w-full"
                        onClick={() => {
                          // Populate form with current data when edit is clicked
                          setProfileForm({
                            firstName: user?.firstName || "",
                            lastName: user?.lastName || "",
                            email: user?.email || "",
                            phone: user?.phone || "",
                            specialty: doctorData.specialty || "",
                            subSpecialty: doctorData.subSpecialty || "",
                            bio: doctorData.about || "",
                            experience: doctorData.experience.replace(/\+?\s*years?/i, '') || "",
                            location: doctorData.location || "",
                            address: doctorData.address || "",
                            languages: doctorData.languages || ["English"],
                            acceptingNew: doctorData.acceptingNew
                          });
                          setEditingSection('profile');
                        }}
                      >
                        <EditIcon className="h-4 w-4 mr-2" />
                        Edit Profile
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
                        
                        {editingSection === 'profile' && (
                          <div className="mt-6 p-4 border rounded-lg bg-accent/20 space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">First Name</label>
                                <Input value={profileForm.firstName} onChange={(e) => setProfileForm(prev => ({ ...prev, firstName: e.target.value }))} />
                              </div>
                              <div>
                                <label className="text-sm font-medium">Last Name</label>
                                <Input value={profileForm.lastName} onChange={(e) => setProfileForm(prev => ({ ...prev, lastName: e.target.value }))} />
                              </div>
                              <div>
                                <label className="text-sm font-medium">Email</label>
                                <Input type="email" value={profileForm.email} onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))} />
                              </div>
                              <div>
                                <label className="text-sm font-medium">Phone</label>
                                <Input value={profileForm.phone} onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))} />
                              </div>
                              <div>
                                <label className="text-sm font-medium">Primary Specialty</label>
                                <Input value={profileForm.specialty} onChange={(e) => setProfileForm(prev => ({ ...prev, specialty: e.target.value }))} />
                              </div>
                              <div>
                                <label className="text-sm font-medium">Sub-specialty</label>
                                <Input value={profileForm.subSpecialty} onChange={(e) => setProfileForm(prev => ({ ...prev, subSpecialty: e.target.value }))} />
                              </div>
                              <div>
                                <label className="text-sm font-medium">Years of Experience</label>
                                <Input type="number" min="0" value={profileForm.experience} onChange={(e) => setProfileForm(prev => ({ ...prev, experience: e.target.value }))} />
                              </div>
                              <div>
                                <label className="text-sm font-medium">Location (Clinic/Hospital)</label>
                                <Input value={profileForm.location} onChange={(e) => setProfileForm(prev => ({ ...prev, location: e.target.value }))} />
                              </div>
                              <div className="md:col-span-2">
                                <label className="text-sm font-medium">Address</label>
                                <Input value={profileForm.address} onChange={(e) => setProfileForm(prev => ({ ...prev, address: e.target.value }))} placeholder="104 Main St, Phoenix, AZ 90004" />
                              </div>
                              <div className="md:col-span-2">
                                <label className="text-sm font-medium">Bio</label>
                                <Textarea rows={4} value={profileForm.bio} onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))} />
                              </div>
                              <div className="md:col-span-2">
                                <label className="text-sm font-medium">Languages</label>
                                <div className="flex gap-2 mb-2">
                                  <Input value={newLanguage} onChange={(e) => setNewLanguage(e.target.value)} placeholder="Add a language" />
                                  <Button variant="outline" onClick={addLanguage}>Add</Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {profileForm.languages.map(lang => (
                                    <Badge key={lang} variant="secondary" className="cursor-pointer" onClick={() => removeLanguage(lang)}>
                                      {lang} ×
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div className="md:col-span-2 flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setEditingSection(null)}>Cancel</Button>
                                <Button onClick={saveProfile}><Save className="h-4 w-4 mr-2" />Save Changes</Button>
                              </div>
                            </div>
                          </div>
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
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Patient Reviews
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingReviews ? (
                    <div className="py-8 text-center text-muted-foreground">Loading reviews...</div>
                  ) : reviews.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">No reviews yet</div>
                  ) : (
                    <div className="space-y-3">
                      {reviews.map((r, idx) => (
                        <div key={idx} className="p-4 border rounded-md">
                          <div className="flex items-center justify-between mb-1">
                            <div className="text-sm font-medium">{r.patientName || 'Patient'}</div>
                            <div className="flex items-center gap-1 text-yellow-500">
                              <Star className="h-4 w-4" />
                              <span className="text-sm">{r.rating}.0</span>
                            </div>
                          </div>
                          {r.comment && <div className="text-sm text-muted-foreground">{r.comment}</div>}
                          <div className="text-xs text-muted-foreground mt-1">{new Date(r.date).toLocaleDateString()}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appointments" className="space-y-6">
              <Card className="shadow-soft border-0">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      My Appointments
                    </span>
                    <Button onClick={loadAppointments} disabled={appointmentsLoading} size="sm">
                      {appointmentsLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                      ) : (
                        <Clock className="h-4 w-4 mr-2" />
                      )}
                      Refresh
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {appointmentsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                      <span className="ml-2">Loading appointments...</span>
                    </div>
                  ) : (
                    <Tabs defaultValue="pending" className="space-y-4">
                      <div className="flex items-center justify-center mb-6">
                        <TabsList className="grid grid-cols-4 w-auto">
                          <TabsTrigger value="pending" className="text-xs px-3">
                            Pending ({appointments.pending.length})
                          </TabsTrigger>
                          <TabsTrigger value="upcoming" className="text-xs px-3">
                            Upcoming ({appointments.upcoming.length})
                          </TabsTrigger>
                          <TabsTrigger value="completed" className="text-xs px-3">
                            Completed ({appointments.completed.length})
                          </TabsTrigger>
                          <TabsTrigger value="cancelled" className="text-xs px-3">
                            Cancelled ({appointments.cancelled.length})
                          </TabsTrigger>
                        </TabsList>
                      </div>

                      {/* Pending Appointments Tab */}
                      <TabsContent value="pending" className="space-y-4">
                        {appointments.pending.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <Clock className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            <p>No pending appointment requests</p>
                            <p className="text-sm">Patient requests will appear here for your approval</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <h3 className="font-medium text-sm text-muted-foreground">PENDING APPROVAL ({appointments.pending.length})</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {appointments.pending.map((appointment) => (
                                <AppointmentCard 
                                  key={appointment._id} 
                                  appointment={appointment}
                                  onApprove={() => handleApproveAppointment(appointment._id)}
                                  onReject={() => handleRejectAppointment(appointment._id)}
                                  isLoading={actionLoading[appointment._id]}
                                  showActions={true}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </TabsContent>

                      {/* Upcoming Appointments Tab */}
                      <TabsContent value="upcoming" className="space-y-4">
                        {appointments.upcoming.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            <p>No upcoming appointments</p>
                            <p className="text-sm">Confirmed appointments will appear here</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <h3 className="font-medium text-sm text-muted-foreground">UPCOMING APPOINTMENTS ({appointments.upcoming.length})</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {appointments.upcoming.map((appointment) => (
                                <AppointmentCard key={appointment._id} appointment={appointment} />
                              ))}
                            </div>
                          </div>
                        )}
                      </TabsContent>

                      {/* Completed Appointments Tab */}
                      <TabsContent value="completed" className="space-y-4">
                        {appointments.completed.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <CheckCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            <p>No completed appointments</p>
                            <p className="text-sm">Completed appointments will appear here</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <h3 className="font-medium text-sm text-muted-foreground">COMPLETED ({appointments.completed.length})</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {appointments.completed.map((appointment) => (
                                <AppointmentCard key={appointment._id} appointment={appointment} />
                              ))}
                            </div>
                          </div>
                        )}
                      </TabsContent>

                      {/* Cancelled/Rejected Appointments Tab */}
                      <TabsContent value="cancelled" className="space-y-4">
                        {appointments.cancelled.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <XCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            <p>No cancelled appointments</p>
                            <p className="text-sm">Cancelled or rejected appointments will appear here</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <h3 className="font-medium text-sm text-muted-foreground">CANCELLED/REJECTED ({appointments.cancelled.length})</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {appointments.cancelled.map((appointment) => (
                                <AppointmentCard key={appointment._id} appointment={appointment} />
                              ))}
                            </div>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="slots" className="space-y-6">
              <Card className="shadow-soft border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Manage Your Available Slots
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">📅 Slot Management</h4>
                    <p className="text-blue-800 text-sm">
                      Create time slots when you're available for appointments. Patients can book these slots, and you can approve or reject their requests.
                    </p>
                  </div>
                  <SlotManager doctorId={user?.id || user?._id} />
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        </div>
      </section>

      <PromptDialog
        open={prompt.open}
        title="Reject appointment"
        label="Reason (optional)"
        placeholder="Add a reason for rejection"
        onSubmit={(val) => submitRejection(val)}
        onClose={() => setPrompt({ open: false, appointmentId: null })}
      />
      
    </div>
  );
};

export default DoctorSelfProfilePage;
