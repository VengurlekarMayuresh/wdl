import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { reviewsAPI } from '@/services/api';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, User, Stethoscope, MapPin, Phone, AlertCircle, CheckCircle, XCircle, MessageCircle, Star, Edit } from 'lucide-react';
import { appointmentsAPI } from '@/services/api';
import { emitNotificationsRefresh } from '@/services/notifications';
import RescheduleModal from '@/components/appointment/RescheduleModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import AppointmentQuickDialog from '@/components/appointment/AppointmentQuickDialog';

const PatientAppointmentsPage = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [appointments, setAppointments] = useState({
    pending: [],
    upcoming: [],
    completed: [],
    cancelled: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming');
  const [rescheduleModal, setRescheduleModal] = useState({ isOpen: false, appointment: null });
  const [ratingById, setRatingById] = useState({});
  const [feedbackById, setFeedbackById] = useState({});
  const [confirmCancel, setConfirmCancel] = useState({ open: false, appointmentId: null });
  const [quickModal, setQuickModal] = useState({ isOpen: false, appointment: null });

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const allAppointments = await appointmentsAPI.getMyAppointments();
      // Initialize rating/feedback state from server values if present
      const rb = {};
      const fb = {};
      (allAppointments || []).forEach(a => {
        if (a.appointmentRating) rb[a._id] = a.appointmentRating;
        if (a.patientFeedback) fb[a._id] = a.patientFeedback;
      });
      setRatingById(rb);
      setFeedbackById(fb);
      
      // Categorize appointments and include reschedule proposals
      const now = new Date();
      const isMyReschedulePending = (apt) => !!(apt?.pendingReschedule?.active && apt?.pendingReschedule?.proposedBy === 'patient');
      const categorized = {
        pending: allAppointments.filter(apt => apt.status === 'pending' || isMyReschedulePending(apt)),
        upcoming: allAppointments.filter(apt => apt.status === 'confirmed' && new Date(apt.appointmentDate) > now && !isMyReschedulePending(apt)),
        completed: allAppointments.filter(apt => apt.status === 'completed'),
        cancelled: allAppointments.filter(apt => apt.status === 'cancelled' || apt.status === 'rejected')
      };
      
      setAppointments(categorized);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    setConfirmCancel({ open: true, appointmentId });
  };

  const confirmCancelYes = async () => {
    const appointmentId = confirmCancel.appointmentId;
    try {
      await appointmentsAPI.cancelAppointment(appointmentId);
      loadAppointments(); // Refresh appointments
      toast.success('Appointment cancelled');
      emitNotificationsRefresh();
    } catch (e) {
      // Backend may require doctor role; fall back to sending a cancellation request to doctor
      try {
        const apt = Object.values(appointments).flat().find(a => a._id === appointmentId);
        await appointmentsAPI.bookAppointment({
          forAppointmentId: appointmentId,
          requestedBy: 'patient',
          doctorId: apt?.doctorId?._id || apt?.doctorId,
          reasonForVisit: `Cancellation request for appointment ${appointmentId}`,
          appointmentType: 'consultation'
        });
        toast.success('Cancellation request sent to doctor');
        emitNotificationsRefresh();
      } catch (fallbackErr) {
        toast.error('Failed to cancel appointment: ' + (e?.message || fallbackErr?.message || 'Unknown error'));
      }
    } finally {
      setConfirmCancel({ open: false, appointmentId: null });
      loadAppointments();
    }
  };

  const handleRescheduleAppointment = (appointment) => {
    setRescheduleModal({ isOpen: true, appointment });
  };

  const handleRescheduleSuccess = () => {
    setRescheduleModal({ isOpen: false, appointment: null });
    loadAppointments(); // Refresh appointments
    emitNotificationsRefresh();
  };

  const handleRescheduleClose = () => {
    setRescheduleModal({ isOpen: false, appointment: null });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'warning', text: 'Pending Approval', icon: Clock },
      confirmed: { variant: 'success', text: 'Confirmed', icon: CheckCircle },
      completed: { variant: 'secondary', text: 'Completed', icon: CheckCircle },
      cancelled: { variant: 'destructive', text: 'Cancelled', icon: XCircle },
      rejected: { variant: 'destructive', text: 'Rejected', icon: XCircle }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', text: status, icon: AlertCircle };
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const AppointmentCard = ({ appointment, onClick }) => {
    const doctor = appointment.doctorId;
    const slot = appointment.slotId;
    const dateTime = appointment.appointmentDate || slot?.dateTime;
    const safeDate = dateTime ? formatDateTime(dateTime) : { date: 'TBD', time: '' };
    const { date, time } = safeDate;
    const hasDoctorProposal = !!(appointment?.pendingReschedule?.active && appointment?.pendingReschedule?.proposedBy === 'doctor');
    const hasPatientProposal = !!(appointment?.pendingReschedule?.active && appointment?.pendingReschedule?.proposedBy === 'patient');
    const proposedDate = appointment?.pendingReschedule?.proposedDateTime ? new Date(appointment.pendingReschedule.proposedDateTime) : null;
    const proposedReason = appointment?.pendingReschedule?.reason || '';
    
    return (
      <Card onClick={onClick} className="cursor-pointer border shadow-sm hover:shadow-md transition-all duration-200">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                {doctor.userId.profilePicture ? (
                  <img 
                    src={doctor.userId.profilePicture} 
                    alt={`Dr. ${doctor.userId.firstName}`}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <User className="h-6 w-6 text-primary" />
                )}
              </div>
              <div>
                <h3 className="font-semibold">
                  Dr. {doctor.userId.firstName} {doctor.userId.lastName}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Stethoscope className="h-3 w-3" />
                  <span>{doctor.primarySpecialty}</span>
                </div>
                {doctor.userId.address?.city && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{doctor.userId.address.city}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(appointment.status)}
              {hasDoctorProposal && (
                <Badge variant="warning" className="text-xs">Doctor requested new time</Badge>
              )}
              {hasPatientProposal && (
                <Badge variant="warning" className="text-xs">Reschedule pending approval</Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{date}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{time}</span>
            </div>
          </div>

          {appointment.reasonForVisit && (
            <div className="mb-2">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Reason:</span> {appointment.reasonForVisit}
              </p>
            </div>
          )}

          {/* My reschedule proposal details */}
          {hasPatientProposal && (
            <div className="mb-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <div className="text-sm font-medium text-amber-800">You requested a new time</div>
              {proposedDate && (
                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
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

          {appointment.rescheduledFrom?.reason && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <div className="text-sm text-amber-700">
                <span className="font-medium">Reschedule reason:</span> {appointment.rescheduledFrom.reason}
              </div>
            </div>
          )}

          {(appointment.appointmentType || slot?.type) && (
            <div className="mb-4">
              <Badge variant="outline" className="text-xs capitalize">
                {appointment.appointmentType || slot?.type}
              </Badge>
            </div>
          )}

          {appointment.rejectionReason && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-700">Rejection Reason:</span>
              </div>
              <p className="text-sm text-red-600 mt-1">{appointment.rejectionReason}</p>
            </div>
          )}

          {appointment.doctorNotes && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Doctor's Notes:</span>
              </div>
              <p className="text-sm text-blue-600 mt-1">{appointment.doctorNotes}</p>
            </div>
          )}

          {/* no inline actions; click opens dialog */}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-light">
        <Header 
          isAuthenticated={isAuthenticated}
          userInitial={(user?.firstName?.[0]?.toUpperCase?.() || 'U')}
          userType={user?.userType || 'patient'}
          onLogout={logout}
        />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-lg font-medium">Loading appointments...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-light">
      <Header 
        isAuthenticated={isAuthenticated}
        userInitial={(user?.firstName?.[0]?.toUpperCase?.() || 'U')}
        userType={user?.userType || 'patient'}
        onLogout={logout}
      />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Appointments</h1>
            <p className="text-muted-foreground mt-1">Manage and view your healthcare appointments</p>
          </div>
        </div>

        {error && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 max-w-lg">
            <TabsTrigger value="upcoming">
              Upcoming ({appointments.upcoming.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({appointments.pending.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({appointments.completed.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled ({appointments.cancelled.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appointments.upcoming.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No upcoming appointments</p>
                    <p className="text-sm text-muted-foreground">Your confirmed appointments will appear here</p>
                  </CardContent>
                </Card>
              ) : (
                appointments.upcoming.map((appointment) => (
                  <AppointmentCard 
                    key={appointment._id} 
                    appointment={appointment}
                    onClick={() => setQuickModal({ isOpen: true, appointment })}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appointments.pending.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No pending requests</p>
                    <p className="text-sm text-muted-foreground">Your appointment requests awaiting approval will appear here</p>
                  </CardContent>
                </Card>
              ) : (
                appointments.pending.map((appointment) => (
                  <AppointmentCard 
                    key={appointment._id} 
                    appointment={appointment}
                    onClick={() => setQuickModal({ isOpen: true, appointment })}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appointments.completed.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No completed appointments</p>
                    <p className="text-sm text-muted-foreground">Your appointment history will appear here</p>
                  </CardContent>
                </Card>
              ) : (
                appointments.completed.map((appointment) => (
                  <AppointmentCard key={appointment._id} appointment={appointment} onClick={() => setQuickModal({ isOpen: true, appointment })} />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="cancelled" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appointments.cancelled.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <XCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No cancelled appointments</p>
                    <p className="text-sm text-muted-foreground">Cancelled or rejected appointments will appear here</p>
                  </CardContent>
                </Card>
              ) : (
                appointments.cancelled.map((appointment) => (
                  <AppointmentCard key={appointment._id} appointment={appointment} onClick={() => setQuickModal({ isOpen: true, appointment })} />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Confirm cancel */}
        <ConfirmDialog
          open={confirmCancel.open}
          title="Cancel appointment?"
          description="This action cannot be undone. Your time slot will be released."
          confirmLabel="Cancel Appointment"
          cancelLabel="Keep Appointment"
          onConfirm={confirmCancelYes}
          onClose={() => setConfirmCancel({ open: false, appointmentId: null })}
        />

        {/* Quick Actions Dialog */}
        <AppointmentQuickDialog
          open={quickModal.isOpen}
          onClose={() => setQuickModal({ isOpen: false, appointment: null })}
          appointment={quickModal.appointment}
          userType="patient"
          onReschedule={(apt) => setRescheduleModal({ isOpen: true, appointment: apt })}
          onCancel={(id) => handleCancelAppointment(id)}
          onApprove={async (appointmentOrId) => {
            const appointmentId = typeof appointmentOrId === 'object' ? appointmentOrId._id : appointmentOrId;
            try {
              await appointmentsAPI.decideReschedule(appointmentId, 'approved');
              toast.success('Appointment confirmed');
              setQuickModal({ isOpen: false, appointment: null });
              loadAppointments();
              emitNotificationsRefresh();
            } catch (e) {
              // Fallback to approve if backend endpoint not available
              try {
                await appointmentsAPI.approveAppointment(appointmentId);
                toast.success('Appointment confirmed');
                setQuickModal({ isOpen: false, appointment: null });
                loadAppointments();
                emitNotificationsRefresh();
              } catch (err) {
                toast.error(e.message || 'Failed to approve');
              }
            }
          }}
          onReject={async (appointmentOrId) => {
            const appointmentId = typeof appointmentOrId === 'object' ? appointmentOrId._id : appointmentOrId;
            try {
              await appointmentsAPI.decideReschedule(appointmentId, 'rejected', 'Patient rejected reschedule');
              setQuickModal({ isOpen: false, appointment: null });
              loadAppointments();
              emitNotificationsRefresh();
            } catch (e) {
              // Fallback to reject if backend endpoint not available
              try {
                await appointmentsAPI.rejectAppointment(appointmentId, 'Patient rejected reschedule');
                setQuickModal({ isOpen: false, appointment: null });
                loadAppointments();
                emitNotificationsRefresh();
              } catch (err) {
                toast.error(e.message || 'Failed to reject');
              }
            }
          }}
          onSubmitReview={async (appointmentId, rating, feedback) => {
            try {
              await reviewsAPI.submitAppointmentReview(appointmentId, rating, feedback);
              toast.success('Review submitted');
              setQuickModal({ isOpen: false, appointment: null });
              loadAppointments();
            } catch (e) {
              toast.error(e.message || 'Failed to submit review');
            }
          }}
        />

        {/* Reschedule Modal */}
        <RescheduleModal
          appointment={rescheduleModal.appointment}
          isOpen={rescheduleModal.isOpen}
          onClose={handleRescheduleClose}
          onReschedule={handleRescheduleSuccess}
          userType="patient"
        />
      </div>
    </div>
  );
};

// Add review UI for completed appointments
// NOTE: This patch assumes there is a completed appointments map rendering. Add snippet where you render completed items.
// Example integration (pseudo within map):
// <div>
//   <div className="flex items-center gap-2">
//     {[1,2,3,4,5].map(star => (
//       <button key={star} onClick={() => setRatingFor(apt._id, star)}>{star <= (ratingById[apt._id]||0) ? '★' : '☆'}</button>
//     ))}
//   </div>
//   <textarea value={feedbackById[apt._id]||''} onChange={(e)=> setFeedbackById(prev=>({...prev,[apt._id]: e.target.value}))} />
//   <button onClick={async ()=>{try{await reviewsAPI.submitAppointmentReview(apt._id, ratingById[apt._id], feedbackById[apt._id]); toast.success('Review submitted');} catch(e){ toast.error(e.message);} }}>Submit Review</button>
// </div>

export default PatientAppointmentsPage;
