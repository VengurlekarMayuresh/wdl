import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CheckCircle, XCircle, Edit, User, Stethoscope } from 'lucide-react';

const Row = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-2 text-sm">
    {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
    <span className="text-muted-foreground">{label}:</span>
    <span className="font-medium">{value}</span>
  </div>
);

const AppointmentQuickDialog = ({
  open,
  onClose,
  appointment,
  userType = 'patient',
  onApprove,
  onReject,
  onReschedule,
  onCancel,
  onComplete,
  onSubmitReview,
}) => {
  if (!appointment) return null;
  const date = new Date(appointment.appointmentDate || appointment.slotId?.dateTime);
  const who = userType === 'doctor' ? appointment.patientId : appointment.doctorId;
  const name = userType === 'doctor'
    ? `${who?.userId?.firstName || who?.firstName || 'Patient'} ${who?.userId?.lastName || who?.lastName || ''}`
    : `Dr. ${who?.userId?.firstName || who?.firstName || ''} ${who?.userId?.lastName || who?.lastName || ''}`;
  const status = appointment.status;
  const isDoctorReschedule = !!(appointment?.pendingReschedule?.active && appointment?.pendingReschedule?.proposedBy === 'doctor');
  const isPatientCancelProposal = typeof appointment?.reasonForVisit === 'string' && appointment.reasonForVisit.toLowerCase().includes('cancellation request');
  const proposedDate = appointment?.pendingReschedule?.proposedDateTime ? new Date(appointment.pendingReschedule.proposedDateTime) : null;
  const proposedReason = appointment?.pendingReschedule?.reason || '';

  // review state (patients only)
  const [rating, setRating] = React.useState(appointment.appointmentRating || 0);
  const [feedback, setFeedback] = React.useState(appointment.patientFeedback || '');
  const [submitting, setSubmitting] = React.useState(false);

  const actions = [];
  if (userType === 'doctor') {
    if (status === 'pending') {
      actions.push({ label: 'Approve', onClick: () => { onApprove?.(appointment._id); onClose?.(); }, icon: CheckCircle, variant: 'default' });
      actions.push({ label: 'Reject', onClick: () => { onReject?.(appointment._id); onClose?.(); }, icon: XCircle, variant: 'outline' });
    }
    if (status === 'confirmed' || status === 'rescheduled') {
      actions.push({ label: 'Reschedule', onClick: () => { onReschedule?.(appointment); onClose?.(); }, icon: Edit, variant: 'outline' });
      actions.push({ label: 'Cancel', onClick: () => { onCancel?.(appointment._id, 'Cancelled by doctor'); onClose?.(); }, icon: XCircle, variant: 'outline' });
      actions.push({ label: 'Complete', onClick: () => { onComplete?.(appointment._id); onClose?.(); }, icon: CheckCircle, variant: 'default' });
    }
  } else {
    if (status === 'confirmed') {
      actions.push({ label: 'Reschedule', onClick: () => { onReschedule?.(appointment); onClose?.(); }, icon: Edit, variant: 'outline' });
      actions.push({ label: 'Cancel', onClick: () => { onCancel?.(appointment._id); onClose?.(); }, icon: XCircle, variant: 'outline' });
    }
    if (status === 'pending') {
      // While waiting for doctor approval, patient can request a new timing or cancel the request
      actions.push({ label: 'Request new time', onClick: () => { onReschedule?.(appointment); onClose?.(); }, icon: Edit, variant: 'outline' });
      actions.push({ label: 'Cancel request', onClick: () => { onCancel?.(appointment._id); onClose?.(); }, icon: XCircle, variant: 'outline' });
    }
    if (isDoctorReschedule) {
      // Only show Approve/Reject when doctor has proposed a reschedule
      actions.push({ label: 'Approve', onClick: () => { onApprove?.(appointment._id); onClose?.(); }, icon: CheckCircle, variant: 'default' });
      actions.push({ label: 'Reject', onClick: () => { onReject?.(appointment._id); onClose?.(); }, icon: XCircle, variant: 'outline' });
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose?.()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {userType === 'doctor' ? <User className="h-4 w-4" /> : <Stethoscope className="h-4 w-4" />}
            Quick Actions
            <Badge variant={status === 'confirmed' || status === 'rescheduled' ? 'success' : (status === 'pending' ? 'warning' : 'secondary')} className="ml-2 text-xs">
              {status}
            </Badge>
            {userType === 'patient' && isDoctorReschedule && (
              <Badge variant="warning" className="ml-2 text-xs">Reschedule requested</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2 mb-3">
          <Row label={userType === 'doctor' ? 'Patient' : 'Doctor'} value={name} />
          <Row icon={Calendar} label="Date" value={date.toLocaleDateString()} />
          <Row icon={Clock} label="Time" value={date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
        </div>

        {isDoctorReschedule && (
          <div className="mb-3 p-3 rounded-md border border-amber-200 bg-amber-50">
            <div className="text-sm font-medium text-amber-800 mb-1">Doctor proposed new time</div>
            {proposedDate && (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-amber-700" />
                  <span>{proposedDate.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-700" />
                  <span>{proposedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            )}
            {proposedReason && (
              <div className="mt-2 text-xs text-amber-700">
                <span className="font-medium">Reason:</span> {proposedReason}
              </div>
            )}
          </div>
        )}

        {/* Review (patients, completed) */}
        {userType === 'patient' && status === 'completed' && !appointment.appointmentRating && (
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={() => setRating(s)} className={`text-xl ${s <= rating ? 'text-yellow-500' : 'text-muted-foreground'}`} aria-label={`Rate ${s}`}>
                  {s <= rating ? '★' : '☆'}
                </button>
              ))}
            </div>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border rounded-md text-sm"
              placeholder="Share your feedback (optional)"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
            <div className="flex justify-end">
              <Button size="sm" disabled={submitting || !rating} onClick={async () => {
                if (!onSubmitReview) return;
                try {
                  setSubmitting(true);
                  await onSubmitReview(appointment._id, rating, feedback);
                } finally {
                  setSubmitting(false);
                }
              }}>
                {submitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 justify-end">
          {actions.map((a, idx) => (
            <Button key={idx} size="sm" variant={a.variant} onClick={a.onClick}>
              {a.icon && <a.icon className="h-3 w-3 mr-1" />}
              {a.label}
            </Button>
          ))}
          <Button size="sm" variant="outline" onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentQuickDialog;