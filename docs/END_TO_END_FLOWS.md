# End‑to‑End Flows — Frontend ⇆ Backend ⇆ Database

This guide explains, step‑by‑step, how requests travel from the UI to the server, how data is validated and saved in MongoDB (via Mongoose), and how responses/side‑effects (emails, cache refresh) are triggered. Paths reference real files.

Conventions
- FE = Frontend (React/Vite) files under `frontend/src`
- BE = Backend (Express) files under `backend/`
- DB = MongoDB via Mongoose models under `backend/models`
- Headers: JSON requests use `Authorization: Bearer <token>` + `Content-Type: application/json`

1) Authentication
1.1 Register
- FE: `services/api.ts` → `authAPI.register(payload)` POST `/api/auth/register`
- BE: `routes/auth.js::POST /register`
  - Validates required fields; `User.create()`; also creates type profile:
    - Doctor: `Doctor.create({...})` with temporary license
    - Patient: `Patient.create({ userId })`
    - Facility: `HealthcareFacility.create(...)`
  - Returns `{ user, profile, token }`
- DB: Inserts into `users`, `doctors|patients|healthcarefacilities`
- FE: stores JWT + user in localStorage

1.2 Login
- FE: `authAPI.login({ email, password })` → POST `/api/auth/login`
- BE: `routes/auth.js::POST /login`
  - Finds `User` by email (`select('+password')`), compares password, rate limits, facility fallback
  - On success: updates `lastLogin`, returns `{ token, user, profile? }`
- FE: stores JWT + user; AuthContext hydrates app

1.3 Get current user
- FE: `authAPI.getCurrentUser()` → GET `/api/auth/me`
- BE: `routes/auth.js::GET /me` uses `authenticate` to attach `req.user`, loads role profile
- DB: `Doctor|Patient|Facility.findOne({ userId })`
- FE: merges into UI state

1.4 Update basic user profile (names/phone/address/bio)
- FE: `authAPI.updateProfile(updates)` → PUT `/api/auth/update-profile`
- BE: `routes/auth.js::PUT /update-profile` — whitelist fields; `User.findByIdAndUpdate`
- DB: updates `users`
- FE: refreshes user in localStorage & UI

1.5 Change email (doctor path)
- FE: `doctorAPI.updateProfile({ email })` → PUT `/api/doctors/profile/me`
- BE: `routes/doctors.js::PUT /profile/me`
  - Updates doctor fields; if `email` present, validates, ensures uniqueness across `User` & `HealthcareFacility`, then `User.findByIdAndUpdate({ email, isEmailVerified:false })`
- DB: updates `users.email`
- FE: show updated email after `doctorAPI.getProfile()` or `authAPI.getCurrentUser()`

1.6 Change password
- FE: `authAPI.changePassword(currentPassword,newPassword)` → PUT `/api/auth/change-password`
- BE: verifies current password via `user.comparePassword()` then saves new hash

2) Doctors — Profile CRUD
- FE: `doctorAPI.getProfile()` → GET `/api/doctors/profile/me`
- BE: loads `Doctor.findOne({ userId })` + `populate('userId')`
- FE: form edits call `doctorAPI.updateProfile(payload)` → PUT `/api/doctors/profile/me`
- BE: sanitizes fields (specialties, languages, fee, years), `findOneAndUpdate` and return
- DB: updates `doctors`

3) Patients — Profile CRUD
- FE: `patientAPI.getProfile()` / `patientAPI.updateProfile(payload)`
- BE: `routes/patients.js::GET/PUT /profile/me` with normalization for complex objects
- DB: updates `patients`

4) Slots (Doctor)
4.1 List my slots
- FE: GET `/api/appointments/slots/my`
- BE: finds `Doctor` by `userId`, builds query with filters/pagination, returns `Slot[]`
- DB: `Slot.find({ doctorId })`

4.2 Create slot
- FE: POST `/api/appointments/slots` with `{ dateTime, duration, ... }`
- BE: `routes/appointments.js::POST /slots`
  - Validates: future datetime, no exact‑time conflict (`Slot.findOne({ doctorId, dateTime, status:'active' })`), then `new Slot(...).save()`
  - NOTE: If you need overlap prevention, extend check to any slot overlapping `[start, start+duration)`
- DB: inserts into `slots`

4.3 Update slot
- FE: PUT `/api/appointments/slots/:slotId`
- BE: disallows if booked; checks for conflicts when datetime changes, then `slot.save()`

4.4 Delete slot
- FE: DELETE `/api/appointments/slots/:slotId`
- BE: disallows if booked; `Slot.findByIdAndDelete`

5) Appointments — Booking and Lists
5.1 Book existing slot
- FE (patient): POST `/api/appointments` with `slotId`, `reasonForVisit`
- BE: loads slot + patient; `slot.canBeBooked()`, creates `Appointment(status:'pending')`; `slot.book(patientId, appointmentId)`; `appointment.confirm()`
- Emails: `notifyAppointmentConfirmed`
- DB: writes `appointments`, sets `slots.isBooked=true`

5.2 Custom request (no slot yet)
- FE: POST `/api/appointments` with `doctorId`, `requestedDateTime`, `reasonForVisit`
- BE: creates pending appointment (`isCustomRequest:true`)
- Emails: `notifyAppointmentRequested`

5.3 Doctor list / Patient list
- FE: GET `/api/appointments/doctor/my` or `/patient/my`
- BE: queries `Appointment` with filters and populates, returns paginated lists

5.4 Update status (doctor/patient)
- FE: PUT `/api/appointments/:id/status` with `{ status, ... }`
- BE: handles per role
  - Doctor `confirmed`: ensure slot exists at `appointmentDate` (create if needed), book, then `confirm()`; email confirmed
  - `cancelled`/`rejected`: update appointment; free slot; email status
  - `completed`: set clinical notes; email status

6) Rescheduling
6.1 Patient direct reschedule
- FE: PUT `/api/appointments/:id/reschedule` with `{ newSlotId }`
- BE: validates ownership + availability; updates the EXISTING booked slot to new time (keeps slotId), deletes temp slot; appointment set to `confirmed`; write history; cleanup duplicates
- Emails: `notifyAppointmentStatus(...,'rescheduled')`

6.2 Propose reschedule
- FE: POST `/api/appointments/:id/reschedule/propose` with `{ proposedSlotId | proposedDateTime }`
- BE: if doctor sends datetime only, auto‑creates an available Slot at that time; writes `pendingReschedule`
- Emails: `notifyRescheduleProposed`

6.3 Decision (approve/reject) by counterparty
- FE: PUT `/api/appointments/:id/reschedule/decision` with `{ decision, reason? }`
- BE: Approve → update current slot time + appointment, clear pending, add history; Reject → clear pending with reason
- Emails: `notifyRescheduleDecision`

7) Reviews
- FE: PUT `/api/appointments/:id/review` with `{ rating, feedback }`
- BE: validates completed appointment; updates rating on appointment; aggregates to update `Doctor.averageRating/totalReviews`

8) Uploads (Profile Pictures/Documents)
- FE: multipart upload to `/api/upload/profile-picture` or `/api/upload/document`
- BE: `routes/upload.js` uses Multer + Cloudinary; saves Cloudinary IDs/URLs on User/Facility as needed
- DB: updates `users` or related model with URLs/IDs

9) Notifications (UI + Email)
- UI: After critical actions, FE triggers `emitNotificationsRefresh()` so pages re‑query data
- Email: `services/email.js` Nodemailer SMTP using env config; sends templated HTML for: new request, confirmed, cancelled/rejected/completed, reschedule proposed/approved/rejected

10) Facilities & Care Providers (overview)
- Facilities: separate model + login branch inside `auth.js/login` and registration path in `auth.js/register`
- Care Providers: CRUD in `routes/careProviders.js`, similar patterns to doctors/patients

11) Error handling & Security
- Global error handler in `server.js`
- CORS (dev allows all; prod uses `ALLOWED_ORIGINS`), Helmet, rate limiter on `/api/`
- Authentication middleware (`middleware/auth.js`) required on private routes

12) Where to add features
- New endpoints: add route handler in `backend/routes/...`, use models, export router
- Side effects (emails): call functions from `backend/services/email.js`
- Frontend: add wrapper in `frontend/src/services/api.js` and call from pages/components

