#!/usr/bin/env node

const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5000/api';

// Test users and credentials
const TEST_DOCTOR = {
  email: 'test.doctor@example.com',
  password: 'Test123!',
  firstName: 'Test',
  lastName: 'Doctor',
  userType: 'doctor',
  phone: '1234567890',
  dateOfBirth: '1990-01-01'
};

const TEST_PATIENT = {
  email: 'test.patient@example.com',
  password: 'Test123!',
  firstName: 'Test',
  lastName: 'Patient',
  userType: 'patient',
  phone: '1234567891',
  dateOfBirth: '1995-01-01'
};

let doctorToken, patientToken, doctorId, slotId, appointmentId;

// Helper function to make API requests
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`${response.status}: ${data.message || 'Request failed'}`);
    }
    
    return data;
  } catch (error) {
    console.error(`❌ API Error for ${endpoint}:`, error.message);
    throw error;
  }
}

// Test functions
async function testHealthEndpoint() {
  console.log('🏥 Testing health endpoint...');
  const response = await apiRequest('/health');
  console.log('✅ Health check passed:', response.message);
}

async function registerTestUsers() {
  console.log('\n👥 Registering test users...');
  
  try {
    // Register doctor
    const doctorResponse = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(TEST_DOCTOR),
    });
    doctorToken = doctorResponse.data.token;
    doctorId = doctorResponse.data.user._id;
    console.log('✅ Doctor registered successfully');
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Doctor already exists, attempting login...');
      const loginResponse = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: TEST_DOCTOR.email,
          password: TEST_DOCTOR.password,
        }),
      });
      doctorToken = loginResponse.data.token;
      doctorId = loginResponse.data.user._id;
      console.log('✅ Doctor login successful');
    } else {
      throw error;
    }
  }

  try {
    // Register patient
    const patientResponse = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(TEST_PATIENT),
    });
    patientToken = patientResponse.data.token;
    console.log('✅ Patient registered successfully');
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Patient already exists, attempting login...');
      const loginResponse = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: TEST_PATIENT.email,
          password: TEST_PATIENT.password,
        }),
      });
      patientToken = loginResponse.data.token;
      console.log('✅ Patient login successful');
    } else {
      throw error;
    }
  }
}

async function createTestSlot() {
  console.log('\n📅 Creating test appointment slot...');
  
  // Create a slot for tomorrow at 10:00 AM
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const slotDate = tomorrow.toISOString().split('T')[0];
  
  const slotData = {
    dateTime: new Date(`${slotDate}T10:00:00`),
    endTime: '10:30',
    type: 'consultation',
    isAvailable: true,
    isBooked: false
  };

  const response = await apiRequest('/appointments/slots', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${doctorToken}`
    },
    body: JSON.stringify(slotData),
  });

  slotId = response.data.slot._id;
  console.log('✅ Test slot created:', slotId);
}

async function bookAppointment() {
  console.log('\n📝 Booking appointment as patient...');
  
  const bookingData = {
    slotId: slotId,
    reasonForVisit: 'Test appointment for system verification',
    symptoms: 'Testing symptoms field',
    relevantMedicalHistory: '',
    currentMedications: [],
    allergies: [],
    contactPreferences: {}
  };

  const response = await apiRequest('/appointments', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${patientToken}`
    },
    body: JSON.stringify(bookingData),
  });

  appointmentId = response.data.appointment._id;
  console.log('✅ Appointment booked successfully:', appointmentId);
  console.log('📋 Appointment Status:', response.data.appointment.status);
}

async function checkPendingAppointments() {
  console.log('\n🔍 Checking doctor\'s pending appointments...');
  
  const response = await apiRequest('/appointments/doctor/my?status=pending', {
    headers: {
      Authorization: `Bearer ${doctorToken}`
    }
  });

  const pendingAppointments = response.data.appointments;
  console.log(`✅ Found ${pendingAppointments.length} pending appointment(s)`);
  
  if (pendingAppointments.length > 0) {
    const appointment = pendingAppointments[0];
    console.log('📋 Appointment details:');
    console.log(`   - ID: ${appointment._id}`);
    console.log(`   - Status: ${appointment.status}`);
    console.log(`   - Reason: ${appointment.reasonForVisit}`);
  }
}

async function approveAppointment() {
  console.log('\n✅ Approving appointment as doctor...');
  
  const response = await apiRequest(`/appointments/${appointmentId}/status`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${doctorToken}`
    },
    body: JSON.stringify({
      status: 'confirmed'
    }),
  });

  console.log('✅ Appointment approved successfully');
  console.log('📋 New Status:', response.data.appointment.status);
}

async function checkPatientAppointments() {
  console.log('\n🔍 Checking patient\'s appointments...');
  
  const response = await apiRequest('/appointments/patient/my', {
    headers: {
      Authorization: `Bearer ${patientToken}`
    }
  });

  const appointments = response.data.appointments;
  console.log(`✅ Found ${appointments.length} appointment(s) for patient`);
  
  if (appointments.length > 0) {
    const appointment = appointments[0];
    console.log('📋 Appointment details:');
    console.log(`   - ID: ${appointment._id}`);
    console.log(`   - Status: ${appointment.status}`);
    console.log(`   - Date: ${new Date(appointment.appointmentDate).toLocaleDateString()}`);
  }
}

async function testRejectionFlow() {
  console.log('\n❌ Testing appointment rejection...');
  
  // First create another slot and appointment for rejection test
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 2);
  const slotDate = tomorrow.toISOString().split('T')[0];
  
  // Create slot
  const slotResponse = await apiRequest('/appointments/slots', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${doctorToken}`
    },
    body: JSON.stringify({
      dateTime: new Date(`${slotDate}T14:00:00`),
      endTime: '14:30',
      type: 'consultation'
    }),
  });
  
  const rejectionSlotId = slotResponse.data.slot._id;
  console.log('📅 Created slot for rejection test:', rejectionSlotId);
  
  // Book appointment
  const appointmentResponse = await apiRequest('/appointments', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${patientToken}`
    },
    body: JSON.stringify({
      slotId: rejectionSlotId,
      reasonForVisit: 'Test appointment for rejection',
      symptoms: '',
      relevantMedicalHistory: '',
      currentMedications: [],
      allergies: [],
      contactPreferences: {}
    }),
  });
  
  const rejectionAppointmentId = appointmentResponse.data.appointment._id;
  console.log('📝 Booked appointment for rejection:', rejectionAppointmentId);
  
  // Reject appointment
  await apiRequest(`/appointments/${rejectionAppointmentId}/status`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${doctorToken}`
    },
    body: JSON.stringify({
      status: 'rejected',
      cancellationReason: 'Test rejection - slot no longer available'
    }),
  });
  
  console.log('✅ Appointment rejected successfully');
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Appointment Booking & Approval Flow Tests\n');
  
  try {
    await testHealthEndpoint();
    await registerTestUsers();
    await createTestSlot();
    await bookAppointment();
    await checkPendingAppointments();
    await approveAppointment();
    await checkPatientAppointments();
    await testRejectionFlow();
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('✅ Doctor registration/login');
    console.log('✅ Patient registration/login');
    console.log('✅ Slot creation');
    console.log('✅ Appointment booking');
    console.log('✅ Pending appointment retrieval');
    console.log('✅ Appointment approval');
    console.log('✅ Patient appointment status check');
    console.log('✅ Appointment rejection');
    
  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  runTests,
  testHealthEndpoint,
  registerTestUsers,
  createTestSlot,
  bookAppointment,
  checkPendingAppointments,
  approveAppointment,
  checkPatientAppointments,
  testRejectionFlow
};