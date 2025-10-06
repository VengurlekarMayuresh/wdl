import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Calendar, 
  MapPin, 
  Heart, 
  Stethoscope, 
  Users, 
  Shield, 
  Star,
  ArrowRight,
  Phone,
  Mail,
  Clock
} from "lucide-react";

const HomePage = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const userType = user?.userType;
  
  const features = [
    {
      icon: Calendar,
      title: "Easy Appointments",
      description: "Book appointments with top doctors in just a few clicks"
    },
    {
      icon: MapPin,
      title: "Find Nearby Care",
      description: "Locate healthcare providers and hospitals near your location"
    },
    {
      icon: Heart,
      title: "Health Tips",
      description: "Access expert advice and healthy living recommendations"
    },
    {
      icon: Stethoscope,
      title: "Expert Doctors",
      description: "Connect with certified medical professionals across specialties"
    },
    {
      icon: Users,
      title: "Patient Portal",
      description: "Manage your health records and track your medical journey"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your health information is protected with industry-leading security"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Patient",
      content: "MASSS made it so easy to find a specialist and book an appointment. The platform is intuitive and saved me hours of searching.",
      rating: 5
    },
    {
      name: "Dr. Michael Chen",
      role: "Cardiologist",
      content: "As a healthcare provider, I appreciate how MASSS streamlines patient management and appointment scheduling.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Patient",
      content: "The health tips section has been incredibly valuable. I love having access to reliable medical information in one place.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-light">
<Header 
        isAuthenticated={isAuthenticated}
        userInitial={(user?.firstName?.[0]?.toUpperCase?.() || 'U')}
        userType={user?.userType || 'patient'}
        onLogout={logout}
      />
      
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-90"></div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center text-white">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 animate-fadeInUp">
            Your Health,{" "}
            <span className="bg-gradient-to-r from-white to-primary-glow bg-clip-text text-transparent">
              Our Priority
            </span>
          </h1>
          <p className="text-xl lg:text-2xl mb-8 max-w-3xl mx-auto opacity-90 animate-fadeInUp">
            Connect with top medical professionals, book appointments instantly, and take control of your healthcare journey with MASSS.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeInUp">
            <Link to="/find-care">
              <Button variant="hero" size="hero" className="min-w-48">
                <MapPin className="h-5 w-5" />
                Find Care Now
              </Button>
            </Link>
            <Link to="/login?signup=true">
              <Button variant="nav" size="hero" className="min-w-48">
                <Users className="h-5 w-5" />
                Join MASSS
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 animate-pulse opacity-20">
          <Heart className="h-16 w-16 text-white" />
        </div>
        <div className="absolute top-40 right-20 animate-pulse opacity-20 animate-fadeInUp">
          <Stethoscope className="h-20 w-20 text-white" />
        </div>
        <div className="absolute bottom-20 left-20 animate-pulse opacity-20">
          <Shield className="h-12 w-12 text-white" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Why Choose MASSS?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We're revolutionizing healthcare access with cutting-edge technology and personalized care.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const handleClick = () => {
                switch (feature.title) {
                  case 'Easy Appointments':
                    if (userType === 'doctor') navigate('/doctor-profile');
                    else navigate('/doctors');
                    break;
                  case 'Find Nearby Care':
                    navigate('/find-care');
                    break;
                  case 'Health Tips':
                    navigate('/healthy-living');
                    break;
                  case 'Expert Doctors':
                    if (userType === 'doctor') navigate('/doctor-profile');
                    else navigate('/doctors');
                    break;
                  case 'Patient Portal':
                    if (userType === 'patient') navigate('/patient-profile');
                    else navigate('/doctor-patients');
                    break;
                  case 'Secure & Private':
                    navigate('/security-privacy');
                    break;
                  default:
                    break;
                }
              };
              return (
                <Card key={index} onClick={handleClick} className="border-none shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-2 group cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">5,000+</div>
              <div className="text-white/80">Verified Doctors</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50,000+</div>
              <div className="text-white/80">Happy Patients</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">100+</div>
              <div className="text-white/80">Medical Specialties</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-white/80">Healthcare Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              What Our Users Say
            </h2>
            <p className="text-muted-foreground text-lg">
              Join thousands of satisfied patients and healthcare providers
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-none shadow-soft hover:shadow-medium transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  <div className="border-t pt-4">
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Ready to Take Control of Your Health?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Join MASSS today and experience healthcare like never before.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login?signup=true">
              <Button variant="hero" size="hero" className="min-w-48 bg-white text-primary hover:bg-white/90">
                <Users className="h-5 w-5" />
                Get Started Free
              </Button>
            </Link>
            <Link to="/find-care">
              <Button variant="nav" size="hero" className="min-w-48">
                <ArrowRight className="h-5 w-5" />
                Explore Features
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">MASSS</h3>
              <p className="text-muted-foreground text-sm">
                Revolutionizing healthcare access with cutting-edge technology and personalized care.
              </p>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">support@masss.com</span>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-foreground">For Patients</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/find-care" className="hover:text-foreground transition-colors">Find Care</Link></li>
                <li><Link to="/login?signup=true" className="hover:text-foreground transition-colors">Book Appointment</Link></li>
                <li><Link to="/healthy-living" className="hover:text-foreground transition-colors">Health Tips</Link></li>
                <li><Link to="/login" className="hover:text-foreground transition-colors">Patient Portal</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-foreground">For Providers</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/login?signup=true" className="hover:text-foreground transition-colors">Join Network</Link></li>
                <li><Link to="/doctor-dashboard" className="hover:text-foreground transition-colors">Provider Portal</Link></li>
                <li><Link to="#" className="hover:text-foreground transition-colors">Resources</Link></li>
                <li><Link to="#" className="hover:text-foreground transition-colors">Support</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="#" className="hover:text-foreground transition-colors">About Us</Link></li>
                <li><Link to="#" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link to="#" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
                <li><Link to="#" className="hover:text-foreground transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-12 pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Â© 2024 MASSS. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;