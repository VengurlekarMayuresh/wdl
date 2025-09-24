import { Header } from "@/components/layout/Header";
import { useAuth } from "@/contexts/AuthContext";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Stethoscope, Star, Search, UserCircle2 } from "lucide-react";
import { doctorAPI } from "@/services/api";

const FindCarePage = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [specialty, setSpecialty] = useState("");
  const [accepting, setAccepting] = useState("any");
  const [isLoading, setIsLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);

  const loadDoctors = async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (specialty) params.specialty = specialty;
      if (accepting !== "any") params.acceptingNewPatients = accepting === "yes";
      const { doctors: list } = await doctorAPI.list(params);
      setDoctors(list || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-light">
<Header 
        isAuthenticated={isAuthenticated}
        userInitial={(user?.firstName?.[0]?.toUpperCase?.() || 'U')}
        userType={user?.userType || 'patient'}
        onLogout={logout}
      />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Find Care</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="col-span-1">
            <label className="block text-sm font-medium mb-2">Specialty</label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. Cardiology, Pediatrics, Dermatology"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
              />
              <Button onClick={loadDoctors} disabled={isLoading}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Accepting New Patients</label>
            <Select value={accepting} onValueChange={setAccepting}>
              <SelectTrigger>
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button className="w-full" onClick={loadDoctors} disabled={isLoading}>
              {isLoading ? "Searching..." : "Search"}
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {doctors.length === 0 && (
            <p className="text-muted-foreground">No doctors found. Try changing your filters.</p>
          )}
          {doctors.map((doc) => (
            <Card key={doc._id} className="border-none shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserCircle2 className="h-10 w-10 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold">
                        {doc?.userId?.firstName} {doc?.userId?.lastName}
                      </h3>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="h-4 w-4" />
                        <span className="text-sm">{doc.averageRating?.toFixed?.(1) ?? "N/A"}</span>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                      <Stethoscope className="h-4 w-4" />
                      <span>{doc.primarySpecialty}</span>
                    </div>
                    {doc?.userId?.address?.city && (
                      <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{doc.userId.address.city}</span>
                      </div>
                    )}
                    <div className="mt-4 flex gap-2">
                      <Link to={`/doctor/${doc._id}`}>
                        <Button variant="nav">View Profile</Button>
                      </Link>
                      {doc.isAcceptingNewPatients && (
                        <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded">
                          Accepting new patients
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FindCarePage;