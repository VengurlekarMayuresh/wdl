// Robust API URL configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');
const DEBUG = !!import.meta.env.DEV;

if (DEBUG) {
  console.log('🔗 API Base URL:', API_BASE_URL);
  console.log('🌐 Environment:', import.meta.env.MODE);
}

// Helper function to make API requests with improved error handling
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const fullUrl = `${API_BASE_URL}${endpoint}`;

  if (DEBUG) {
    console.log(`🚀 API request:`, { url: fullUrl, method: options.method || 'GET' });
  }

  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    credentials: 'include', // Include credentials for CORS
    ...options,
  };

  try {
    const response = await fetch(fullUrl, config);

    if (DEBUG) {
      console.log(`📡 Response: ${response.status} ${response.statusText}`);
    }

    // Handle different content types
    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { message: await response.text() };
    }
    if (!response.ok) {
      const errorMessage = data.message || `HTTP ${response.status}: ${response.statusText}`;
      console.error(`❌ API Error: ${errorMessage}`);
      throw new Error(errorMessage);
    }
    
    return data;
  } catch (error) {
    console.error(`❌ API request failed:`, {
      url: fullUrl,
      error: error.message,
      stack: error.stack
    });
    
    // Provide more specific error messages
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error(`Cannot connect to server at ${API_BASE_URL}. Please check if the backend is running.`);
    }
    
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
      // Facility fallback: backend returns { token, facility } instead of { token, user }
      let userPayload = response.data.user;
      if (!userPayload && response.data.facility) {
        const f = response.data.facility;
        userPayload = {
          userType: 'facility',
          email: f.email,
          facilityId: f._id,
          firstName: f.name,
          lastName: ''
        };
      }
      if (!userPayload) {
        throw new Error('Invalid response from server: missing user data');
      }
      // Store token and normalized user
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(userPayload));
      return { token: response.data.token, user: userPayload };
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
      // Pass-through doctor fields if present (backend may ignore)
      ...(registerData.userType === 'doctor' ? {
        medicalLicenseNumber: registerData.medicalLicenseNumber,
        licenseState: registerData.licenseState,
        primarySpecialty: registerData.primarySpecialty,
      } : {}),
      // Facility fields mapped to expected backend shape
      ...(registerData.userType === 'facility' ? {
        // Send both explicit facility fields and generic aliases for maximum compatibility
        facilityName: registerData.facilityName,
        facilityType: registerData.facilityType,
        name: registerData.facilityName,
        type: registerData.facilityType,
        // Structured address
        facilityAddress: {
          street: registerData.facilityStreet,
          area: registerData.facilityArea,
          city: registerData.facilityCity,
          state: registerData.facilityState,
          pincode: String(registerData.facilityPincode || '').trim(),
        },
        // Flat address mirrors
        facilityStreet: registerData.facilityStreet,
        facilityArea: registerData.facilityArea,
        facilityCity: registerData.facilityCity,
        facilityState: registerData.facilityState,
        facilityPincode: String(registerData.facilityPincode || '').trim(),
      } : {}),
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
      // Update stored user info - handle both nested and flat user structures
      const userData = response.data.user || response.data;
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
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

// Simple in-memory cache for GET endpoints to reduce duplicate requests
const __apiCache = {
  doctorsList: new Map(), // key -> { ts, data }
  pending: new Map(), // key -> Promise
};
const __CACHE_TTL_MS = 60 * 1000; // 60 seconds
const __now = () => Date.now();
const __keyFromParams = (base, params = {}) => {
  const sp = new URLSearchParams(params);
  // Ensure stable order
  const entries = Array.from(sp.entries()).sort(([a], [b]) => a.localeCompare(b));
  const stable = new URLSearchParams(entries).toString();
  return `${base}?${stable}`;
};

// Doctor-specific API
export const doctorAPI = {
  // List doctors (public)
  async list(params = {}) {
    const key = __keyFromParams('/doctors', params);

    // Return cached within TTL
    const cached = __apiCache.doctorsList.get(key);
    if (cached && (__now() - cached.ts) < __CACHE_TTL_MS) {
      return cached.data;
    }

    // De-duplicate concurrent requests
    if (__apiCache.pending.has(key)) {
      return __apiCache.pending.get(key);
    }

    const query = new URLSearchParams(params).toString();
    const p = (async () => {
      try {
        const response = await apiRequest(`/doctors${query ? `?${query}` : ''}`);
        if (response.success && response.data) {
          __apiCache.doctorsList.set(key, { ts: __now(), data: response.data });
          return response.data;
        }
        throw new Error(response.message || 'Failed to fetch doctors');
      } catch (err) {
        // If rate-limited and we have stale cache, return stale to avoid UI break
        const msg = (err && err.message) || '';
        if (msg.toLowerCase().includes('too many requests')) {
          const stale = __apiCache.doctorsList.get(key);
          if (stale) return stale.data;
        }
        throw err;
      } finally {
        __apiCache.pending.delete(key);
      }
    })();

    __apiCache.pending.set(key, p);
    return p;
  },

  // Get doctor by id (public)
  async getById(id) {
    const response = await apiRequest(`/doctors/${id}`);
    if (response.success && response.data) {
      return response.data.doctor;
    }
    throw new Error(response.message || 'Failed to fetch doctor');
  },

  // Get doctor reviews (public)
  async getReviews(id) {
    const response = await apiRequest(`/doctors/${id}/reviews`);
    if (response.success && response.data) {
      return response.data.reviews || response.data;
    }
    throw new Error(response.message || 'Failed to fetch doctor reviews');
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

  // Update education entry
  async updateEducation(educationId, education) {
    const response = await apiRequest(`/doctors/profile/education/${educationId}`, {
      method: 'PUT',
      body: JSON.stringify(education),
    });
    
    if (response.success && response.data) {
      return response.data.education;
    }
    
    throw new Error(response.message || 'Failed to update education entry');
  },

  // Delete education entry
  async deleteEducation(educationId) {
    const response = await apiRequest(`/doctors/profile/education/${educationId}`, {
      method: 'DELETE',
    });
    
    if (response.success) {
      return true;
    }
    
    throw new Error(response.message || 'Failed to delete education entry');
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

  // Update health overview/vital signs (private)
  async updateHealthOverview(healthData) {
    const response = await apiRequest('/patients/profile/health-overview', {
      method: 'PUT',
      body: JSON.stringify(healthData),
    });
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to update health overview');
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
// Content API (health articles, tips, recipes, workouts)
export const contentAPI = {
  // Fetch featured articles
  async getFeaturedArticles(params = {}) {
    const query = new URLSearchParams(params).toString();
    const response = await apiRequest(`/content/articles${query ? `?${query}` : ''}`);
    if (response.success && response.data) return response.data.articles || response.data;
    throw new Error(response.message || 'Failed to fetch articles');
  },
  // Fetch categories for healthy living
  async getCategories() {
    const response = await apiRequest('/content/healthy/categories');
    if (response.success && response.data) return response.data.categories || response.data;
    throw new Error(response.message || 'Failed to fetch categories');
  },
  // Fetch daily tips
  async getTips() {
    const response = await apiRequest('/content/tips');
    if (response.success && response.data) return response.data.tips || response.data;
    throw new Error(response.message || 'Failed to fetch tips');
  },
  // Fetch healthy recipes
  async getRecipes() {
    const response = await apiRequest('/content/recipes');
    if (response.success && response.data) return response.data.recipes || response.data;
    throw new Error(response.message || 'Failed to fetch recipes');
  },
  // Fetch workout plans
  async getWorkouts() {
    const response = await apiRequest('/content/workouts');
    if (response.success && response.data) return response.data.workouts || response.data;
    throw new Error(response.message || 'Failed to fetch workouts');
  },
};

// Facility authentication API
export const facilityAuthAPI = {
  async login({ authEmail, password }) {
    const response = await apiRequest('/healthcare-facilities/auth/login', {
      method: 'POST',
      body: JSON.stringify({ authEmail, password }),
    });
    if (response.success && response.data) {
      // Store facility token separately to avoid colliding with user token
      localStorage.setItem('facilityToken', response.data.token);
      localStorage.setItem('facilityId', response.data.facilityId);
      return response.data;
    }
    throw new Error(response.message || 'Facility login failed');
  },
  async register({ name, type, address, authEmail, password }) {
    const response = await apiRequest('/healthcare-facilities/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, type, address, authEmail, password }),
    });
    if (response.success && response.data) {
      localStorage.setItem('facilityToken', response.data.token);
      localStorage.setItem('facilityId', response.data.facilityId);
      return response.data;
    }
    throw new Error(response.message || 'Facility registration failed');
  },
};

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

// Appointment Slots API
export const slotsAPI = {
  // Doctor: Create/Add a new slot
  async createSlot(slotData) {
    const response = await apiRequest('/appointments/slots', {
      method: 'POST',
      body: JSON.stringify(slotData),
    });
    if (response.success && response.data) {
      return response.data.slot;
    }
    throw new Error(response.message || 'Failed to create slot');
  },

  // Doctor: Get my slots
  async getMySlots() {
    const response = await apiRequest('/appointments/slots/my');
    if (response.success && response.data) {
      return response.data.slots || response.data;
    }
    throw new Error(response.message || 'Failed to fetch slots');
  },

  // Doctor: Update a slot
  async updateSlot(slotId, updates) {
    const response = await apiRequest(`/appointments/slots/${slotId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    if (response.success && response.data) {
      return response.data.slot;
    }
    throw new Error(response.message || 'Failed to update slot');
  },

  // Doctor: Delete a slot
  async deleteSlot(slotId) {
    const response = await apiRequest(`/appointments/slots/${slotId}`, {
      method: 'DELETE',
    });
    if (response.success) {
      return true;
    }
    throw new Error(response.message || 'Failed to delete slot');
  },

  // Public: Get available slots for a doctor
  async getDoctorSlots(doctorId) {
    const response = await apiRequest(`/appointments/slots/doctor/${doctorId}`);
    if (response.success && response.data) {
      return response.data.slots || response.data;
    }
    throw new Error(response.message || 'Failed to fetch doctor slots');
  },

  // Doctor: Delete all unbooked slots (Admin cleanup)
  async deleteAllSlots() {
    const response = await apiRequest('/appointments/slots/all', {
      method: 'DELETE',
    });
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to delete all slots');
  },
};

// Appointments API
export const appointmentsAPI = {
  // Patient: Book an appointment
  async bookAppointment(bookingData) {
    const response = await apiRequest('/appointments', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to book appointment');
  },

  // Patient: Get my appointments
  async getMyAppointments(status = 'all') {
    const query = status !== 'all' ? `?status=${status}` : '';
    const response = await apiRequest(`/appointments/patient/my${query}`);
    if (response.success && response.data) {
      return response.data.appointments || response.data;
    }
    throw new Error(response.message || 'Failed to fetch appointments');
  },

  // Patient: Cancel appointment
  async cancelAppointment(appointmentId, reason = '') {
    const response = await apiRequest(`/appointments/${appointmentId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'cancelled', cancellationReason: reason }),
    });
    if (response.success && response.data) {
      return response.data.appointment;
    }
    throw new Error(response.message || 'Failed to cancel appointment');
  },

  // Doctor: Get pending appointment requests
  async getPendingRequests() {
    const response = await apiRequest('/appointments/doctor/my?status=pending');
    if (response.success && response.data) {
      return response.data.appointments || response.data;
    }
    throw new Error(response.message || 'Failed to fetch pending requests');
  },

  // Doctor: Get my appointments
  async getDoctorAppointments(status = 'all') {
    const query = status !== 'all' ? `?status=${status}` : '';
    const response = await apiRequest(`/appointments/doctor/my${query}`);
    if (response.success && response.data) {
      return response.data.appointments || response.data;
    }
    throw new Error(response.message || 'Failed to fetch appointments');
  },

  // Doctor: Approve appointment (confirm)
  async approveAppointment(appointmentId) {
    const response = await apiRequest(`/appointments/${appointmentId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'confirmed' }),
    });
    if (response.success && response.data) {
      return response.data.appointment;
    }
    throw new Error(response.message || 'Failed to approve appointment');
  },

  // Doctor: Reject appointment
  async rejectAppointment(appointmentId, reason = '') {
    const response = await apiRequest(`/appointments/${appointmentId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'rejected', rejectionReason: reason }),
    });
    if (response.success && response.data) {
      return response.data.appointment;
    }
    throw new Error(response.message || 'Failed to reject appointment');
  },

  // Doctor: Complete appointment
  async completeAppointment(appointmentId, notes = '', diagnosis = '', treatmentPlan = '') {
    const response = await apiRequest(`/appointments/${appointmentId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ 
        status: 'completed', 
        notes, 
        diagnosis, 
        treatmentPlan 
      }),
    });
    if (response.success && response.data) {
      return response.data.appointment;
    }
    throw new Error(response.message || 'Failed to complete appointment');
  },

  // Reschedule appointment (available for both doctor and patient)
  async rescheduleAppointment(appointmentId, newSlotId, reason = '') {
    const response = await apiRequest(`/appointments/${appointmentId}/reschedule`, {
      method: 'PUT',
      body: JSON.stringify({ 
        newSlotId,
        reason
      }),
    });
    if (response.success && response.data) {
      return response.data.appointment;
    }
    throw new Error(response.message || 'Failed to reschedule appointment');
  },

  // Proposed reschedule (backend optional)
  async proposeReschedule(appointmentId, payload) {
    // payload: { proposedSlotId? , proposedDateTime?, reason? }
    const response = await apiRequest(`/appointments/${appointmentId}/reschedule/propose`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (response.success && response.data) return response.data;
    throw new Error(response.message || 'Failed to propose reschedule');
  },

  async decideReschedule(appointmentId, decision, reason = '') {
    // decision: 'approved' | 'rejected'
    const response = await apiRequest(`/appointments/${appointmentId}/reschedule/decision`, {
      method: 'PUT',
      body: JSON.stringify({ decision, reason }),
    });
    if (response.success && response.data) return response.data;
    throw new Error(response.message || 'Failed to decide reschedule');
  },

  // Doctor: Get patients who have appointments with current doctor
  async getDoctorPatients() {
    const response = await apiRequest('/appointments/doctor/patients');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to fetch doctor patients');
  },
};

// Reviews API additions
export const reviewsAPI = {
  async submitAppointmentReview(appointmentId, rating, feedback) {
    const response = await apiRequest(`/appointments/${appointmentId}/review`, {
      method: 'PUT',
      body: JSON.stringify({ rating, feedback }),
    });
    if (!response.success) throw new Error(response.message || 'Failed to submit review');
    return true;
  },
};

// Doctor-Patients API (doctor authorized access to patient profiles)
export const doctorPatientsAPI = {
  // Get a patient's profile by ID (doctor-only)
  async getPatientProfile(patientId) {
    const response = await apiRequest(`/patients/profile/by-id/${patientId}`);
    if (response.success && response.data) {
      return response.data.patient;
    }
    throw new Error(response.message || 'Failed to fetch patient profile');
  },

  // Update patient's health overview (doctor-only)
  async updateHealthOverview(patientId, healthData) {
    const response = await apiRequest(`/patients/profile/${patientId}/health-overview`, {
      method: 'PUT',
      body: JSON.stringify(healthData),
    });
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to update health overview');
  },

  // Add a medication to patient's current medications (doctor-only)
  async addMedication(patientId, medication) {
    const response = await apiRequest(`/patients/profile/${patientId}/medication`, {
      method: 'POST',
      body: JSON.stringify(medication),
    });
    if (response.success && response.data) {
      return response.data.medication;
    }
    throw new Error(response.message || 'Failed to add medication');
  },

  // Update an existing medication (doctor-only)
  async updateMedication(patientId, medicationId, updates) {
    const response = await apiRequest(`/patients/profile/${patientId}/medication/${medicationId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    if (response.success && response.data) {
      return response.data.medication;
    }
    throw new Error(response.message || 'Failed to update medication');
  },

  // Delete a medication (doctor-only)
  async deleteMedication(patientId, medicationId) {
    const response = await apiRequest(`/patients/profile/${patientId}/medication/${medicationId}`, {
      method: 'DELETE',
    });
    if (response.success) {
      return true;
    }
    throw new Error(response.message || 'Failed to delete medication');
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
