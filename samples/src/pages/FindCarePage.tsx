import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  MapPin, 
  Star, 
  Clock, 
  Phone, 
  Calendar,
  Heart,
  Brain,
  Baby,
  Eye,
  Bone,
  Stethoscope,
  User,
  Filter,
  Grid,
  List
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const FindCarePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const specialties = [
    { icon: Heart, name: "Cardiology", count: 45, color: "bg-red-500" },
    { icon: Brain, name: "Neurology", count: 32, color: "bg-purple-500" },
    { icon: Baby, name: "Pediatrics", count: 28, color: "bg-pink-500" },
    { icon: Eye, name: "Ophthalmology", count: 22, color: "bg-blue-500" },
    { icon: Bone, name: "Orthopedics", count: 38, color: "bg-orange-500" },
    { icon: Stethoscope, name: "General Medicine", count: 156, color: "bg-primary" },
    { icon: User, name: "Dermatology", count: 19, color: "bg-green-500" },
    { icon: Heart, name: "Gynecology", count: 24, color: "bg-pink-600" }
  ];

  const doctors = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      specialty: "Cardiologist",
      rating: 4.9,
      reviews: 128,
      experience: "15+ years",
      location: "Downtown Medical Center",
      distance: "2.3 km",
      image: "/api/placeholder/150/150",
      nextAvailable: "Today 3:00 PM",
      languages: ["English", "Spanish"],
      acceptingNew: true
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      specialty: "Neurologist", 
      rating: 4.8,
      reviews: 95,
      experience: "12+ years",
      location: "City Hospital",
      distance: "3.1 km",
      image: "/api/placeholder/150/150",
      nextAvailable: "Tomorrow 10:00 AM",
      languages: ["English", "Mandarin"],
      acceptingNew: true
    },
    {
      id: 3,
      name: "Dr. Emily Rodriguez",
      specialty: "Pediatrician",
      rating: 4.9,
      reviews: 156,
      experience: "10+ years",
      location: "Children's Health Center",
      distance: "1.8 km",
      image: "/api/placeholder/150/150",
      nextAvailable: "Today 4:30 PM",
      languages: ["English", "Spanish", "French"],
      acceptingNew: false
    },
    {
      id: 4,
      name: "Dr. David Park",
      specialty: "Orthopedic Surgeon",
      rating: 4.7,
      reviews: 87,
      experience: "18+ years",
      location: "Sports Medicine Clinic",
      distance: "4.2 km",
      image: "/api/placeholder/150/150",
      nextAvailable: "Monday 9:00 AM",
      languages: ["English", "Korean"],
      acceptingNew: true
    }
  ];

  const filteredDoctors = doctors.filter(doctor => 
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-light">
      <Header />
      
      {/* Hero Search Section */}
      <section className="bg-gradient-primary text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 animate-fadeInUp">
              Find Your Perfect Care Provider
            </h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto animate-fadeInUp">
              Connect with top-rated healthcare professionals in your area. Quality care is just a click away.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="shadow-strong border-0 animate-fadeInUp">
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search doctors, specialties..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Location or ZIP code"
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="medical" size="lg" className="w-full">
                    <Search className="h-5 w-5" />
                    Search
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Specialties Section */}
      <section className="py-16 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Browse by Specialty
            </h2>
            <p className="text-muted-foreground text-lg">
              Find specialists in your area of need
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
            {specialties.map((specialty, index) => {
              const Icon = specialty.icon;
              return (
                <Card key={index} className="border-none shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 ${specialty.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">
                      {specialty.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {specialty.count} doctors
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-16 bg-accent/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          {/* Results Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Available Doctors
              </h2>
              <p className="text-muted-foreground">
                {filteredDoctors.length} doctors found in your area
              </p>
            </div>
            
            <div className="flex items-center gap-2 mt-4 sm:mt-0">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="ml-2">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>

          {/* Doctor Cards */}
          <div className={viewMode === "grid" ? "grid md:grid-cols-2 gap-6" : "space-y-4"}>
            {filteredDoctors.map((doctor) => (
              <Card key={doctor.id} className="border-none shadow-soft hover:shadow-medium transition-all duration-300 overflow-hidden">
                <CardContent className={`p-0 ${viewMode === "list" ? "flex" : ""}`}>
                  
                  {/* Doctor Image */}
                  <div className={viewMode === "list" ? "w-48 flex-shrink-0" : "relative"}>
                    <div className={`${viewMode === "list" ? "h-full" : "h-48"} bg-gradient-to-br from-primary/20 to-primary-light/20 flex items-center justify-center`}>
                      <User className="h-20 w-20 text-primary/50" />
                    </div>
                    {doctor.acceptingNew && (
                      <Badge className="absolute top-3 left-3 bg-green-500 hover:bg-green-600">
                        Accepting New Patients
                      </Badge>
                    )}
                  </div>

                  {/* Doctor Info */}
                  <div className="p-6 flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-xl font-semibold text-foreground mb-1">
                          {doctor.name}
                        </h3>
                        <p className="text-primary font-medium">
                          {doctor.specialty}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-yellow-500 mb-1">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="font-medium">{doctor.rating}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          ({doctor.reviews} reviews)
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">{doctor.experience} experience</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{doctor.location} • {doctor.distance}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">Next: {doctor.nextAvailable}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {doctor.languages.map((lang) => (
                        <Badge key={lang} variant="secondary" className="text-xs">
                          {lang}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Link to={`/doctor/${doctor.id}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          <User className="h-4 w-4 mr-2" />
                          View Profile
                        </Button>
                      </Link>
                      <Button variant="medical" className="flex-1">
                        <Calendar className="h-4 w-4 mr-2" />
                        Book Appointment
                      </Button>
                    </div>
                  </div>

                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More */}
          {filteredDoctors.length > 0 && (
            <div className="text-center mt-12">
              <Button variant="outline" size="lg">
                Load More Doctors
              </Button>
            </div>
          )}

          {/* No Results */}
          {filteredDoctors.length === 0 && searchTerm && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No doctors found
              </h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or browse our specialties above.
              </p>
              <Button variant="outline" onClick={() => setSearchTerm("")}>
                Clear Search
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Emergency Section */}
      <section className="py-16 bg-destructive text-destructive-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Need Emergency Care?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            For life-threatening emergencies, don't wait. Get immediate help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="hero" className="min-w-48">
              <Phone className="h-5 w-5" />
              Call 911
            </Button>
            <Button variant="outline" size="hero" className="min-w-48 text-white border-white hover:bg-white hover:text-destructive">
              <MapPin className="h-5 w-5" />
              Find ER Near Me
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FindCarePage;