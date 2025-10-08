import axios from 'axios';

// Align with the rest of the app: use VITE_API_URL and default to same-origin /api in production
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');

const api = axios.create({
  baseURL: `${API_BASE_URL}/healthcare-facilities`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token if available (align with login storage key 'token')
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const healthcareFacilitiesAPI = {
  // Get all healthcare facilities with filtering
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching healthcare facilities:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get single healthcare facility by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching healthcare facility:', error);
      throw error.response?.data || error.message;
    }
  },

  // Search healthcare facilities
  search: async (params) => {
    try {
      const response = await api.get('/', { params });
      return response.data;
    } catch (error) {
      console.error('Error searching healthcare facilities:', error);
      throw error.response?.data || error.message;
    }
  },

  // Search by location (nearby facilities)
  searchNearby: async (lat, lng, radius = 10, type = null) => {
    try {
      const params = { lat, lng, radius };
      if (type) params.type = type;
      
      const response = await api.get('/', { params });
      return response.data;
    } catch (error) {
      console.error('Error searching nearby facilities:', error);
      throw error.response?.data || error.message;
    }
  },

  // Search by pincode
  searchByPincode: async (pincode, type = null) => {
    try {
      const params = { pincode };
      if (type) params.type = type;
      
      const response = await api.get('/', { params });
      return response.data;
    } catch (error) {
      console.error('Error searching by pincode:', error);
      throw error.response?.data || error.message;
    }
  },

  // Search by type (pharmacy, clinic, hospital, etc.)
  searchByType: async (type, additionalParams = {}) => {
    try {
      const params = { type, ...additionalParams };
      const response = await api.get('/', { params });
      return response.data;
    } catch (error) {
      console.error('Error searching by type:', error);
      throw error.response?.data || error.message;
    }
  },

  // Create new healthcare facility
  create: async (facilityData) => {
    try {
      const response = await api.post('/', facilityData);
      return response.data;
    } catch (error) {
      console.error('Error creating healthcare facility:', error);
      throw error.response?.data || error.message;
    }
  },

  // Update healthcare facility
  update: async (id, facilityData) => {
    try {
      const response = await api.put(`/${id}`, facilityData);
      return response.data;
    } catch (error) {
      console.error('Error updating healthcare facility:', error);
      throw error.response?.data || error.message;
    }
  },

  // Add review to facility
  addReview: async (id, reviewData) => {
    try {
      const response = await api.post(`/${id}/reviews`, reviewData);
      return response.data;
    } catch (error) {
      console.error('Error adding review:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get facility types and metadata
  getMetaData: async () => {
    try {
      const response = await api.get('/meta/types');
      return response.data;
    } catch (error) {
      console.error('Error fetching metadata:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get search suggestions
  getSearchSuggestions: async (query) => {
    try {
      const response = await api.get('/search/suggestions', {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      throw error.response?.data || error.message;
    }
  },

  // Utility functions
  utils: {
    // Filter facilities by primary care types
    getPrimaryCare: (facilities) => {
      return facilities.filter(facility => 
        ['pharmacy', 'primary_care', 'clinic'].includes(facility.type)
      );
    },

    // Filter facilities by hospital types
    getHospitals: (facilities) => {
      return facilities.filter(facility => facility.type === 'hospital');
    },

    // Filter facilities by lab/diagnostic types
    getLabs: (facilities) => {
      return facilities.filter(facility => 
        ['lab', 'diagnostic_center'].includes(facility.type)
      );
    },

    // Calculate distance (if coordinates are available)
    calculateDistance: (lat1, lng1, lat2, lng2) => {
      const R = 6371; // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c; // Distance in km
    },

    // Format a readable facility type string
    formatType: (type, subCategory) => {
      if (!type && !subCategory) return 'Facility';
      const map = {
        pharmacy: 'Pharmacy',
        clinic: 'Clinic',
        hospital: 'Hospital',
        lab: 'Laboratory',
        diagnostic_center: 'Diagnostic Center',
        primary_care: 'Primary Care',
      };
      const base = map[type] || (type ? type.replace(/_/g, ' ') : 'Facility');
      if (subCategory && typeof subCategory === 'string') {
        const sc = subCategory.replace(/_/g, ' ');
        return `${base} • ${sc}`;
      }
      return base;
    },
    

    // Format operating hours
    formatOperatingHours: (operatingHours, is24x7) => {
      if (is24x7) return '24/7 Open';
      
      if (!operatingHours) {
        return 'Hours not specified';
      }

      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      
      // Handle object format (from mock data)
      if (typeof operatingHours === 'object' && !Array.isArray(operatingHours)) {
        const todayHours = operatingHours[today];
        if (!todayHours || todayHours === 'Closed') {
          return 'Closed today';
        }
        return todayHours;
      }
      
      // Handle array format (from API)
      if (Array.isArray(operatingHours)) {
        if (operatingHours.length === 0) {
          return 'Hours not specified';
        }
        
        const todaySchedule = operatingHours.find(oh => oh.day === today);
        
        if (!todaySchedule || !todaySchedule.isOpen) {
          return 'Closed today';
        }

        return `${todaySchedule.openTime} - ${todaySchedule.closeTime}`;
      }
      
      return 'Hours not specified';
    },

    // Check if facility is currently open
    isCurrentlyOpen: (operatingHours, is24x7) => {
      if (is24x7) return true;
      
      if (!operatingHours) return false;

      const now = new Date();
      const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
      
      // Handle object format (from mock data)
      if (typeof operatingHours === 'object' && !Array.isArray(operatingHours)) {
        const todayHours = operatingHours[currentDay];
        if (!todayHours || todayHours === 'Closed') return false;
        
        // Parse time range like "8:00 AM - 8:00 PM"
        const timeMatch = todayHours.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))\s*-\s*(\d{1,2}:\d{2}\s*(?:AM|PM))/i);
        if (!timeMatch) return true; // If we can't parse, assume open
        
        const [, openTime, closeTime] = timeMatch;
        const currentTime12 = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        
        // Simple time comparison (this is approximate)
        return currentTime12 >= openTime && currentTime12 <= closeTime;
      }
      
      // Handle array format (from API)
      if (Array.isArray(operatingHours)) {
        if (operatingHours.length === 0) return false;
        
        const todaySchedule = operatingHours.find(oh => oh.day === currentDay);
        
        if (!todaySchedule || !todaySchedule.isOpen) return false;
        
        return currentTime >= todaySchedule.openTime && currentTime <= todaySchedule.closeTime;
      }
      
      return false;
    },

    // Format facility type for display
    formatType: (type, subCategory) => {
      const typeMap = {
        'pharmacy': 'Pharmacy',
        'clinic': 'Clinic',
        'hospital': 'Hospital',
        'lab': 'Laboratory',
        'diagnostic_center': 'Diagnostic Center',
        'primary_care': 'Primary Care'
      };

      const subCategoryMap = {
        'retail_pharmacy': 'Retail Pharmacy',
        'hospital_pharmacy': 'Hospital Pharmacy',
        'general_clinic': 'General Clinic',
        'specialty_clinic': 'Specialty Clinic',
        'urgent_care': 'Urgent Care',
        'multi_specialty_hospital': 'Multi-Specialty Hospital',
        'pathology_lab': 'Pathology Lab',
        'diagnostic_lab': 'Diagnostic Lab',
        'imaging_center': 'Imaging Center'
      };

      const mainType = typeMap[type] || type;
      const subType = subCategoryMap[subCategory];
      
      return subType || mainType;
    }
  }
};

export default healthcareFacilitiesAPI;