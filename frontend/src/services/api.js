const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to make API requests
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

// Authentication API
export const authAPI = {
  // Login user
  async login(loginData) {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    });
    
    if (response.success && response.data) {
      // Store token in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    }
    
    throw new Error(response.message || 'Login failed');
  },

  // Register user
  async register(registerData) {
    // Prepare the registration payload based on user type
    const payload = {
      firstName: registerData.firstName,
      lastName: registerData.lastName,
      email: registerData.email,
      password: registerData.password,
      userType: registerData.userType,
      phone: registerData.phone,
      dateOfBirth: registerData.dateOfBirth,
    };

    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    
    if (response.success && response.data) {
      // Store token and user info
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // If it's a doctor, update their profile with qualification info
      if (registerData.userType === 'doctor' && registerData.medicalLicenseNumber) {
        try {
          await doctorAPI.updateProfile({
            medicalLicenseNumber: registerData.medicalLicenseNumber,
            licenseState: registerData.licenseState,
            primarySpecialty: registerData.primarySpecialty,
            licenseExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
          });
        } catch (error) {
          console.error('Error updating doctor profile after registration:', error);
          // Don't throw error here, registration was successful
        }
      }
      
      // If it's a care provider, update their profile
      if (registerData.userType === 'careprovider' && registerData.providerType) {
        try {
          await careProviderAPI.updateProfile({
            providerType: registerData.providerType
          });
        } catch (error) {
          console.error('Error updating care provider profile after registration:', error);
          // Don't throw error here, registration was successful
        }
      }
      
      return response.data;
    }
    
    throw new Error(response.message || 'Registration failed');
  },

  // Get current user
  async getCurrentUser() {
    const response = await apiRequest('/auth/me');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Failed to get user info');
  },

  // Logout
  async logout() {
    try {
      await apiRequest('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with logout even if API call fails
    } finally {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  // Update basic profile
  async updateProfile(updates) {
    const response = await apiRequest('/auth/update-profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    
    if (response.success && response.data) {
      // Update stored user info
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data.user;
    }
    
    throw new Error(response.message || 'Profile update failed');
  },

  // Change password
  async changePassword(currentPassword, newPassword) {
    const response = await apiRequest('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Password change failed');
    }
  },
};

// Doctor-specific API
export const doctorAPI = {
  // List doctors (public)
  async list(params = {}) {
    const query = new URLSearchParams(params).toString();
    const response = await apiRequest(`/doctors${query ? `?${query}` : ''}`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to fetch doctors');
  },

  // Get doctor by id (public)
  async getById(id) {
    const response = await apiRequest(`/doctors/${id}`);
    if (response.success && response.data) {
      return response.data.doctor;
    }
    throw new Error(response.message || 'Failed to fetch doctor');
  },

  // Update doctor profile
  async updateProfile(updates) {
    const response = await apiRequest('/doctors/profile/me', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    
    if (response.success && response.data) {
      return response.data.doctor;
    }
    
    throw new Error(response.message || 'Doctor profile update failed');
  },

  // Get doctor metadata for signup/profile forms
  async getMeta() {
    const response = await apiRequest('/doctors/meta');
    if (response.success && response.data) return response.data;
    throw new Error(response.message || 'Failed to fetch doctor metadata');
  },

  // Get doctor profile
  async getProfile() {
    const response = await apiRequest('/doctors/profile/me');
    
    if (response.success && response.data) {
      return response.data.doctor;
    }
    
    throw new Error(response.message || 'Failed to get doctor profile');
  },

  // Add education entry
  async addEducation(education) {
    const response = await apiRequest('/doctors/profile/education', {
      method: 'POST',
      body: JSON.stringify(education),
    });
    
    if (response.success && response.data) {
      return response.data.education;
    }
    
    throw new Error(response.message || 'Failed to add education entry');
  },
};

// Patient-specific API
export const patientAPI = {
  // Get patient profile (private)
  async getProfile() {
    const response = await apiRequest('/patients/profile/me');
    if (response.success && response.data) {
      return response.data.patient;
    }
    throw new Error(response.message || 'Failed to get patient profile');
  },

  // Update patient profile (private)
  async updateProfile(updates) {
    const response = await apiRequest('/patients/profile/me', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    if (response.success && response.data) {
      return response.data.patient;
    }
    throw new Error(response.message || 'Failed to update patient profile');
  },
};

// Care Provider-specific API
export const careProviderAPI = {
  // Get care provider profile
  async getProfile() {
    const response = await apiRequest('/careproviders/profile/me');
    if (response.success && response.data) {
      return response.data.careProvider;
    }
    throw new Error(response.message || 'Failed to get care provider profile');
  },
  // Update care provider profile
  async updateProfile(updates) {
    const response = await apiRequest('/careproviders/profile/me', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    
    if (response.success && response.data) {
      return response.data.careProvider;
    }
    
    throw new Error(response.message || 'Care provider profile update failed');
  },
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

// Upload API
export const uploadAPI = {
  // Upload profile picture
  async uploadProfilePicture(file) {
    const formData = new FormData();
    formData.append('profilePicture', file);
    
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/upload/profile-picture`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Profile picture upload failed');
    }
    
    return data;
  },

  // Upload document
  async uploadDocument(file, documentType = 'general', description = '') {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', documentType);
    formData.append('description', description);
    
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/upload/document`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Document upload failed');
    }
    
    return data;
  },

  // Delete file
  async deleteFile(publicId) {
    const response = await apiRequest(`/upload/delete/${publicId}`, {
      method: 'DELETE',
    });
    
    if (!response.success) {
      throw new Error(response.message || 'File deletion failed');
    }
    
    return response;
  },
};

// Get stored user
export const getStoredUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};
