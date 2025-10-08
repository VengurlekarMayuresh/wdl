// Lightweight client-side notifications helper leveraging localStorage
// Strategy: maintain a set of seen notification IDs per user (more accurate than time-based)
// Also keep lastSeen for potential future use.

const LS_LAST_SEEN_KEY = (userId) => `notif:lastSeen:${userId || 'guest'}`;
const LS_SEEN_IDS_KEY = (userId) => `notif:seenIds:${userId || 'guest'}`;

export function getLastSeen(userId) {
  try {
    const v = localStorage.getItem(LS_LAST_SEEN_KEY(userId));
    return v ? new Date(parseInt(v, 10)) : new Date(0);
  } catch {
    return new Date(0);
  }
}

export function setLastSeen(userId, date = new Date()) {
  try {
    localStorage.setItem(LS_LAST_SEEN_KEY(userId), String(date.getTime()));
  } catch {}
}

export function getSeenIds(userId) {
  try {
    const raw = localStorage.getItem(LS_SEEN_IDS_KEY(userId));
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

export function addSeenIds(userId, ids = []) {
  try {
    const seen = getSeenIds(userId);
    ids.forEach((id) => seen.add(id));
    localStorage.setItem(LS_SEEN_IDS_KEY(userId), JSON.stringify(Array.from(seen)));
  } catch {}
}

// Broadcast to refresh header notifications (simple event bus)
export function emitNotificationsRefresh() {
  try {
    window.dispatchEvent(new CustomEvent('notif:refresh'));
  } catch {}
}

// Build simplified notifications from appointments
export function buildNotificationsFromAppointments(appointments = [], role = 'patient') {
  const items = [];
  for (const a of appointments) {
    const dt = new Date(a.appointmentDate || a.slotId?.dateTime || a.pendingReschedule?.proposedDateTime || Date.now());
    const doctor = a.doctorId?.userId || a.doctorId || {};
    const patient = a.patientId?.userId || a.patientId || {};
    const who = role === 'doctor' ? `${patient.firstName || 'Patient'} ${patient.lastName || ''}`.trim() : `Dr. ${doctor.firstName || ''} ${doctor.lastName || ''}`.trim();

    // Reschedule proposals (only when explicitly active)
    const pr = a.pendingReschedule;
    const hasActiveProposal = !!(pr && pr.active === true);
    if (hasActiveProposal) {
      const proposedText = pr.proposedDateTime
        ? new Date(pr.proposedDateTime).toLocaleString()
        : (pr.proposedSlotId ? 'a new slot' : 'a new time');
      if (role === 'patient') {
        // Only show when doctor proposed
        if (pr.proposedBy === 'doctor') {
          items.push({
            id: `${a._id}-reschedule-proposed`,
            kind: 'request',
            title: 'Doctor proposed new time',
            message: `${who} proposed ${proposedText}`,
            date: dt
          });
        }
      } else {
        // Doctor view: waiting on patient if doctor proposed OR waiting on doctor if patient proposed
        const waitingOn = pr.proposedBy === 'doctor' ? 'patient' : 'doctor';
        items.push({
          id: `${a._id}-reschedule-awaiting-${waitingOn}`,
          kind: 'request',
          title: 'Pending reschedule approval',
          message: `Awaiting ${waitingOn} decision`,
          date: dt
        });
      }
    }

    // Reschedule decision notifications (rejected)
    if (pr && pr.active === false && pr.decision === 'rejected') {
      const decisionTime = pr.decisionAt ? new Date(pr.decisionAt) : dt;
      const decidedBy = pr.decidedBy || 'unknown';
      if (role === 'patient') {
        if (pr.proposedBy === 'patient') {
          // Patient requested; doctor rejected
          items.push({
            id: `${a._id}-reschedule-rejected-by-doctor`,
            kind: 'rejected',
            title: 'Reschedule rejected',
            message: 'Doctor rejected your reschedule request',
            date: decisionTime,
          });
        } else if (pr.proposedBy === 'doctor') {
          // Doctor proposed; patient rejected (show to patient too)
          items.push({
            id: `${a._id}-you-rejected-reschedule`,
            kind: 'rejected',
            title: 'Reschedule rejected',
            message: 'You rejected the doctor\'s reschedule proposal',
            date: decisionTime,
          });
        }
      } else {
        // role === 'doctor'
        if (pr.proposedBy === 'patient') {
          // Patient requested; doctor rejected
          items.push({
            id: `${a._id}-you-rejected-reschedule`,
            kind: 'rejected',
            title: 'Reschedule rejected',
            message: 'You rejected the patient\'s reschedule request',
            date: decisionTime,
          });
        } else if (pr.proposedBy === 'doctor') {
          // Doctor proposed; patient rejected
          items.push({
            id: `${a._id}-reschedule-rejected-by-patient`,
            kind: 'rejected',
            title: 'Reschedule rejected',
            message: 'Patient rejected your reschedule proposal',
            date: decisionTime,
          });
        }
      }
    }

    // Note: Remove heuristic cancellation proposal detection via reasonForVisit to avoid false positives

    switch (a.status) {
      case 'pending':
        if (role === 'doctor') {
          items.push({
            id: `${a._id}-pending`,
            kind: 'request',
            title: 'New appointment request',
            message: `${who} requested an appointment`,
            date: dt,
          });
        } else {
          items.push({ id: `${a._id}-pending`, kind: 'request', title: 'Request sent', message: `Waiting for ${who} to confirm`, date: dt });
        }
        break;
      case 'confirmed':
        items.push({ id: `${a._id}-confirmed`, kind: 'confirmed', title: 'Appointment confirmed', message: `${who} on ${dt.toLocaleString()}`, date: dt });
        break;
      case 'rescheduled':
        items.push({ id: `${a._id}-rescheduled`, kind: 'confirmed', title: 'Appointment rescheduled', message: `${who} on ${dt.toLocaleString()}`, date: dt });
        break;
      case 'rejected':
        items.push({ id: `${a._id}-rejected`, kind: 'rejected', title: 'Appointment rejected', message: `With ${who}`, date: dt });
        break;
      case 'cancelled':
        items.push({ id: `${a._id}-cancelled`, kind: 'cancelled', title: 'Appointment cancelled', message: `With ${who}`, date: dt });
        break;
      case 'completed':
        items.push({ id: `${a._id}-completed`, kind: 'completed', title: 'Appointment completed', message: `With ${who}`, date: dt });
        break;
      default:
        break;
    }
  }
  // Newest first
  return items.sort((a, b) => b.date - a.date);
}
