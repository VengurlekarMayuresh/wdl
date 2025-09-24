import { Header } from "@/components/layout/Header";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";

const HealthyLivingPage = () => {
  const { user, isAuthenticated, logout } = useAuth();
  
  return (
    <div className="min-h-screen bg-gradient-light">
<Header 
        isAuthenticated={isAuthenticated}
        userInitial={(user?.firstName?.[0]?.toUpperCase?.() || 'U')}
        userType={user?.userType || 'patient'}
        onLogout={logout}
      />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Healthy Living</h1>
        <div className="grid md:grid-cols-3 gap-6">
          {["Nutrition Basics", "Exercise Routines", "Mental Wellness", "Sleep Hygiene", "Preventive Care", "Stress Management"].map((topic) => (
            <Card key={topic} className="border-none shadow-soft">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">{topic}</h3>
                <p className="text-muted-foreground text-sm">
                  Curated tips and resources to help you improve your {topic.toLowerCase()}.
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HealthyLivingPage;