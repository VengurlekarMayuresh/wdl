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
    console.log('🚀 AuthContext: Starting login process');
    console.log('📧 Login credentials:', { email, password: '[HIDDEN]' });
    
    try {
      // Clear any previous errors or user data
      setUser(null);
      
      console.log('📡 AuthContext: Calling authAPI.login...');
      // Call the login API
      const loginResponse = await authAPI.login({ email, password });
      console.log('✅ AuthContext: Login API response received:', {
        success: !!loginResponse,
        hasUser: !!loginResponse?.user,
        hasProfile: !!loginResponse?.profile,
        hasToken: !!loginResponse?.token
      });
      console.log('📦 Full login response:', loginResponse);
      
      // The login API already stores token and user in localStorage
      // Use the user data from the login response
      if (loginResponse && loginResponse.user) {
        const userData = {
          ...loginResponse.user,
          profile: loginResponse.profile
        };
        console.log('👤 AuthContext: Setting user data:', {
          userId: userData._id,
          email: userData.email,
          userType: userData.userType,
          hasProfile: !!userData.profile
        });
        setUser(userData);
        console.log('✅ AuthContext: Login successful!');
      } else {
        console.error('❌ AuthContext: Invalid login response structure:', loginResponse);
        throw new Error('Invalid response from server: missing user data');
      }
      
    } catch (error) {
      console.error('❌ AuthContext: Login failed with error:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Clear any stale data and throw the error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      
      // Provide more user-friendly error messages
      let userFriendlyMessage = error.message;
      
      if (error.message.includes('Cannot connect to server')) {
        userFriendlyMessage = 'Cannot connect to server. Please check your internet connection and try again.';
      } else if (error.message.includes('Invalid credentials')) {
        userFriendlyMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (error.message.includes('Failed to fetch')) {
        userFriendlyMessage = 'Network error. Please check if the server is running and try again.';
      }
      
      console.error('🚨 AuthContext: Throwing user-friendly error:', userFriendlyMessage);
      
      // Re-throw with user-friendly message
      const friendlyError = new Error(userFriendlyMessage);
      friendlyError.originalError = error;
      throw friendlyError;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const freshUserData = await authAPI.getCurrentUser();
      // Keep user shape consistent with initial auth check by flattening if needed
      if (freshUserData && freshUserData.user) {
        const flattenedUser = {
          ...freshUserData.user,
          profile: freshUserData.profile,
        };
        setUser(flattenedUser);
        localStorage.setItem('user', JSON.stringify(flattenedUser));
      } else {
        setUser(freshUserData);
        localStorage.setItem('user', JSON.stringify(freshUserData));
      }
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