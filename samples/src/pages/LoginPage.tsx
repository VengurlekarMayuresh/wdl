import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useSearchParams } from "react-router-dom";
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
  ArrowLeft
} from "lucide-react";
import logoImg from "@/assets/logo.png";

const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get("signup") === "true");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "",
    phone: "",
    dateOfBirth: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setIsSignUp(searchParams.get("signup") === "true");
  }, [searchParams]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (isSignUp) {
      if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
      if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
      if (!formData.userType) newErrors.userType = "Please select user type";
      if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
      if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Form submitted:", formData);
      // Handle authentication here
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
      dateOfBirth: ""
    });
    setErrors({});
  };

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
                            <SelectItem value="patient">Patient</SelectItem>
                            <SelectItem value="doctor">Healthcare Provider</SelectItem>
                            <SelectItem value="admin">Administrator</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.userType && (
                          <p className="text-sm text-destructive">{errors.userType}</p>
                        )}
                      </div>

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
                    </>
                  )}

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
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password}</p>
                    )}
                  </div>

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
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-foreground"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                      )}
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    variant="medical" 
                    size="lg" 
                    className="w-full mt-6"
                  >
                    {isSignUp ? (
                      <>
                        <UserPlus className="h-4 w-4" />
                        Create Account
                      </>
                    ) : (
                      <>
                        <LogIn className="h-4 w-4" />
                        Sign In
                      </>
                    )}
                  </Button>

                  <div className="text-center mt-6">
                    <span className="text-muted-foreground">
                      {isSignUp ? "Already have an account?" : "Don't have an account?"}
                    </span>
                    <Button
                      type="button"
                      variant="link"
                      onClick={toggleMode}
                      className="ml-2 p-0"
                    >
                      {isSignUp ? "Sign In" : "Sign Up"}
                    </Button>
                  </div>

                  {!isSignUp && (
                    <div className="text-center">
                      <Button variant="link" className="text-sm">
                        Forgot your password?
                      </Button>
                    </div>
                  )}

                </form>
              </div>
            </div>

            {/* Info Section */}
            <div className="bg-gradient-primary text-white p-8 lg:p-12 flex flex-col justify-center">
              <div className="max-w-sm mx-auto text-center">
                <h2 className="text-3xl font-bold mb-6">
                  {isSignUp ? "Join Our Community" : "Welcome to MASSS"}
                </h2>
                <p className="text-white/90 mb-8">
                  {isSignUp 
                    ? "Start your journey towards better health management with our comprehensive platform."
                    : "Access your personalized health dashboard and connect with top medical professionals."
                  }
                </p>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <Stethoscope className="h-6 w-6" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">Expert Care</div>
                      <div className="text-sm text-white/80">Connect with certified professionals</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <Shield className="h-6 w-6" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">Secure Platform</div>
                      <div className="text-sm text-white/80">Your health data is protected</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <Heart className="h-6 w-6" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">Personalized Care</div>
                      <div className="text-sm text-white/80">Tailored health recommendations</div>
                    </div>
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