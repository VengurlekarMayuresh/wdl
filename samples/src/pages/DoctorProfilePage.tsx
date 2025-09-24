import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Stethoscope
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

const DoctorProfilePage = () => {
  const { id } = useParams();

  // Mock doctor data
  const doctor = {
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
  };

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

  const availableSlots = [
    { date: "Today", time: "3:00 PM", available: true },
    { date: "Today", time: "4:30 PM", available: true },
    { date: "Tomorrow", time: "10:00 AM", available: true },
    { date: "Tomorrow", time: "2:00 PM", available: false },
    { date: "Thu, Dec 5", time: "9:00 AM", available: true },
    { date: "Thu, Dec 5", time: "11:30 AM", available: true }
  ];

  return (
    <div className="min-h-screen bg-gradient-light">
      <Header isAuthenticated={true} userInitial="P" />
      
      {/* Back Navigation */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        <Link to="/find-care" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Search Results
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
                      <div className="w-48 h-48 bg-gradient-to-br from-primary/20 to-primary-light/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="h-24 w-24 text-primary/50" />
                      </div>
                      {doctor.acceptingNew && (
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
                      {doctor.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                      <Badge variant="secondary" className="text-primary font-medium">
                        <Stethoscope className="h-3 w-3 mr-1" />
                        {doctor.specialty}
                      </Badge>
                      <Badge variant="outline">
                        {doctor.subSpecialty}
                      </Badge>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="font-medium">{doctor.rating}</span>
                        <span className="text-muted-foreground">({doctor.reviews} reviews)</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{doctor.experience} experience</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{doctor.location}</div>
                          <div className="text-sm text-muted-foreground">{doctor.address}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{doctor.phone}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{doctor.email}</span>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Languages:</div>
                        <div className="flex flex-wrap gap-2">
                          {doctor.languages.map((lang) => (
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
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="availability">Book</TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="space-y-6">
              <Card className="shadow-soft border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    About Dr. {doctor.name.split(' ').pop()}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {doctor.about}
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-soft border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary" />
                    Areas of Specialization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-3">
                    {doctor.specializations.map((spec, index) => (
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
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      Education
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {doctor.education.map((edu, index) => (
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
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      Certifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {doctor.certifications.map((cert, index) => (
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
                        <span className="font-medium">{doctor.rating}</span>
                      </div>
                      <span className="text-muted-foreground">({doctor.reviews} reviews)</span>
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

            <TabsContent value="schedule" className="space-y-6">
              <Card className="shadow-soft border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Working Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(doctor.workingHours).map(([day, hours]) => (
                      <div key={day} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                        <span className="font-medium">{day}</span>
                        <span className={`${hours === "Closed" ? "text-muted-foreground" : "text-green-600"}`}>
                          {hours}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="availability" className="space-y-6">
              <Card className="shadow-soft border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Available Appointments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {availableSlots.map((slot, index) => (
                      <Button
                        key={index}
                        variant={slot.available ? "outline" : "secondary"}
                        className={`p-4 h-auto flex-col ${!slot.available ? "opacity-50 cursor-not-allowed" : "hover:bg-primary hover:text-primary-foreground"}`}
                        disabled={!slot.available}
                      >
                        <div className="font-medium">{slot.date}</div>
                        <div className="text-sm">{slot.time}</div>
                        {!slot.available && (
                          <div className="text-xs text-muted-foreground mt-1">Booked</div>
                        )}
                      </Button>
                    ))}
                  </div>
                  <div className="mt-6 text-center">
                    <Button variant="medical" size="lg">
                      <Calendar className="h-4 w-4 mr-2" />
                      View More Dates
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

export default DoctorProfilePage;