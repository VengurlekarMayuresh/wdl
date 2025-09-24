import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import FindCarePage from "./pages/FindCarePage";
import DoctorProfilePage from "./pages/DoctorProfilePage";
import PatientProfilePage from "./pages/PatientProfilePage";
import HealthyLivingPage from "./pages/HealthyLivingPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/find-care" element={<FindCarePage />} />
          <Route path="/doctor/:id" element={<DoctorProfilePage />} />
          <Route path="/doctors" element={<DoctorProfilePage />} />
          <Route path="/profile" element={<PatientProfilePage />} />
          <Route path="/patient-profile" element={<PatientProfilePage />} />
          <Route path="/healthy-living" element={<HealthyLivingPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
