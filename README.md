# Healthcare Platform (WDL) — Full Project Documentation

This repository contains a full-stack healthcare platform for booking and managing medical appointments, handling rescheduling workflows, maintaining doctor and patient profiles, managing medications and health overviews, and more. It is structured as a monorepo with separate frontend (React + Vite) and backend (Node.js + Express + MongoDB) applications.

The project supports multiple roles:
- Doctor
- Patient
- Healthcare Facility (separate auth & profile)
- Care Provider (separate profile module)

Key modules include authentication, appointment booking and slot management, rescheduling (doctor ↔ patient), notifications (client refresh patterns), doctor reviews, medications management, and facility/care-provider support.


## Tech Stack

- Frontend: React, Vite, Tailwind UI components
- Backend: Node.js, Express
- Database: MongoDB (via Mongoose)
- Auth: JWT
- Image Uploads: Cloudinary (via backend/config/cloudinary.js)
- Tooling: Nodemon, PM2 (ecosystem.config.js), dotenv


## Repository Structure

- backend/
  - server.js (Express app init)
  - config/
    - database.js (connect & health check)
    - cloudinary.js
  - routes/
    - auth.js (login/register/profile)
    - doctors.js (public search, profile CRUD, stats, reviews)
    - patients.js (patient profile, doctor-access endpoints)
    - appointments.js (slots, booking, status updates, rescheduling, cleanup)
    - healthcareFacilities.js
    - careProviders.js
    - upload.js (profile picture & documents)
  - models/
    - User.js, Doctor.js, Patient.js, Appointment.js, Slot.js, HealthcareFacility.js, CareProvider.js
  - middleware/
    - auth.js (authenticate, authorize, role checks)
  - scripts/ (maintenance & testing utilities)
- frontend/
  - src/
    - pages/ (DoctorsPage, DoctorProfilePage, DoctorSelfProfilePage, PatientProfilePage, …)
    - components/ (appointment Modals & Slot Managers, UI components)
    - services/api.js (HTTP client & API wrappers)
    - services/notifications.js (client-side refresh events)


## Quick Start

Prerequisites:
- Node.js 18+
- MongoDB running locally or available via a connection string

1) Backend
- cd backend
- npm install
- Create backend/.env (see Environment Variables)
- npm run dev (or npm start)

2) Frontend
- cd frontend
- npm install
- Create frontend/.env (see Environment Variables)
- npm run dev

Default API base (development): http://localhost:5000/api


## Environment Variables

Backend (backend/.env):
- PORT=5000
- NODE_ENV=development
- MONGO_URI=mongodb://localhost:27017/your_db
- JWT_SECRET=your_jwt_secret
- JWT_EXPIRE=7d
- CLOUDINARY_CLOUD_NAME=...
- CLOUDINARY_API_KEY=...
- CLOUDINARY_API_SECRET=...
- ALLOWED_ORIGINS=http://localhost:5173 (for production CORS)

Frontend (frontend/.env):
- VITE_API_URL=http://localhost:5000/api


## Data Models (High-level)

- User
  - Core identity and login credential (email+password), userType (doctor|patient|facility)
- Doctor
  - userId (unique), medicalLicenseNumber (unique), licenseState/expiryDate
  - primarySpecialty (enum), secondarySpecialties[] (enum)
  - education[], residency[], certifications, languagesSpoken[], workingHours, consultationFee, telemedicine flags, ratings (averageRating, totalReviews)
- Patient
  - userId, emergency contacts, medical history, medications, vitalSigns
- Slot
  - doctorId, dateTime, duration, isAvailable/isBooked, patientId, appointmentId
  - consultationFee, consultationType
- Appointment
  - doctorId, patientId, slotId (optional for custom requests)
  - appointmentDate, duration, consultationFee, status (pending|confirmed|cancelled|completed|no-show|rescheduled|rejected)
  - pendingReschedule (proposal state), rescheduledFrom (history)
  - review fields (appointmentRating, patientFeedback)
- HealthcareFacility
  - Facility authentication and details; supports separate login
- CareProvider
  - Care provider profile (separate from Doctor)


## Authentication & Profiles

- Register: POST /api/auth/register
  - Creates a User and a corresponding profile (Doctor/Patient/Facility) based on userType
  - Doctors are created with a unique temporary medicalLicenseNumber (to avoid duplicates) and status pending
- Login: POST /api/auth/login
- Current user: GET /api/auth/me
- Update basic user profile: PUT /api/auth/update-profile
- Change password: PUT /api/auth/change-password

Doctor profile:
- GET /api/doctors/profile/me (doctor role)
- PUT /api/doctors/profile/me (doctor role)
  - Accepts sanitized fields only; invalid values are filtered server-side to prevent validation errors
  - consultationFee is doctor-managed and used as default for new slots
  - “Accepting new patients” field has been removed from UI and update paths

Patient profile:
- GET /api/patients/profile/me (patient role)
- PUT /api/patients/profile/me
- Doctor-authorized endpoints are provided for doctor access to patient health overview and medications (see Medications & Health Overview)


## Doctors Search & Public Profiles

- Public listing: GET /api/doctors
  - Supports specialty filtering and sorting
  - “Accepting new patients” filter is removed
- Public doctor by ID: GET /api/doctors/:id
- Doctor metadata: GET /api/doctors/meta (specialties, degrees, states)
- Reviews: GET /api/doctors/:id/reviews

Frontend
- DoctorsPage shows doctor name, specialty, rating, dynamic address (street, city, state, zip when available), and consultation fee
- DoctorProfilePage shows full details, bio, qualifications, languages, reviews, and a Book button


## Appointments & Slots — Core Flows

The system supports two booking flows and robust rescheduling.

Slots
- Create: POST /api/appointments/slots (doctor)
- Get my slots: GET /api/appointments/slots/my (doctor)
- Update: PUT /api/appointments/slots/:slotId (doctor)
- Delete: DELETE /api/appointments/slots/:slotId (doctor)
- Public available slots for a doctor: GET /api/appointments/slots/doctor/:doctorId

Booking
1) Book existing slot (Patient)
- POST /api/appointments with slotId and reasonForVisit
- Slot availability is validated (isAvailable && !isBooked)
- Appointment is created and auto-confirmed; slot is booked immediately

2) Custom request (Patient)
- POST /api/appointments with doctorId, requestedDateTime, reasonForVisit
- Creates a pending appointment (no slot yet), using doctor’s consultationFee by default
- Doctor can later confirm or reschedule

Status updates (Doctor or Patient)
- PUT /api/appointments/:appointmentId/status
  - Patient can cancel their own appointment
  - Doctor can confirm, reject, cancel, complete
  - When a doctor confirms a pending custom request without a slot, the system will now:
    - Ensure a slot exists at appointmentDate (create one if needed)
    - Book that slot and associate with the appointment
    - Then confirm the appointment

Rescheduling
- Patient direct reschedule (existing slot to another slot): PUT /api/appointments/:appointmentId/reschedule
  - Updates the existing booked slot to the new time (and deletes the temporary slot used for selection)
  - Appointment is auto-confirmed after rescheduling for better UX
- Propose reschedule (Doctor or Patient): POST /api/appointments/:appointmentId/reschedule/propose
  - Provide proposedSlotId OR proposedDateTime
  - If a doctor proposes only a date/time, the system now auto-creates an available slot at that time and stores its ID in pendingReschedule
  - Prevents “no appointment found” acceptance issues
- Approve/Reject reschedule: PUT /api/appointments/:appointmentId/reschedule/decision
  - Counterparty approves or rejects proposal
  - Approval updates the slot timing and the appointment; rejects leaves original as-is

Cleanup utilities
- POST /api/appointments/cleanup/reschedule-duplicates (admin/dev)
- Scripts in backend/scripts/ (e.g., testReschedulingAPI.js, cleanupRescheduledAppointments.js)


## Notifications

- Client-side refresh patterns are triggered through frontend/src/services/notifications.js (emitNotificationsRefresh)
- After key events (reschedule proposal, acceptance), the UI prompts a refresh to fetch updated data
- There is no dedicated server-push channel in this repository; add WebSockets or push services if required


## Reviews

- Patients can review completed appointments
  - PUT /api/appointments/:appointmentId/review (patient)
  - Recomputes doctor’s averageRating and totalReviews via aggregation


## Medications & Health Overview (Doctor ↔ Patient)

Doctor-authorized access:
- GET /api/patients/profile/by-id/:patientId  (via doctorPatientsAPI on frontend)
- PUT /api/patients/profile/:patientId/health-overview (doctor updates health overview)
- POST /api/patients/profile/:patientId/medication (doctor adds a medication)
- PUT /api/patients/profile/:patientId/medication/:medicationId (doctor updates a medication)
- DELETE /api/patients/profile/:patientId/medication/:medicationId (doctor deletes a medication)

Patient self-profile:
- See patient profile page for editing contact info and viewing medical data


## Facilities & Care Providers

- Healthcare Facility: separate registration/login, profile, and operating hours
- Care Provider: separate professional module with profile details (experience, availability, hourly rate)
- Care Provider UI uses “Accepting New Clients” statuses (distinct from doctor module); remove it if not desired


## Security & Access Control

- JWT-based authentication (Authorization: Bearer <token>)
- middleware/auth.js: authenticate + role-based authorize('doctor'|'patient'|'facility')
- Rate limiting is applied globally on /api/ (lenient in development)
- CORS configured with safe defaults; production restricts origins via env


## Frontend Pages (selected)

- DoctorsPage: search/listing of doctors (dynamic address, rating, fee)
- DoctorProfilePage: public doctor details
- DoctorSelfProfilePage: doctor’s own profile editing, slots, appointments
- PatientProfilePage: patient’s profile, health overview, appointments
- DoctorAppointmentsPage / PatientAppointmentsPage: role-based appointment management
- FindCarePage: browse by specialties, search & filters


## API Summary (selected)

Auth
- POST /api/auth/register
- POST /api/auth/login
- GET  /api/auth/me
- PUT  /api/auth/change-password
- PUT  /api/auth/update-profile

Doctors
- GET  /api/doctors
- GET  /api/doctors/meta
- GET  /api/doctors/:id
- GET  /api/doctors/profile/me (doctor)
- PUT  /api/doctors/profile/me (doctor)
- GET  /api/doctors/:id/reviews

Slots & Appointments
- GET  /api/appointments/slots/doctor/:doctorId (public available slots)
- GET  /api/appointments/slots/my (doctor)
- POST /api/appointments/slots (doctor)
- PUT  /api/appointments/slots/:slotId (doctor)
- DELETE /api/appointments/slots/:slotId (doctor)

- POST /api/appointments (patient) — book slot or custom request
- GET  /api/appointments/doctor/my (doctor)
- GET  /api/appointments/patient/my (patient)
- PUT  /api/appointments/:appointmentId/status
- PUT  /api/appointments/:appointmentId/reschedule (patient direct)
- POST /api/appointments/:appointmentId/reschedule/propose (doctor/patient)
- PUT  /api/appointments/:appointmentId/reschedule/decision (doctor/patient)
- PUT  /api/appointments/:appointmentId/review (patient)
- POST /api/appointments/cleanup/reschedule-duplicates (admin/dev)

Patients
- GET  /api/patients/profile/me (patient)
- PUT  /api/patients/profile/me (patient)
- Doctor-only patient management endpoints (see above)

Facilities
- See routes/healthcareFacilities.js

Uploads
- POST /api/upload/profile-picture (multipart FormData)
- POST /api/upload/document (document uploads)
- DELETE /api/upload/delete/:publicId


## Business Rules & Recent Changes

- Consultation Fee is doctor-managed (editable in doctor profile); used when creating slots or booking custom requests
- “Accepting New Patients” has been removed from the entire doctor UX and backend filtering; if present in old data, it’s ignored in UI
- Rescheduling is robust:
  - Doctor proposing a new date without a slot now auto-creates a temporary slot (prevents acceptance failures)
  - Patient direct reschedules update the existing booked slot to the chosen time
  - Doctor confirming pending custom requests auto-creates/uses a slot and books it
- Validation hardening: doctor profile updates are sanitized server-side to avoid enum/format errors
- Temporary unique license numbers are used at registration to avoid duplicate key collisions; doctors must update their real license in profile


## Development & Scripts

Common scripts (backend/scripts):
- testReschedulingAPI.js, testCorrectRescheduleWorkflow.js — reschedule tests
- cleanupRescheduledAppointments.js, deleteOldRescheduledAppointments.js — maintenance
- seed & sample data utilities (createSampleData.js, generateData.js)

Run any script with:
- node backend/scripts/<script-name>.js


## Troubleshooting

- Validation error when saving doctor profile
  - Ensure primarySpecialty is a valid enum (the backend now coerces invalid values to "Other")
  - The server sanitizes languagesSpoken, yearsOfExperience, consultationFee, licenseExpiryDate; if you still see errors, check server logs for specific field messages

- medicalLicenseNumber already exists during registration
  - Fixed: registration now assigns a unique temporary license (TEMP-...) to avoid collisions

- Reschedule acceptance returns “Appointment not found”
  - Fixed: proposals without a slot auto-create one and store proposedSlotId; approvals use it to update the booked slot

- Confirming a custom request fails
  - Fixed: confirmation now ensures a slot exists and books it before confirming


## Deployment

- Backend can be run with PM2 using ecosystem.config.js
- Set production env variables (ALLOWED_ORIGINS, JWT_SECRET, MONGO_URI, CLOUDINARY_*)
- Serve frontend build statically in production (backend/server.js includes SPA fallback)


## License

This project is provided as-is, for educational and internal purposes. Add your preferred license file if required.
