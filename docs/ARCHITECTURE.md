# WDL Healthcare Platform — Architecture and System Overview

This document explains the major components of the project, how they fit together, and where to find things in the codebase.

## High-level Architecture

- Frontend: React (Vite), located in `frontend/`
- Backend: Node.js + Express + MongoDB (Mongoose), located in `backend/`
- Auth: JWT-based
- File uploads: Cloudinary
- Notifications:
  - Client-side refresh events (`frontend/src/services/notifications.js`)
  - Email via SMTP (SendGrid) in `backend/services/email.js`

## Backend structure (key folders)

- `backend/server.js` — Express app setup, middleware, routes, SPA fallback, error handling
- `backend/config/` — `database.js` connection & health checks
- `backend/middleware/` — `auth.js` authenticate + authorize helpers
- `backend/models/` — Mongoose schemas and model methods
  - `User.js` (users), `Doctor.js`, `Patient.js`, `Appointment.js`, `Slot.js`, others
- `backend/routes/` — HTTP APIs (auth, doctors, patients, appointments, …)
- `backend/services/email.js` — SMTP (SendGrid) email templates and send helpers
- `backend/scripts/` — maintenance and dev scripts

## Frontend structure (selected)

- `frontend/src/pages/` — Screens (doctors, profiles, appointments, etc.)
- `frontend/src/components/` — UI components, modals, slot manager
- `frontend/src/services/api.js` — API client and endpoint wrappers
- `frontend/src/services/notifications.js` — client-side refresh signals
- `frontend/src/contexts/AuthContext.jsx` — auth state

## Data model highlights

- User
  - `email`, `password` (hashed), `userType: 'doctor'|'patient'|'facility'`, profile basics
- Doctor
  - `userId` ref, professional data, `consultationFee`, ratings, etc.
- Patient
  - `userId` ref, demographics, health data, preferences
- Slot
  - `doctorId`, `dateTime`, `duration`, `isAvailable`, `isBooked`, booking refs
  - Methods: `canBeBooked()`, `book()`, `cancelBooking()`
- Appointment
  - Links doctor/patient/slot, dates, status, reschedule state, review fields
  - Methods: `confirm()`, `cancel()`, `complete()`, `reschedule()`

## Middleware & Security

- `authenticate` parses JWT from `Authorization: Bearer <token>` and attaches `req.user`
- `authorize(...roles)` guards role-specific routes
- Helmet, CORS, rate limiting configured in `server.js`

## Email service (SMTP via SendGrid)

- `backend/services/email.js` initializes Nodemailer from env (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`)
- Templated, branded HTML emails for request, confirmation, status, reschedule flows

## Environment variables (backend)

- Required: `MONGODB_URI`, `JWT_SECRET`, `SMTP_HOST=smtp.sendgrid.net`, `SMTP_USER=apikey`, `SMTP_PASS=<SendGridKey>`, `EMAIL_FROM=<verified or domain-authenticated email>`
- Optional: `CLIENT_URL` for CTA links, `APP_NAME`

