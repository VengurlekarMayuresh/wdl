import { Header } from "@/components/layout/Header";
import { useAuth } from "@/contexts/AuthContext";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Stethoscope, Award, Clock, Star, MapPin, Phone, Mail } from "lucide-react";
import { doctorAPI } from "@/services/api";

const DoctorProfilePage = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        const doc = await doctorAPI.getById(id);
        setDoctor(doc);
      } catch (e) {
        setError(e.message || 'Failed to load doctor');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);
  
  return (
    <div className="min-h-screen bg-gradient-light">
<Header 
        isAuthenticated={isAuthenticated}
        userInitial={(user?.firstName?.[0]?.toUpperCase?.() || 'U')}
        userType={user?.userType || 'patient'}
        onLogout={logout}
      />
      <div className="max-w-5xl mx-auto px-4 py-8">
        {loading && <p>Loading doctor profile...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {doctor && (
          <div className="space-y-6">
            <Card className="border-none shadow-soft">
              <CardContent className="p-6">
                <div className="flex gap-6">
<div className="w-20 h-20 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                    {doctor?.userId?.profilePicture ? (
                      <img src={doctor.userId.profilePicture} alt={`${doctor?.userId?.firstName} ${doctor?.userId?.lastName}`} className="w-full h-full object-cover" />
                    ) : (
                      doctor?.userId?.firstName?.[0]?.toUpperCase()
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-2xl font-bold">
                          Dr. {doctor?.userId?.firstName} {doctor?.userId?.lastName}
                        </h1>
                        <div className="text-muted-foreground flex items-center gap-2 mt-1">
                          <Stethoscope className="h-4 w-4" />
                          <span>{doctor.primarySpecialty}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="h-5 w-5" />
                        <span>{doctor.averageRating?.toFixed?.(1) ?? 'N/A'}</span>
                      </div>
                    </div>
                    {doctor?.userId?.address?.city && (
                      <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{doctor.userId.address.city}</span>
                      </div>
                    )}
                    <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{doctor?.userId?.phone || 'N/A'}</span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{doctor?.userId?.email || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-soft">
              <CardHeader>
                <CardTitle>Qualifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  <span>License: {doctor.medicalLicenseNumber} ({doctor.licenseState})</span>
                </div>
                {doctor?.education?.length > 0 && (
                  <div>
                    <div className="font-medium mb-2">Education</div>
                    <div className="grid gap-2">
                      {doctor.education.map((edu) => (
                        <div key={edu._id} className="text-sm text-muted-foreground">
                          {edu.degree} in {edu.fieldOfStudy} - {edu.institution} ({edu.graduationYear || 'Year N/A'})
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-soft">
              <CardHeader>
                <CardTitle>Availability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Telemedicine: {doctor.telemedicineEnabled ? 'Available' : 'Not available'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Accepting new patients: {doctor.isAcceptingNewPatients ? 'Yes' : 'No'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorProfilePage;