import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import PatientProfilePage from './PatientProfilePage';
import CareProviderProfilePage from './CareProviderProfilePage';

const Profile = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate('/login');
      } else if (user?.userType === 'doctor') {
        navigate('/doctor-dashboard');
      }
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  if (isLoading) return null;
  if (!isAuthenticated) return null;

  if (user?.userType === 'patient') {
    return <PatientProfilePage />;
  }

  if (user?.userType === 'careprovider') {
    return <CareProviderProfilePage />;
  }

  return null;
};

export default Profile;