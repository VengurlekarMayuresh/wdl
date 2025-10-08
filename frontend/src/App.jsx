import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import FindCarePage from "./pages/FindCarePage";
import DoctorsPage from "./pages/DoctorsPage";
import DoctorProfilePage from "./pages/DoctorProfilePage";
import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorSelfProfilePage from "./pages/DoctorSelfProfilePage";
import PatientProfilePage from "./pages/PatientProfilePage";
import Profile from "./pages/Profile";
import HealthyLivingPage from "./pages/HealthyLivingPage";
import DoctorAppointmentsPage from "./pages/DoctorAppointmentsPage";
import PatientAppointmentsPage from "./pages/PatientAppointmentsPage";
import DoctorPatientsPage from "./pages/DoctorPatientsPage";
import DoctorPatientProfilePage from "./pages/DoctorPatientProfilePage";
import SecurityPrivacyPage from "./pages/SecurityPrivacyPage";
import BlogPostPage from "./pages/BlogPostPage";
import NotFound from "./pages/NotFound";
import AboutUs from "./pages/AboutUs";
import CareProviderProfilePage from "./pages/CareProviderProfilePage";
import FacilityProfilePage from "./pages/FacilityProfilePage";
import FacilityLoginPage from "./pages/FacilityLoginPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/find-care" element={<FindCarePage />} />
            <Route path="/doctor/:id" element={<DoctorProfilePage />} />
            <Route path="/doctors" element={<DoctorsPage />} />
<Route path="/doctor-dashboard" element={<ProtectedRoute allow={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
            <Route path="/doctor-profile" element={<ProtectedRoute allow={['doctor']}><DoctorSelfProfilePage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute allow={['patient','doctor','careprovider','facility']}><Profile /></ProtectedRoute>} />
            <Route path="/patient-profile" element={<ProtectedRoute allow={['patient']}><PatientProfilePage /></ProtectedRoute>} />
            <Route path="/careprovider-profile" element={<ProtectedRoute allow={['careprovider']}><CareProviderProfilePage /></ProtectedRoute>} />
            <Route path="/facility-profile" element={<ProtectedRoute allow={['facility']}><FacilityProfilePage /></ProtectedRoute>} />
            <Route path="/facility-login" element={<FacilityLoginPage />} />
            <Route path="/doctor-appointments" element={<ProtectedRoute allow={['doctor']}><DoctorAppointmentsPage /></ProtectedRoute>} />
            <Route path="/patient-appointments" element={<ProtectedRoute allow={['patient']}><PatientAppointmentsPage /></ProtectedRoute>} />
            <Route path="/doctor-patients" element={<ProtectedRoute allow={['doctor']}><DoctorPatientsPage /></ProtectedRoute>} />
            <Route path="/doctor-patient/:patientId" element={<ProtectedRoute allow={['doctor']}><DoctorPatientProfilePage /></ProtectedRoute>} />
            <Route path="/security-privacy" element={<SecurityPrivacyPage />} />
            <Route path="/healthy-living" element={<HealthyLivingPage />} />
            <Route path="/blog/:id" element={<BlogPostPage />} />
            <Route path="/about" element={<AboutUs />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;