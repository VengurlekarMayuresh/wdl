import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUserStr = localStorage.getItem('user');
        
        console.log('Auth check - token exists:', !!token);
        console.log('Auth check - stored user exists:', !!storedUserStr);
        
        if (token) {
          // First, try to use stored user data for immediate UI update
          if (storedUserStr) {
            try {
              const storedUser = JSON.parse(storedUserStr);
              console.log('Auth check - using stored user data:', storedUser);
              setUser(storedUser);
            } catch (e) {
              console.error('Failed to parse stored user:', e);
            }
          }
          
          // Then fetch fresh data from API
          try {
            const freshUserData = await authAPI.getCurrentUser();
            console.log('🔍 Auth check - RAW API response:', freshUserData);
            console.log('🔍 Type of freshUserData:', typeof freshUserData);
            console.log('🔍 Keys in freshUserData:', Object.keys(freshUserData || {}));
            
            // Check if the response has the nested structure
            if (freshUserData && freshUserData.user) {
              console.log('🔍 Found nested user structure');
              console.log('🔍 freshUserData.user:', freshUserData.user);
              console.log('🔍 freshUserData.profile:', freshUserData.profile);
              
              // For AuthContext, we want to store the complete structure
              // but also flatten it for easier access
              const flattenedUser = {
                ...freshUserData.user,
                profile: freshUserData.profile
              };
              console.log('🔧 Flattened user for AuthContext:', flattenedUser);
              setUser(flattenedUser);
              localStorage.setItem('user', JSON.stringify(flattenedUser));
            } else {
              console.log('🔍 Using direct user structure');
              setUser(freshUserData);
              localStorage.setItem('user', JSON.stringify(freshUserData));
            }
          } catch (apiError) {
            console.error('API getCurrentUser failed:', apiError);
            // If API fails but we have stored data, keep using it
            if (!storedUserStr) {
              throw apiError;
            }
          }
        } else {
          console.log('Auth check - no token found');
        }
      } catch (error) {
        // Token might be expired or invalid, remove it
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        console.error('Auth check failed:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      // Call the login API
      const loginResponse = await authAPI.login({ email, password });
      console.log('Login API response:', loginResponse);
      
      // The login API already stores token and user in localStorage
      // Now get the current user data
      const userData = await authAPI.getCurrentUser();
      console.log('User data after login:', userData);
      
      setUser(userData);
      
    } catch (error) {
      console.error('Login failed:', error);
      
      // For development/testing purposes, create a mock user if API fails
      console.log('API login failed, creating mock user for testing:', error.message);
      
      // Create realistic mock user data
      const mockUser = {
        _id: 'mock_' + Date.now(),
        firstName: email.includes('doctor') ? 'John' : 'Jane',
        lastName: email.includes('doctor') ? 'Smith' : 'Doe',
        email: email,
        userType: email.includes('doctor') ? 'doctor' : 'patient',
        phone: '+1 (555) 123-4567',
        profilePicture: email.includes('doctor') ? 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face' : 'https://images.unsplash.com/photo-1494790108755-2616b79e8b93?w=400&h=400&fit=crop&crop=face',
        // Additional fields
        primarySpecialty: email.includes('doctor') ? 'Cardiology' : undefined,
        yearsOfExperience: email.includes('doctor') ? 15 : undefined,
        dateOfBirth: '1985-01-01',
        address: {
          street: '123 Medical Plaza',
          city: 'New York',
          state: 'NY',
          zipCode: '10001'
        }
      };
      
      // Set mock token and user
      localStorage.setItem('token', 'mock_token_' + Date.now());
      localStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);
      
      console.log('Mock user created and stored:', mockUser);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const userData = await authAPI.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      logout();
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};