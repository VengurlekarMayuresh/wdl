import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Profile = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [hasRedirected, setHasRedirected] = useState(false);

  // Debug logging
  console.log('=== Profile Component Debug ===');
  console.log('Current path:', location.pathname);
  console.log('User:', user);
  console.log('isAuthenticated:', isAuthenticated);
  console.log('isLoading:', isLoading);
  console.log('userType:', user?.userType);
  console.log('hasRedirected:', hasRedirected);

  useEffect(() => {
    // Only redirect once and when not loading
    if (!isLoading && !hasRedirected) {
      if (!isAuthenticated) {
        console.log('🔄 Redirecting to login - not authenticated');
        setHasRedirected(true);
        navigate('/login', { replace: true });
      } else if (user?.userType === 'doctor') {
        console.log('🔄 Redirecting doctor to /doctor-profile');
        setHasRedirected(true);
        navigate('/doctor-profile', { replace: true });
      } else if (user?.userType === 'patient') {
        console.log('🔄 Redirecting patient to /patient-profile');
        setHasRedirected(true);
        navigate('/patient-profile', { replace: true });
      } else if (user?.userType === 'careprovider') {
        console.log('🔄 Redirecting care provider to /careprovider-profile');
        setHasRedirected(true);
        navigate('/careprovider-profile', { replace: true });
      } else if (user?.userType === 'facility') {
        console.log('🔄 Redirecting facility to /facility-profile');
        setHasRedirected(true);
        navigate('/facility-profile', { replace: true });
      } else if (user) {
        console.log('❓ Unknown user type:', user?.userType);
        console.log('Full user object:', user);
        // Default to patient profile if user type is unclear
        setHasRedirected(true);
        navigate('/patient-profile', { replace: true });
      }
    }
  }, [user, isAuthenticated, isLoading, navigate, hasRedirected]);

  // Show loading state while determining where to redirect
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>
          {isLoading 
            ? 'Loading user data...' 
            : hasRedirected 
            ? 'Redirecting...' 
            : 'Determining profile type...'
          }
        </p>
        {!isLoading && user && (
          <p className="text-sm text-muted-foreground mt-2">
            User: {user.firstName} {user.lastName} ({user.userType})
          </p>
        )}
      </div>
    </div>
  );
};

export default Profile;