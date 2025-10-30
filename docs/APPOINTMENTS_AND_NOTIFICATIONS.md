# Appointments, Rescheduling, Notifications — How It Works

This document explains the end-to-end flows for slots, booking, rescheduling, status changes, reviews, and notifications (UI refresh + email).

## Slots (Doctor)

Endpoints: `backend/routes/appointments.js`
- GET `/api/appointments/slots/my` — list my slots (doctor)
- POST `/api/appointments/slots` — create slot
- PUT `/api/appointments/slots/:slotId` — update a slot (not if booked)
- DELETE `/api/appointments/slots/:slotId` — delete a slot (not if booked)
- GET `/api/appointments/slots/doctor/:doctorId` — public view of available slots

Key behaviors (model `Slot.js`):
- `canBeBooked()` returns true iff slot is available, not booked, active, and in the future
- `book(patientId, appointmentId)` flips `isBooked` and links booking
- `cancelBooking(cancelledBy, reason)` re-opens slot

Note: creation currently checks exact same datetime. If you need overlap prevention (e.g., 12:30 + 30min blocks 13:00 start), add a range check for `[start, end)` collisions.

## Booking (Patient)

1) Book an existing slot
- POST `/api/appointments` with `slotId` and `reasonForVisit`
- Server validates slot via `canBeBooked()`
- Creates `Appointment` with `status: pending`, books slot, then `appointment.confirm()` to mark confirmed
- Emails: `notifyAppointmentConfirmed(appointment)` to both doctor and patient

2) Custom request (no slot yet)
- POST `/api/appointments` with `doctorId`, `requestedDateTime`, `reasonForVisit`
- Creates `Appointment` with `status: pending`, `isCustomRequest: true`
- Emails: `notifyAppointmentRequested(appointment)` to doctor

## Approvals and Status Updates

- PUT `/api/appointments/:appointmentId/status`
  - Patient can cancel their own appointment (`status: cancelled`)
  - Doctor actions:
    - `confirmed` — if appointment had no slot (custom request), server ensures a slot exists at `appointmentDate`, books it, then confirms
      - Emails: `notifyAppointmentConfirmed(appointment)`
    - `rejected` or `cancelled` — updates appointment and frees slot if present
      - Emails: `notifyAppointmentStatus(appointment, status, {reason})`
    - `completed` — saves notes/diagnosis/treatmentPlan
      - Emails: `notifyAppointmentStatus(appointment, 'completed')`

## Rescheduling

A) Patient direct reschedule (auto-approved for UX)
- PUT `/api/appointments/:appointmentId/reschedule` with `newSlotId`
- Server validates ownership, slot availability, same doctor
- Updates the existing booked slot’s time to the new slot’s time (keeps slotId), deletes the temporary slot used for selection
- Sets appointment `status: confirmed`, writes reschedule history, cleans up duplicates
- Emails: `notifyAppointmentStatus(appointment, 'rescheduled')`

B) Propose reschedule (doctor or patient)
- POST `/api/appointments/:appointmentId/reschedule/propose` with `proposedSlotId` or `proposedDateTime`
- If doctor proposes only a datetime, server auto-creates an available slot at that time to avoid accept failures
- Stores `appointment.pendingReschedule`
- Emails: `notifyRescheduleProposed(appointment, proposedDateTime, proposedBy)` sent to counterparty

C) Decide reschedule (counterparty approves/rejects)
- PUT `/api/appointments/:appointmentId/reschedule/decision` with `decision: 'approved'|'rejected'`
- Approved: updates current slot time (and appointment), clears pending state, adds history
  - Emails: `notifyRescheduleDecision(appointment, 'approved')` to both
- Rejected: clears pending state
  - Emails: `notifyRescheduleDecision(appointment, 'rejected', reason)` to both

## Reviews (Patient)

- PUT `/api/appointments/:appointmentId/review` with rating (1–5) and optional feedback
- Re-computes doctor’s `averageRating` and `totalReviews`

## Notifications — UI refresh vs Email

- UI refresh: frontend triggers `emitNotificationsRefresh` (see `frontend/src/services/notifications.js`) after key actions to re-pull data
- Email: `backend/services/email.js` sends branded HTML emails for request/confirmation/status/reschedule
  - Env required: `SMTP_HOST=smtp.sendgrid.net`, `SMTP_USER=apikey`, `SMTP_PASS=<SendGridKey>`, `EMAIL_FROM=<verified or domain-authenticated>`

## Health & Admin Utilities

- GET `/api/health` for server/db health
- POST `/api/appointments/cleanup/reschedule-duplicates` — cleans old pending reschedules & orphaned slots (dev/admin)

