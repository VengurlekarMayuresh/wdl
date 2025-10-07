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
    const dt = new Date(a.appointmentDate || a.slotId?.dateTime || a.proposedDateTime || Date.now());
    const doctor = a.doctorId?.userId || a.doctorId || {};
    const patient = a.patientId?.userId || a.patientId || {};
    const who = role === 'doctor' ? `${patient.firstName || 'Patient'} ${patient.lastName || ''}`.trim() : `Dr. ${doctor.firstName || ''} ${doctor.lastName || ''}`.trim();

    // Reschedule proposals
    const hasProposal = !!(a.pendingReschedule || a.proposedDateTime || a.proposedSlotId) || (typeof a.reasonForVisit === 'string' && a.reasonForVisit.toLowerCase().includes('reschedule request'));
    if (hasProposal) {
      if (role === 'patient') {
        items.push({ id: `${a._id}-reschedule-proposed`, kind: 'request', title: 'Doctor proposed new time', message: `${who} proposed ${a.proposedDateTime ? new Date(a.proposedDateTime).toLocaleString() : 'a new slot'}`, date: dt });
      } else {
        items.push({ id: `${a._id}-reschedule-awaiting-patient`, kind: 'request', title: 'Pending reschedule approval', message: `Awaiting patient decision`, date: dt });
      }
    }

    // Cancellation proposals
    const hasCancelProposal = typeof a.reasonForVisit === 'string' && a.reasonForVisit.toLowerCase().includes('cancellation request');
    if (hasCancelProposal) {
      if (role === 'doctor') {
        items.push({ id: `${a._id}-cancel-proposed`, kind: 'request', title: 'Patient requested cancellation', message: `${who} requested to cancel`, date: dt });
      } else {
        items.push({ id: `${a._id}-cancel-awaiting-doctor`, kind: 'request', title: 'Cancellation request pending', message: `Awaiting doctor decision`, date: dt });
      }
    }

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
      case 'rescheduled':
        items.push({ id: `${a._id}-confirmed`, kind: 'confirmed', title: 'Appointment confirmed', message: `${who} on ${dt.toLocaleString()}`, date: dt });
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
