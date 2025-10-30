# API and Model Reference — Key Functions

This reference lists the most important functions, methods, and endpoints, with file paths.

## Models (Mongoose)

- Appointment (`backend/models/Appointment.js`)
  - Methods:
    - `confirm()` → sets `status='confirmed'`, `patientConfirmed=true`, timestamps
    - `cancel(cancelledBy, reason, fee=0)` → sets `status='cancelled'`, records reason/by/fee
    - `complete(doctorNotes, diagnosis, treatmentPlan)` → sets `status='completed'`, saves clinical notes
    - `reschedule(newSlotId, newDate, by, reason)` → updates `slotId` + `appointmentDate`, writes `rescheduledFrom`
  - Statics:
    - `findForDoctorInRange(doctorId, start, end)` → includes patient & slot, sorted by time
    - `findForPatient(patientId, limit)` → recent first, includes doctor & slot
    - `findUpcomingForReminders(hoursAhead)` → window for reminder jobs

- Slot (`backend/models/Slot.js`)
  - Methods:
    - `canBeBooked()` → availability + future + active
    - `book(patientId, appointmentId)` → marks booked and links
    - `cancelBooking(cancelledBy, reason)` → clears booking and reopens
  - Statics:
    - `findAvailableForDoctor(doctorId, from, to)`
    - `findByDoctorAndDateRange(doctorId, start, end)`

- User (`backend/models/User.js`)
  - Methods: `comparePassword()`, `isLocked()`, `incLoginAttempts()`, `resetLoginAttempts()`
  - Statics: `findByEmail(email)`

## Middleware (`backend/middleware/auth.js`)

- `authenticate` — verifies JWT, attaches `req.user`
- `authorize(...roles)` — role guard
- Helpers for token generation used in auth routes

## Routes — Key Endpoints

- Auth (`backend/routes/auth.js`)
  - POST `/api/auth/register` — register user + profile
  - POST `/api/auth/login` — login (includes facility fallback)
  - GET `/api/auth/me` — current user + profile
  - PUT `/api/auth/update-profile` — basic user fields (no email)
  - PUT `/api/auth/change-password`

- Doctors (`backend/routes/doctors.js`)
  - GET `/api/doctors` — public search
  - GET `/api/doctors/:id` — public profile
  - GET `/api/doctors/profile/me` — my profile (doctor)
  - PUT `/api/doctors/profile/me` — update doctor details; also supports updating linked `User.email` via `email` field

- Patients (`backend/routes/patients.js`)
  - GET/PUT `/api/patients/profile/me`
  - CRUD helpers for emergency contacts, medical history, medications, allergies

- Appointments & Slots (`backend/routes/appointments.js`)
  - Slots — GET my, POST create, PUT update, DELETE delete; GET public `doctor/:doctorId`
  - Appointments — POST create (slot booking vs custom request), GET lists (doctor/patient), PUT `:appointmentId/status`
  - Rescheduling — PUT direct `:appointmentId/reschedule`; POST propose; PUT decision
  - Reviews — PUT `:appointmentId/review`
  - Cleanup — POST `/cleanup/reschedule-duplicates`

## Email Service (`backend/services/email.js`)

- SMTP setup via Nodemailer from env
- Helpers (send branded HTML):
  - `notifyAppointmentRequested(appointment)` — to doctor
  - `notifyAppointmentConfirmed(appointment)` — to patient + doctor
  - `notifyAppointmentStatus(appointment, status, meta)` — to both
  - `notifyRescheduleProposed(appointment, proposedDateTime, proposedBy)` — to counterparty
  - `notifyRescheduleDecision(appointment, decision, reason)` — to both

## Frontend API (`frontend/src/services/api.js`)

- `authAPI` — login/register/me/logout/updateProfile/changePassword
- `doctorAPI` — list/get/update, profile helpers
- `patientAPI` — get/update profile
- `careProviderAPI` — get/update profile
- Shared request wrapper `apiRequest()` handles token, errors

## Frontend Pages (selected)

- `DoctorSelfProfilePage.jsx` — doctor’s own dashboard, profile editor, slot/appointment helpers
- `DoctorAppointmentsPage.jsx` — manage appointments
- `PatientAppointmentsPage.jsx` — patient appointments view

