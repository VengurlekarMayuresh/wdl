## Project Overview

This document is an end-to-end, interview-ready summary of the WDL Healthcare Platform repository. It explains the architecture, how to set up and run the project locally (Windows `cmd`), key modules and endpoints, common workflows, debugging tips, and suggested interview talking points with sample answers.

**Repository Root**: `.`
- **Backend**: `backend/` (Node.js + Express + MongoDB)
- **Frontend**: `frontend/` (React + Vite + Tailwind)
- **Docs**: `docs/`

**Quick elevator pitch**: Full-stack healthcare management platform to register doctors/patients/facilities, manage doctor profiles and slots, book and reschedule appointments, upload documents, and support facility/care-provider workflows. Backend is a modular Express API, frontend is a React SPA built with Vite.

**Tech Stack**
- **Backend**: Node.js (ES Modules), Express, Mongoose (MongoDB), JWT auth, Cloudinary for uploads
- **Frontend**: React + Vite, Tailwind CSS, react-router
- **Tooling**: Nodemon (dev), PM2 (production), dotenv, SendGrid/SMTP (email)

**Architecture (high-level)**
- Client (React SPA) ↔ HTTP API (`/api/*`) ↔ Express routes → controllers/business logic → Mongoose models → MongoDB
- File uploads are proxied through backend to Cloudinary
- JWT tokens for auth; role-based middleware enforces doctor/patient/facility permissions
- Background scripts and utilities live under `backend/scripts/`

**Key Files to Know**
- `backend/server.js` — app bootstrap, security middleware, route registration, health check
- `backend/package.json` — backend scripts and dependencies
- `frontend/package.json` — frontend scripts and dependencies
- `backend/config/database.js` — DB connection and health check
- `backend/config/cloudinary.js` — upload helper
- `backend/routes/` — API route entry points (auth, doctors, patients, appointments, upload, healthcareFacilities, careProviders)
- `backend/models/` — Mongoose schemas: `User`, `Doctor`, `Patient`, `Appointment`, `Slot`, `HealthcareFacility`, `CareProvider`

**Setup — prerequisites**
- Node.js 18+ installed
- MongoDB running locally or accessible via connection string
- (Optional) Cloudinary account for uploads, SendGrid or SMTP for emails

**Backend — run locally (Windows `cmd`)**
1. Open a `cmd` shell and change to backend:

```cmd
cd backend
npm install
```

2. Create `backend/.env` with the environment variables (see next section).

3. Start in development:

```cmd
npm run dev
```

4. Or start production (Windows `cmd` inline env style in `package.json`):

```cmd
npm run serve:prod
```

**Frontend — run locally**
1. From repo root:

```cmd
cd frontend
npm install
```

2. Create `frontend/.env` (see env list) and run:

```cmd
npm run dev
```

Default dev URLs: frontend `http://localhost:5173` (Vite), backend API `http://localhost:5000/api`

**Important Environment Variables**
- Backend (`backend/.env`):
  - `PORT` (default 5000)
  - `NODE_ENV` (development|production)
  - `MONGO_URI` (MongoDB connection string)
  - `JWT_SECRET`, `JWT_EXPIRE`
  - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
  - `ALLOWED_ORIGINS` or `CLIENT_URL` (comma-separated for CORS in prod)
  - `MAX_REQUESTS_PER_WINDOW`, `WINDOW_TIME_MINUTES` (rate-limiter tuning)
- Frontend (`frontend/.env`):
  - `VITE_API_URL` (e.g. `http://localhost:5000/api`)

**How the server starts**
- `backend/server.js` loads env, connects to MongoDB via `connectDatabase()` (see `backend/config/database.js`), creates indexes, attaches middleware (helmet, cors, compression, morgan, rate-limit), registers routes under `/api/*`, provides a health endpoint and SPA fallback in production, and starts listening on `PORT`.

**Database & Models (conceptual)**
- `User`: primary identity record (email + password + userType)
- `Doctor`: profile with specialties, license, fees, availability
- `Patient`: medical info, emergency contacts, meds
- `Slot`: doctor availability unit (datetime, duration, isAvailable)
- `Appointment`: link to slot or custom booking, status, reschedule metadata

**Main Routes & Endpoints (selected)**
- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `PUT /api/auth/update-profile`
- Doctors: `GET /api/doctors`, `GET /api/doctors/:id`, `GET /api/doctors/meta`, `GET/PUT /api/doctors/profile/me`
- Patients: `GET/PUT /api/patients/profile/me`, doctor-authorized patient endpoints
- Appointments & Slots: `POST /api/appointments` (book), `GET /api/appointments/doctor/my`, `GET /api/appointments/patient/my`, `POST /api/appointments/:appointmentId/reschedule/propose`, `PUT /api/appointments/:appointmentId/reschedule` (direct), `PUT /api/appointments/:appointmentId/status` (status changes)
- Uploads: `POST /api/upload/profile-picture` (multipart), `POST /api/upload/document`

**Core Workflows (explainable in interviews)**
- Registration: create `User` + role-specific document (Doctor/Patient/Facility). Doctors receive a temporary unique license id to avoid duplicate insert conflicts at create time.
- Booking a slot: patient requests `POST /api/appointments` with `slotId` → server verifies `slot.isAvailable` → creates `Appointment` and marks slot as booked.
- Custom request booking: `POST /api/appointments` with `doctorId` and requested time → appointment created in pending state → doctor confirms → backend ensures slot exists (create if needed), books it, then confirms appointment.
- Rescheduling: two patterns — direct (patient chooses a new slot, server updates existing slot association) and propose/approve (doctor or patient proposes; approval moves appointment to the proposed slot). Recent fixes include auto-creation of proposed slots when doctor proposes a date/time without an existing slot.

**Background Scripts & Maintenance**
- See `backend/scripts/` for seeding, test workflows, and cleanup utilities such as `cleanupRescheduledAppointments.js`, `testReschedulingAPI.js`, `rebuild-all-accounts.*`, `seedCareProviders.js`.
- Run individual scripts via `node backend/scripts/<script>.js` from repo root.

**Deployment Notes**
- Production uses `backend/server.js` with `NODE_ENV=production`. Static `frontend/dist` is served when present.
- PM2 is supported via `ecosystem.config.js` in `backend/`.
- Ensure `ALLOWED_ORIGINS`, `MONGO_URI`, `JWT_SECRET`, and Cloudinary credentials are set in prod.

**Testing & Debugging**
- Logs: `morgan` is setup in dev (`dev` format) and `combined` in production. Check console where server runs.
- Health check: `GET /api/health` to verify DB connectivity and basic status.
- Common issues:
  - _Validation errors on doctor profile_: check enum fields (specialty, state) and make sure UI sends expected values — server sanitizes invalid values but logs validation errors.
  - _Duplicate key errors during registration_: temporary license assignment mitigates this. If still failing, inspect `users` and `doctor` unique indexes.
  - _Reschedule acceptance fails with not-found_: recent fix creates a proposed slot when none provided; ensure your branch includes the fix or run the migration script if needed.

**Useful developer commands (Windows `cmd`)**
```cmd
:: From repo root - start backend dev
cd backend
npm run dev

:: From repo root - build frontend and serve with backend (production)
cd backend
npm run serve:prod

:: Run a maintenance script
node backend/scripts/testReschedulingAPI.js
```

**Interview Preparation — Suggested Talking Points & Sample Answers**

**1) Explain the architecture and why these technologies were chosen**
- Answer: The app splits concerns using a REST API and SPA. Node/Express provides fast API iteration and integrates well with Mongoose for MongoDB schema-driven data. React + Vite offers a modern fast dev workflow for the UI. JWT is stateless and scales easily for auth. Cloudinary handles large uploads off the app server and reduces attack surface.

**2) How does authentication and authorization work?**
- Answer: Users log in via `POST /api/auth/login` and receive a JWT. The token is sent in `Authorization: Bearer <token>` header for protected routes. `middleware/auth.js` verifies the token and enforces role-based access (doctor/patient/facility) for endpoints like slot creation or patient records.

**3) How are bookings and reschedules implemented?**
- Answer: Bookings either attach to an existing `Slot` (fast path) or create a pending appointment for custom requests. Rescheduling supports direct slot swaps and propose/approve flows. Approval updates appointment state and slot associations. Important to ensure atomicity (book slot then mark as booked) and consistent validation to prevent double-booking.

**4) How would you prevent race conditions when two patients book the same slot?**
- Answer: Use an atomic update on the `Slot` document (e.g., `findOneAndUpdate` with a filter `isAvailable: true` and set `isAvailable=false` upon booking) so only one booker succeeds. Alternatively, use transactions in MongoDB if multiple collections need updating atomically.

**5) How are file uploads handled securely?**
- Answer: Backend accepts multipart file uploads via `multer`, validates file types/size, and uploads to Cloudinary; the app stores Cloudinary `public_id` and URL instead of binary blobs. Credentials are kept in env vars.

**6) How is rate-limiting and security configured?**
- Answer: `express-rate-limit` is applied on `/api/` with environment-tunable window and max requests. `helmet` sets security headers and a CSP. CORS is strict in production via `ALLOWED_ORIGINS`.

**7) How would you add real-time notifications?**
- Answer: Add a WebSocket layer (Socket.io or WebSocket server) on top of Express or use a managed push service. Emit events on appointment changes and let clients subscribe to user-specific channels. Ensure token-based handshake and room/permission checks.

**8) How to monitor and run in production?**
- Answer: Use PM2 for process management (`ecosystem.config.js`), centralized logs (e.g., LogDNA or ELK), and health/endpoints for readiness probes. Use environment-specific config and connection pooling for DB.

**9) How to scale the app?**
- Answer: Scale backend horizontally behind a load balancer. Keep backend stateless (JWT for auth). Use managed MongoDB with replica sets, and Cloudinary for uploads. Offload background jobs to worker processes or serverless functions.

**10) Describe a recent bugfix or architectural change and why it matters**
- Answer: The reschedule proposal flow used to fail when a doctor proposed a date without an existing slot; the fix auto-creates a temporary slot and stores its id in `pendingReschedule`. This eliminates a class of acceptance failures and improves UX.

**Next steps I can do for you**
- Run the app locally and demonstrate common flows (register -> login -> book slot) and collect example API requests
- Produce a concise one-page cheatsheet of commands and endpoints for your interview
- Generate sample Postman collection or curl commands for the most important endpoints

If you'd like, I can now: run the app locally, create a Postman collection, or shorten this into a one-page cheat-sheet for interview quick reference. Which would you prefer?
