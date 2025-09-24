import { Header } from "@/components/layout/Header";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  const { user, isAuthenticated, logout } = useAuth();
  
  return (
    <div className="min-h-screen bg-gradient-light">
<Header 
        isAuthenticated={isAuthenticated}
        userInitial={(user?.firstName?.[0]?.toUpperCase?.() || 'U')}
        userType={user?.userType || 'patient'}
        onLogout={logout}
      />
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-muted-foreground mb-8">The page you're looking for doesn't exist.</p>
        <Link to="/">
          <Button>Go Home</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;