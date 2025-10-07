import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  UserPlus, 
  LogIn, 
  Heart, 
  Shield, 
  Stethoscope,
  ArrowLeft,
  Loader2
} from "lucide-react";
import { authAPI, doctorAPI } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import logoImg from "@/assets/logo.png";

const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isSignUp, setIsSignUp] = useState(searchParams.get("signup") === "true");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "",
    phone: "",
    dateOfBirth: "",
    // Doctor specific fields
    medicalLicenseNumber: "",
    licenseState: "",
    primarySpecialty: "",
    // CareProvider specific fields
    providerType: ""
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    setIsSignUp(searchParams.get("signup") === "true");
  }, [searchParams]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (isSignUp) {
      if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
      if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
      if (!formData.userType) newErrors.userType = "Please select user type";
      if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
      if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
      
      // Doctor specific validations
      if (formData.userType === 'doctor') {
        if (!formData.medicalLicenseNumber.trim()) {
          newErrors.medicalLicenseNumber = "Medical license number is required";
        }
        if (!formData.licenseState) {
          newErrors.licenseState = "License state is required";
        }
        if (!formData.primarySpecialty) {
          newErrors.primarySpecialty = "Primary specialty is required";
        }
      }
      
      // Care Provider removed

      // Facility validations
      if (formData.userType === 'facility') {
        if (!formData.facilityName?.trim()) newErrors.facilityName = 'Facility name is required';
        if (!formData.facilityType) newErrors.facilityType = 'Facility type is required';
        if (!formData.facilityStreet?.trim()) {
          newErrors.facilityAddress = (newErrors.facilityAddress ? newErrors.facilityAddress + '; ' : '') + 'Street is required';
        }
        if (!formData.facilityCity?.trim() || !formData.facilityState?.trim() || !String(formData.facilityPincode || '').trim()) {
          newErrors.facilityAddress = (newErrors.facilityAddress ? newErrors.facilityAddress + '; ' : '') + 'City, State and Pincode are required';
        }
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      
      if (isSignUp) {
        // Register new user
        await authAPI.register({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          userType: formData.userType,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth,
          // Doctor specific fields
          ...(formData.userType === 'doctor'
            ? {
                medicalLicenseNumber: formData.medicalLicenseNumber,
                licenseState: formData.licenseState,
                primarySpecialty: formData.primarySpecialty,
              }
            : {}),
          // Facility provider fields
          ...(formData.userType === 'facility'
            ? {
                facilityName: formData.facilityName,
                facilityType: formData.facilityType,
                facilityAddress: {
                  street: formData.facilityStreet,
                  area: formData.facilityArea,
                  city: formData.facilityCity,
                  state: formData.facilityState,
                  pincode: formData.facilityPincode,
                },
              }
            : {}),
        });
        
        toast({
          title: "Registration successful!",
          description: "Your account has been created successfully.",
          variant: "default",
        });
        
        // Redirect based on user type
        if (formData.userType === 'doctor') {
          navigate('/doctor-dashboard');
        } else if (formData.userType === 'patient') {
          navigate('/profile');
        } else if (formData.userType === 'facility') {
          navigate('/facility-profile');
        } else {
          navigate('/');
        }
      } else {
        // User login using AuthContext
        await login(formData.email, formData.password);
        // Determine user type from stored user (works for facility too)
        const storedUserStr = localStorage.getItem('user');
        const currentUser = storedUserStr ? JSON.parse(storedUserStr) : null;

        toast({
          title: "Login successful!",
          description: "Welcome back to MASSS.",
          variant: "default",
        });
        
        // Redirect based on user type
        if (currentUser?.userType === 'doctor') {
          navigate('/doctor-dashboard');
        } else if (currentUser?.userType === 'patient') {
          navigate('/profile');
        } else if (currentUser?.userType === 'careprovider') {
          navigate('/careprovider-profile');
        } else if (currentUser?.userType === 'facility') {
          navigate('/facility-profile');
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      toast({
        title: isSignUp ? "Registration failed" : "Login failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
      console.error(isSignUp ? "Registration error:" : "Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      userType: "",
      phone: "",
      dateOfBirth: "",
      medicalLicenseNumber: "",
      licenseState: "",
      primarySpecialty: "",
      providerType: "",
      facilityName: "",
      facilityType: "",
      facilityStreet: "",
      facilityArea: "",
      facilityCity: "",
      facilityState: "",
      facilityPincode: ""
    });
    setErrors({});
  };

  const [specialtyOptions, setSpecialtyOptions] = useState([]);
  const [stateOptions, setStateOptions] = useState([]);

  useEffect(() => {
    const loadDoctorMeta = async () => {
      try {
        // Only fetch when doctor is selected and we are in signup mode
        if (isSignUp && formData.userType === 'doctor') {
          const meta = await doctorAPI.getMeta();
          setSpecialtyOptions(meta?.specialties || [
            'Cardiology','Dermatology','Emergency Medicine','Endocrinology','Family Medicine','Gastroenterology','General Surgery','Gynecology','Hematology','Infectious Disease','Internal Medicine','Neurology','Neurosurgery','Obstetrics','Oncology','Ophthalmology','Orthopedics','Otolaryngology','Pediatrics','Psychiatry','Pulmonology','Radiology','Rheumatology','Urology','Other'
          ]);
          setStateOptions(meta?.states || ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']);
        }
      } catch (e) {
        console.warn('Failed to load doctor metadata, falling back to defaults');
        setSpecialtyOptions([
          'Cardiology','Dermatology','Emergency Medicine','Endocrinology','Family Medicine','Gastroenterology','General Surgery','Gynecology','Hematology','Infectious Disease','Internal Medicine','Neurology','Neurosurgery','Obstetrics','Oncology','Ophthalmology','Orthopedics','Otolaryngology','Pediatrics','Psychiatry','Pulmonology','Radiology','Rheumatology','Urology','Other'
        ]);
        setStateOptions(['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']);
      }
    };
    loadDoctorMeta();
  // re-run when toggling signup or changing user type
  }, [isSignUp, formData.userType]);

  const providerTypeOptions = [
    'Nurse Practitioner', 'Physician Assistant', 'Registered Nurse', 
    'Physical Therapist', 'Occupational Therapist', 'Social Worker',
    'Mental Health Counselor', 'Dietitian', 'Other'
  ];

  return (
    <div className="min-h-screen bg-gradient-light flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        
        {/* Back to Home */}
        <div className="mb-6">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <Card className="shadow-strong border-0 overflow-hidden">
          <div className="grid lg:grid-cols-2 min-h-[600px]">
            
            {/* Form Section */}
            <div className="p-8 lg:p-12">
              <div className="max-w-sm mx-auto">
                
                {/* Logo */}
                <div className="text-center mb-8">
                  <img src={logoImg} alt="MASSS" className="h-16 mx-auto mb-4" />
                  <h1 className="text-2xl font-bold text-primary-dark">
                    {isSignUp ? "Join MASSS" : "Welcome Back"}
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    {isSignUp 
                      ? "Create your account to get started" 
                      : "Sign in to your account"
                    }
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  {isSignUp && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="text"
                              placeholder="First Name"
                              value={formData.firstName}
                              onChange={(e) => handleInputChange("firstName", e.target.value)}
                              className={`pl-10 ${errors.firstName ? "border-destructive" : ""}`}
                            />
                          </div>
                          {errors.firstName && (
                            <p className="text-sm text-destructive">{errors.firstName}</p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="text"
                              placeholder="Last Name"
                              value={formData.lastName}
                              onChange={(e) => handleInputChange("lastName", e.target.value)}
                              className={`pl-10 ${errors.lastName ? "border-destructive" : ""}`}
                            />
                          </div>
                          {errors.lastName && (
                            <p className="text-sm text-destructive">{errors.lastName}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Select
                          value={formData.userType}
                          onValueChange={(value) => handleInputChange("userType", value)}
                        >
                          <SelectTrigger className={errors.userType ? "border-destructive" : ""}>
                            <SelectValue placeholder="I am a..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="patient">
                              <div className="flex items-center gap-2">
                                <Heart className="h-4 w-4" />
                                Patient
                              </div>
                            </SelectItem>
                            <SelectItem value="doctor">
                              <div className="flex items-center gap-2">
                                <Stethoscope className="h-4 w-4" />
                                Doctor
                              </div>
                            </SelectItem>
                            <SelectItem value="facility">
                              <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                Facility
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.userType && (
                          <p className="text-sm text-destructive">{errors.userType}</p>
                        )}
                      </div>

                      {/* Facility signup fields */}
                      {formData.userType === 'facility' && (
                        <>
                          <div className="space-y-2">
                            <Input
                              type="text"
                              placeholder="Facility Name"
                              value={formData.facilityName || ''}
                              onChange={(e) => handleInputChange("facilityName", e.target.value)}
                              className={errors.facilityName ? "border-destructive" : ""}
                            />
                            {errors.facilityName && (<p className="text-sm text-destructive">{errors.facilityName}</p>)}
                          </div>
                          <div className="space-y-2">
                            <Select value={formData.facilityType || ''} onValueChange={(v)=>handleInputChange('facilityType', v)}>
                              <SelectTrigger className={errors.facilityType ? "border-destructive" : ""}>
                                <SelectValue placeholder="Facility Type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="hospital">Hospital</SelectItem>
                                <SelectItem value="clinic">Clinic</SelectItem>
                                <SelectItem value="primary_care">Primary Care</SelectItem>
                                <SelectItem value="pharmacy">Pharmacy</SelectItem>
                              </SelectContent>
                            </Select>
                            {errors.facilityType && (<p className="text-sm text-destructive">{errors.facilityType}</p>)}
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Input type="text" placeholder="Street" value={formData.facilityStreet || ''} onChange={(e)=>handleInputChange('facilityStreet', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                              <Input type="text" placeholder="Area" value={formData.facilityArea || ''} onChange={(e)=>handleInputChange('facilityArea', e.target.value)} />
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <Input type="text" placeholder="City" value={formData.facilityCity || ''} onChange={(e)=>handleInputChange('facilityCity', e.target.value)} />
                            <Input type="text" placeholder="State" value={formData.facilityState || ''} onChange={(e)=>handleInputChange('facilityState', e.target.value)} />
                            <Input type="text" placeholder="Pincode" value={formData.facilityPincode || ''} onChange={(e)=>handleInputChange('facilityPincode', e.target.value)} />
                          </div>
                          {errors.facilityAddress && (<p className="text-sm text-destructive">{errors.facilityAddress}</p>)}
                        </>
                      )}

                      <div className="space-y-2">
                        <Input
                          type="tel"
                          placeholder="Phone Number"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          className={errors.phone ? "border-destructive" : ""}
                        />
                        {errors.phone && (
                          <p className="text-sm text-destructive">{errors.phone}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Input
                          type="date"
                          placeholder="Date of Birth"
                          value={formData.dateOfBirth}
                          onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                          className={errors.dateOfBirth ? "border-destructive" : ""}
                        />
                        {errors.dateOfBirth && (
                          <p className="text-sm text-destructive">{errors.dateOfBirth}</p>
                        )}
                      </div>

                      {/* Doctor-specific fields */}
                      {formData.userType === 'doctor' && (
                        <>
                          <div className="space-y-2">
                            <Input
                              type="text"
                              placeholder="Medical License Number"
                              value={formData.medicalLicenseNumber}
                              onChange={(e) => handleInputChange("medicalLicenseNumber", e.target.value)}
                              className={errors.medicalLicenseNumber ? "border-destructive" : ""}
                            />
                            {errors.medicalLicenseNumber && (
                              <p className="text-sm text-destructive">{errors.medicalLicenseNumber}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Select
                              value={formData.licenseState}
                              onValueChange={(value) => handleInputChange("licenseState", value)}
                            >
                              <SelectTrigger className={errors.licenseState ? "border-destructive" : ""}>
                                <SelectValue placeholder="License State" />
                              </SelectTrigger>
                              <SelectContent>
                                {stateOptions.map((state) => (
                                  <SelectItem key={state} value={state}>
                                    {state}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.licenseState && (
                              <p className="text-sm text-destructive">{errors.licenseState}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Select
                              value={formData.primarySpecialty}
                              onValueChange={(value) => handleInputChange("primarySpecialty", value)}
                            >
                              <SelectTrigger className={errors.primarySpecialty ? "border-destructive" : ""}>
                                <SelectValue placeholder="Primary Specialty" />
                              </SelectTrigger>
                              <SelectContent>
                                {specialtyOptions.map((specialty) => (
                                  <SelectItem key={specialty} value={specialty}>
                                    {specialty}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.primarySpecialty && (
                              <p className="text-sm text-destructive">{errors.primarySpecialty}</p>
                            )}
                          </div>
                        </>
                      )}

                      {/* Care Provider-specific fields */}
                      {formData.userType === 'careprovider' && (
                        <div className="space-y-2">
                          <Select
                            value={formData.providerType}
                            onValueChange={(value) => handleInputChange("providerType", value)}
                          >
                            <SelectTrigger className={errors.providerType ? "border-destructive" : ""}>
                              <SelectValue placeholder="Provider Type" />
                            </SelectTrigger>
                            <SelectContent>
                              {providerTypeOptions.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.providerType && (
                            <p className="text-sm text-destructive">{errors.providerType}</p>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {/* Email */}
                  <div className="space-y-2">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        className={`pl-10 pr-10 ${errors.password ? "border-destructive" : ""}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password - Sign Up Only */}
                  {isSignUp && (
                    <div className="space-y-2">
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm Password"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                          className={`pl-10 pr-10 ${errors.confirmPassword ? "border-destructive" : ""}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                      )}
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isSignUp ? "Creating Account..." : "Signing In..."}
                      </>
                    ) : (
                      <>
                        {isSignUp ? (
                          <>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Create Account
                          </>
                        ) : (
                          <>
                            <LogIn className="mr-2 h-4 w-4" />
                            Sign In
                          </>
                        )}
                      </>
                    )}
                  </Button>

                  {/* Toggle Mode */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={toggleMode}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {isSignUp ? (
                        <>Already have an account? <span className="font-medium">Sign in</span></>
                      ) : (
                        <>Don't have an account? <span className="font-medium">Sign up</span></>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Image/Info Section */}
            <div className="bg-gradient-primary text-white p-8 lg:p-12 flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="mb-6">
                  <Heart className="h-20 w-20 mx-auto mb-4 opacity-20" />
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold mb-4">
                  Your Health Journey Starts Here
                </h2>
                <p className="text-white/90 mb-6">
                  Join thousands of patients and healthcare providers who trust MASSS for their medical needs.
                </p>
                <div className="space-y-4 text-sm text-white/80">
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 flex-shrink-0" />
                    <span>Secure and private health records</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Stethoscope className="h-4 w-4 flex-shrink-0" />
                    <span>Connect with verified healthcare providers</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Heart className="h-4 w-4 flex-shrink-0" />
                    <span>24/7 health support and resources</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;