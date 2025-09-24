import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft, Search } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-light flex items-center justify-center p-4">
      <Card className="shadow-strong border-0 max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="h-10 w-10 text-white" />
          </div>
          
          <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Page Not Found</h2>
          
          <p className="text-muted-foreground mb-8 leading-relaxed">
            The page you're looking for doesn't exist or has been moved. 
            Let's get you back to managing your healthcare journey.
          </p>
          
          <div className="space-y-3">
            <Link to="/" className="w-full">
              <Button variant="medical" size="lg" className="w-full">
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            
            <Link to="/find-care" className="w-full">
              <Button variant="outline" size="lg" className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Find a Doctor
              </Button>
            </Link>
            
            <Button 
              variant="ghost" 
              onClick={() => window.history.back()}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
