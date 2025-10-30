import nodemailer from 'nodemailer';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import User from '../models/User.js';

const EMAIL_FROM = process.env.EMAIL_FROM || process.env.SMTP_USER || 'no-reply@example.com';
const APP_NAME = process.env.APP_NAME || 'Healthcare Platform';
const CLIENT_URL = process.env.CLIENT_URL || '';

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_SECURE = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true' || SMTP_PORT === 465;

let transporter = null;
let smtpReady = false;

if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  // eslint-disable-next-line no-console
  console.log(`📧 SMTP initialized (${SMTP_HOST}:${SMTP_PORT}, secure=${SMTP_SECURE})`);
  smtpReady = true;
} else {
  // eslint-disable-next-line no-console
  console.log('📭 SMTP not configured (set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS) — emails will be skipped.');
}

function fullName(user) {
  if (!user) return '';
  const first = user.firstName || '';
  const last = user.lastName || '';
  return `${first} ${last}`.trim();
}

function fmt(dt) {
  try {
    const d = new Date(dt);
    return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return String(dt);
  }
}

function money(n) {
  if (n === undefined || n === null) return '—';
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n);
  } catch {
    return `$${Number(n).toFixed(2)}`;
  }
}

function buildTemplate({ title, preheader, intro, details = [], cta, footerNote }) {
  const rows = details
    .filter(Boolean)
    .map(({ label, value }) =>
      `<tr>
        <td style="padding:8px 12px;color:#374151;font-size:14px;width:40%;"><strong>${label}</strong></td>
        <td style="padding:8px 12px;color:#111827;font-size:14px;">${value ?? '—'}</td>
      </tr>`
    ).join('');

  const button = cta?.url ? `
    <div style="text-align:center;margin:24px 0 8px;">
      <a href="${cta.url}" style="display:inline-block;background:#2563EB;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:600;">
        ${cta.label || 'Open Dashboard'}
      </a>
    </div>` : '';

  return `
  <!doctype html>
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1"/>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <title>${title}</title>
      <style>
        .preheader { display:none !important; visibility:hidden; opacity:0; color:transparent; height:0; width:0; }
      </style>
    </head>
    <body style="margin:0;padding:0;background:#F3F4F6;">
      <span class="preheader">${preheader || ''}</span>
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#F3F4F6;padding:24px 0;">
        <tr>
          <td align="center">
            <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #E5E7EB;">
              <tr>
                <td style="background:#1F2937;color:#fff;padding:16px 20px;">
                  <div style="font-size:18px;font-weight:700;">${APP_NAME}</div>
                </td>
              </tr>
              <tr>
                <td style="padding:24px 20px 8px;">
                  <h1 style="margin:0 0 8px 0;color:#111827;font-size:20px;">${title}</h1>
                  ${intro ? `<p style=\"margin:0;color:#374151;font-size:14px;\">${intro}</p>` : ''}
                </td>
              </tr>
              ${rows ? `<tr><td style="padding:8px 20px 0;">
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:separate;border-spacing:0 4px;background:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;">
                  ${rows}
                </table>
              </td></tr>` : ''}
              <tr><td style="padding:4px 20px 20px;">${button}</td></tr>
              <tr>
                <td style="padding:16px 20px;background:#F9FAFB;color:#6B7280;font-size:12px;">
                  ${footerNote || 'If you did not expect this email, please ignore it.'}
                  <div style="margin-top:8px;">&copy; ${new Date().getFullYear()} ${APP_NAME}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
}

async function sendEmail({ to, subject, html, text }) {
  if (!smtpReady) {
    // eslint-disable-next-line no-console
    console.log(`(skip email) ${subject} -> ${Array.isArray(to) ? to.join(', ') : to}`);
    return { skipped: true };
  }

  const recipients = Array.isArray(to) ? to.filter(Boolean).join(', ') : to;

  const msg = {
    to: recipients,
    from: EMAIL_FROM,
    subject,
    text: text || html?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
    html,
  };

  try {
    await transporter.sendMail(msg);
    return { success: true };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('SMTP error:', err?.message || err);
    return { success: false, error: err?.message };
  }
}

async function loadContext(appointment) {
  const apt = await Appointment.findById(appointment._id)
    .populate('doctorId')
    .populate('patientId')
    .populate('slotId');
  if (!apt) return null;

  const doctor = apt.doctorId;
  const patient = apt.patientId;
  const doctorUser = doctor ? await User.findById(doctor.userId) : null;
  const patientUser = patient ? await User.findById(patient.userId) : null;

  return { apt, doctor, patient, doctorUser, patientUser };
}

export async function notifyAppointmentRequested(appointment) {
  const ctx = await loadContext(appointment);
  if (!ctx) return;
  const { apt, doctorUser, patientUser, doctor, patient } = ctx;
  if (!doctorUser?.email) return;

  const subject = `New appointment request from ${fullName(patientUser)}`;
  const html = buildTemplate({
    title: 'New Appointment Request',
    preheader: `Request from ${fullName(patientUser)} for ${fmt(apt.requestedDateTime || apt.appointmentDate)}`,
    intro: 'You have received a new appointment request. Review the details below.',
    details: [
      { label: 'Patient', value: `${fullName(patientUser)}${patient?.patientId ? ` (ID: ${patient.patientId})` : ''}` },
      { label: 'Requested Time', value: fmt(apt.requestedDateTime || apt.appointmentDate) },
      { label: 'Reason for Visit', value: apt.reasonForVisit || '—' },
      { label: 'Appointment Type', value: apt.appointmentType || 'consultation' },
      { label: 'Consultation Mode', value: apt.consultationType || 'in-person' },
      { label: 'Consultation Fee', value: money(apt.consultationFee) },
      { label: 'Appointment ID', value: apt._id?.toString() },
    ],
    cta: { label: 'Open Dashboard', url: CLIENT_URL || undefined },
    footerNote: 'Please respond promptly to improve patient experience.'
  });

  await sendEmail({ to: doctorUser.email, subject, html });
}

export async function notifyAppointmentConfirmed(appointment) {
  const ctx = await loadContext(appointment);
  if (!ctx) return;
  const { apt, doctorUser, patientUser, doctor } = ctx;

  const when = fmt(apt.appointmentDate);

  const details = [
    { label: 'Doctor', value: fullName(doctorUser) || '—' },
    { label: 'Specialty', value: doctor?.primarySpecialty || '—' },
    { label: 'Date & Time', value: when },
    { label: 'Duration', value: `${apt.duration || 30} minutes` },
    { label: 'Appointment Type', value: apt.appointmentType || 'consultation' },
    { label: 'Consultation Mode', value: apt.consultationType || 'in-person' },
    { label: 'Consultation Fee', value: money(apt.consultationFee) },
    { label: 'Appointment ID', value: apt._id?.toString() },
  ];

  const htmlPatient = buildTemplate({
    title: 'Appointment Confirmed',
    preheader: `Your appointment is confirmed for ${when}`,
    intro: 'Your appointment has been confirmed. Here are the details:',
    details,
    cta: { label: 'View Appointment', url: CLIENT_URL || undefined },
    footerNote: apt.consultationType === 'telemedicine' && apt.telemedicineDetails?.meetingLink
      ? `Telemedicine link: ${apt.telemedicineDetails.meetingLink}`
      : 'Please arrive 10 minutes early or be ready to join on time.'
  });

  const htmlDoctor = buildTemplate({
    title: 'Appointment Confirmed with Patient',
    preheader: `Confirmed for ${when}`,
    intro: 'An appointment with a patient has been confirmed. Details below:',
    details,
    cta: { label: 'Open Dashboard', url: CLIENT_URL || undefined },
  });

  if (patientUser?.email) {
    await sendEmail({ to: patientUser.email, subject: 'Appointment Confirmed', html: htmlPatient });
  }
  if (doctorUser?.email) {
    await sendEmail({ to: doctorUser.email, subject: 'Appointment Confirmed with Patient', html: htmlDoctor });
  }
}

export async function notifyAppointmentStatus(appointment, status, meta = {}) {
  const ctx = await loadContext(appointment);
  if (!ctx) return;
  const { apt, doctorUser, patientUser, doctor, patient } = ctx;

  const when = fmt(apt.appointmentDate);
  const title = `Appointment ${status.charAt(0).toUpperCase() + status.slice(1)}`;

  const details = [
    { label: 'Doctor', value: fullName(doctorUser) || '—' },
    { label: 'Patient', value: fullName(patientUser) || '—' },
    { label: 'Date & Time', value: when },
    { label: 'Appointment Type', value: apt.appointmentType || 'consultation' },
    { label: 'Consultation Mode', value: apt.consultationType || 'in-person' },
    meta?.reason ? { label: 'Reason', value: meta.reason } : null,
    { label: 'Appointment ID', value: apt._id?.toString() },
  ];

  const html = buildTemplate({
    title,
    preheader: `${title} for ${when}`,
    intro: 'Please find the current status and details of your appointment below:',
    details,
    cta: { label: 'Open Dashboard', url: CLIENT_URL || undefined },
  });

  const recipients = [patientUser?.email, doctorUser?.email].filter(Boolean);
  if (recipients.length) {
    await sendEmail({ to: recipients, subject: title, html });
  }
}

export async function notifyRescheduleProposed(appointment, proposedDateTime, proposedBy) {
  const ctx = await loadContext(appointment);
  if (!ctx) return;
  const { patientUser, doctorUser, apt } = ctx;

  const toUser = proposedBy === 'doctor' ? patientUser : doctorUser;
  if (!toUser?.email) return;

  const html = buildTemplate({
    title: 'Reschedule Proposed',
    preheader: `Proposed new time: ${fmt(proposedDateTime)}`,
    intro: `${proposedBy === 'doctor' ? 'Your doctor' : 'The patient'} has proposed a new time for this appointment.`,
    details: [
      { label: 'Current Time', value: fmt(apt.appointmentDate) },
      { label: 'Proposed Time', value: fmt(proposedDateTime) },
      { label: 'Appointment ID', value: apt._id?.toString() },
    ],
    cta: { label: 'Review Proposal', url: CLIENT_URL || undefined },
  });

  await sendEmail({ to: toUser.email, subject: 'Reschedule Proposed', html });
}

export async function notifyRescheduleDecision(appointment, decision, reason) {
  const ctx = await loadContext(appointment);
  if (!ctx) return;
  const { apt, patientUser, doctorUser } = ctx;
  const approved = decision === 'approved';

  const html = buildTemplate({
    title: `Reschedule ${approved ? 'Approved' : 'Rejected'}`,
    preheader: approved ? `New time: ${fmt(apt.appointmentDate)}` : 'Reschedule request was rejected',
    intro: approved
      ? 'The reschedule request has been approved. Your appointment details have been updated.'
      : 'The reschedule request has been rejected.',
    details: [
      approved ? { label: 'New Time', value: fmt(apt.appointmentDate) } : null,
      !approved && reason ? { label: 'Reason', value: reason } : null,
      { label: 'Appointment ID', value: apt._id?.toString() },
    ],
    cta: { label: 'Open Dashboard', url: CLIENT_URL || undefined },
  });

  const recipients = [patientUser?.email, doctorUser?.email].filter(Boolean);
  if (recipients.length) {
    await sendEmail({ to: recipients, subject: `Reschedule ${approved ? 'Approved' : 'Rejected'}`, html });
  }
}

export default {
  notifyAppointmentRequested,
  notifyAppointmentConfirmed,
  notifyAppointmentStatus,
  notifyRescheduleProposed,
  notifyRescheduleDecision,
};
