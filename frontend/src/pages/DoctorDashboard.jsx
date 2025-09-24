import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import {
  User,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  Stethoscope,
  GraduationCap,
  Award,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Clock,
  Star,
  CheckCircle,
  Settings,
  Loader2
} from "lucide-react";
import { doctorAPI, authAPI, getStoredUser } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

const DoctorDashboard = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [isAddingEducation, setIsAddingEducation] = useState(false);
  const [newEducation, setNewEducation] = useState({
    institution: "",
    degree: "",
    fieldOfStudy: "",
    graduationYear: undefined,
    honors: ""
  });

  useEffect(() => {
    fetchDoctorProfile();
  }, []);

  const fetchDoctorProfile = async () => {
    try {
      setIsLoading(true);
      const doctorProfile = await doctorAPI.getProfile();
      setProfile(doctorProfile);
      setEditedProfile(doctorProfile);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      const updatedProfile = await doctorAPI.updateProfile(editedProfile);
      setProfile(updatedProfile);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddEducation = async () => {
    try {
      if (!newEducation.institution || !newEducation.degree) {
        toast({
          title: "Error",
          description: "Institution and degree are required",
          variant: "destructive",
        });
        return;
      }

      const education = await doctorAPI.addEducation(newEducation);
      
      // Update profile with new education
      if (profile) {
        const updatedProfile = {
          ...profile,
          education: [...profile.education, education]
        };
        setProfile(updatedProfile);
      }
      
      // Reset form
      setNewEducation({
        institution: "",
        degree: "",
        fieldOfStudy: "",
        graduationYear: undefined,
        honors: ""
      });
      setIsAddingEducation(false);
      
      toast({
        title: "Success",
        description: "Education entry added successfully",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to add education entry",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field, value) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const specialtyOptions = [
    'Cardiology', 'Dermatology', 'Emergency Medicine', 'Endocrinology',
    'Family Medicine', 'Gastroenterology', 'General Surgery', 'Gynecology',
    'Hematology', 'Infectious Disease', 'Internal Medicine', 'Neurology',
    'Neurosurgery', 'Obstetrics', 'Oncology', 'Ophthalmology', 'Orthopedics',
    'Otolaryngology', 'Pediatrics', 'Psychiatry', 'Pulmonology', 'Radiology',
    'Rheumatology', 'Urology', 'Other'
  ];

  const degreeOptions = ['MD', 'DO', 'MBBS', 'PhD', 'Other'];
  
  const stateOptions = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-light flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-light">
        <Header 
          isAuthenticated={true} 
          userInitial={user?.firstName ? user.firstName[0].toUpperCase() : "D"} 
          userType="doctor"
          onLogout={logout}
        />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Profile Not Found</h2>
              <p className="text-muted-foreground mb-4">
                We couldn't load your doctor profile. Please contact support if this issue persists.
              </p>
              <Button onClick={fetchDoctorProfile}>Try Again</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-light">
      <Header 
        isAuthenticated={true} 
        userInitial={user?.firstName ? user.firstName[0].toUpperCase() : "D"} 
        userType="doctor"
        onLogout={logout}
      />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant={isEditing ? "outline" : "default"}
            className="flex items-center gap-2"
          >
            {isEditing ? (
              <>
                <X className="h-4 w-4" />
                Cancel Edit
              </>
            ) : (
              <>
                <Edit3 className="h-4 w-4" />
                Edit Profile
              </>
            )}
          </Button>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={user?.firstName || ""}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={user?.lastName || ""}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={user?.email || ""}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={user?.phone || ""}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Professional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">Medical License Number</Label>
                    {isEditing ? (
                      <Input
                        id="licenseNumber"
                        value={editedProfile.medicalLicenseNumber || ""}
                        onChange={(e) => handleInputChange("medicalLicenseNumber", e.target.value)}
                      />
                    ) : (
                      <Input
                        value={profile.medicalLicenseNumber}
                        disabled
                        className="bg-muted"
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="licenseState">License State</Label>
                    {isEditing ? (
                      <Select
                        value={editedProfile.licenseState || ""}
                        onValueChange={(value) => handleInputChange("licenseState", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {stateOptions.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={profile.licenseState}
                        disabled
                        className="bg-muted"
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="primarySpecialty">Primary Specialty</Label>
                    {isEditing ? (
                      <Select
                        value={editedProfile.primarySpecialty || ""}
                        onValueChange={(value) => handleInputChange("primarySpecialty", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select specialty" />
                        </SelectTrigger>
                        <SelectContent>
                          {specialtyOptions.map((specialty) => (
                            <SelectItem key={specialty} value={specialty}>
                              {specialty}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={profile.primarySpecialty}
                        disabled
                        className="bg-muted"
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience</Label>
                    {isEditing ? (
                      <Input
                        id="experience"
                        type="number"
                        min="0"
                        value={editedProfile.yearsOfExperience || ""}
                        onChange={(e) => handleInputChange("yearsOfExperience", parseInt(e.target.value) || 0)}
                      />
                    ) : (
                      <Input
                        value={profile.yearsOfExperience || 0}
                        disabled
                        className="bg-muted"
                      />
                    )}
                  </div>
                </div>
                
                {isEditing && (
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setEditedProfile(profile);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSaveProfile} disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="education" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Education & Training
                </CardTitle>
                <Dialog open={isAddingEducation} onOpenChange={setIsAddingEducation}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Education
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Education Entry</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="institution">Institution</Label>
                        <Input
                          id="institution"
                          value={newEducation.institution}
                          onChange={(e) => setNewEducation(prev => ({ ...prev, institution: e.target.value }))}
                          placeholder="Harvard Medical School"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="degree">Degree</Label>
                        <Select
                          value={newEducation.degree}
                          onValueChange={(value) => setNewEducation(prev => ({ ...prev, degree: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select degree" />
                          </SelectTrigger>
                          <SelectContent>
                            {degreeOptions.map((degree) => (
                              <SelectItem key={degree} value={degree}>
                                {degree}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fieldOfStudy">Field of Study</Label>
                        <Input
                          id="fieldOfStudy"
                          value={newEducation.fieldOfStudy}
                          onChange={(e) => setNewEducation(prev => ({ ...prev, fieldOfStudy: e.target.value }))}
                          placeholder="Medicine"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="graduationYear">Graduation Year</Label>
                        <Input
                          id="graduationYear"
                          type="number"
                          min="1900"
                          max="2030"
                          value={newEducation.graduationYear || ""}
                          onChange={(e) => setNewEducation(prev => ({ ...prev, graduationYear: parseInt(e.target.value) || undefined }))}
                          placeholder="2020"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="honors">Honors/Awards</Label>
                        <Input
                          id="honors"
                          value={newEducation.honors}
                          onChange={(e) => setNewEducation(prev => ({ ...prev, honors: e.target.value }))}
                          placeholder="Magna Cum Laude"
                        />
                      </div>
                      <div className="flex justify-end gap-3">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsAddingEducation(false);
                            setNewEducation({
                              institution: "",
                              degree: "",
                              fieldOfStudy: "",
                              graduationYear: undefined,
                              honors: ""
                            });
                          }}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleAddEducation}>
                          Add Entry
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {profile.education && profile.education.length > 0 ? (
                  <div className="space-y-4">
                    {profile.education.map((edu, index) => (
                      <Card key={index} className="border-l-4 border-l-primary">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <h4 className="font-semibold">{edu.degree}</h4>
                              <p className="text-primary font-medium">{edu.institution}</p>
                              {edu.fieldOfStudy && (
                                <p className="text-sm text-muted-foreground">
                                  Field of Study: {edu.fieldOfStudy}
                                </p>
                              )}
                              {edu.graduationYear && (
                                <p className="text-sm text-muted-foreground">
                                  Graduated: {edu.graduationYear}
                                </p>
                              )}
                              {edu.honors && (
                                <Badge variant="secondary" className="mt-2">
                                  {edu.honors}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No education entries yet</p>
                    <p className="text-sm text-muted-foreground">
                      Add your educational background to build credibility with patients
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Profile Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Accepting New Patients</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow new patients to book appointments
                      </p>
                    </div>
                    <Badge variant={profile.isAcceptingNewPatients ? "default" : "secondary"}>
                      {profile.isAcceptingNewPatients ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Telemedicine</Label>
                      <p className="text-sm text-muted-foreground">
                        Offer virtual consultations
                      </p>
                    </div>
                    <Badge variant={profile.telemedicineEnabled ? "default" : "secondary"}>
                      {profile.telemedicineEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Patient Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="flex justify-center items-center gap-2 mb-4">
                    <Star className="h-8 w-8 text-yellow-400 fill-current" />
                    <span className="text-3xl font-bold">{profile.averageRating || "0.0"}</span>
                  </div>
                  <p className="text-muted-foreground">
                    Based on {profile.totalReviews || 0} reviews
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DoctorDashboard;