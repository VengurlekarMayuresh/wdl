import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, User, Stethoscope, MapPin, Phone, AlertCircle, CheckCircle, XCircle, MessageCircle, RefreshCw, Edit, Video, Heart, Activity, FileText, Star } from 'lucide-react';
import { appointmentsAPI } from '@/services/api';
import { emitNotificationsRefresh } from '@/services/notifications';
import RescheduleModal from '@/components/appointment/RescheduleModal';
import AppointmentQuickDialog from '@/components/appointment/AppointmentQuickDialog';
import PromptDialog from '@/components/ui/PromptDialog';
import { toast } from '@/components/ui/sonner';

const DoctorAppointmentsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [appointments, setAppointments] = useState({
    pending: [],
    upcoming: [],
    completed: [],
    cancelled: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [actionLoading, setActionLoading] = useState({});
  const [rescheduleModal, setRescheduleModal] = useState({ isOpen: false, appointment: null });
  const [quickModal, setQuickModal] = useState({ isOpen: false, appointment: null });
  const [prompt, setPrompt] = useState({ open: false, mode: null, appointmentId: null, title: '', label: '', placeholder: '' });

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load all appointments for this doctor
      const allAppointments = await appointmentsAPI.getDoctorAppointments();
      console.log('Loaded doctor appointments:', allAppointments);
      
      // Categorize appointments using appointmentDate and reschedule proposals
      const now = new Date();
      const isPatientReschedulePending = (apt) => !!(apt?.pendingReschedule?.active && apt?.pendingReschedule?.proposedBy === 'patient');
      const categorized = {
        // Include normal pending plus reschedule proposals from patient
        pending: allAppointments.filter(apt => apt.status === 'pending' || isPatientReschedulePending(apt)),
        // Upcoming excludes items currently in reschedule-pending to avoid duplication
        upcoming: allAppointments.filter(apt => (apt.status === 'confirmed' || apt.status === 'rescheduled') && new Date(apt.appointmentDate) > now && !isPatientReschedulePending(apt)),
        completed: allAppointments.filter(apt => apt.status === 'completed'),
        cancelled: allAppointments.filter(apt => apt.status === 'cancelled' || apt.status === 'rejected')
      };
      
      setAppointments(categorized);
    } catch (e) {
      console.error('Error loading appointments:', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAppointment = async (appointmentOrId) => {
    const apt = typeof appointmentOrId === 'object' ? appointmentOrId : (Object.values(appointments).flat().find(a => a._id === appointmentOrId));
    const appointmentId = apt?._id || appointmentOrId;
    try {
      setActionLoading(prev => ({ ...prev, [appointmentId]: 'approving' }));
      if (apt?.pendingReschedule?.active) {
        await appointmentsAPI.decideReschedule(appointmentId, 'approved');
        toast.success('Reschedule approved');
      } else {
        await appointmentsAPI.approveAppointment(appointmentId);
        toast.success('Appointment approved');
      }
      await loadAppointments(); // Refresh appointments
      emitNotificationsRefresh();
    } catch (e) {
      toast.error('Failed to approve: ' + e.message);
    } finally {
      setActionLoading(prev => {
        const newState = { ...prev };
        delete newState[appointmentId];
        return newState;
      });
    }
  };

  const handleRejectAppointment = async (appointmentOrId, reason = '') => {
    const apt = typeof appointmentOrId === 'object' ? appointmentOrId : (Object.values(appointments).flat().find(a => a._id === appointmentOrId));
    const appointmentId = apt?._id || appointmentOrId;
    if (!reason && !(apt?.pendingReschedule?.active)) {
      setPrompt({ open: true, mode: 'reject', appointmentId, title: 'Reject appointment', label: 'Reason (optional)', placeholder: 'Add a reason for rejection' });
      return;
    }
    try {
      setActionLoading(prev => ({ ...prev, [appointmentId]: 'rejecting' }));
      if (apt?.pendingReschedule?.active) {
        await appointmentsAPI.decideReschedule(appointmentId, 'rejected', reason || 'Doctor rejected reschedule');
        toast.success('Reschedule rejected');
      } else {
        await appointmentsAPI.rejectAppointment(appointmentId, reason || '');
        toast.success('Appointment rejected');
      }
      await loadAppointments(); // Refresh appointments
      emitNotificationsRefresh();
    } catch (e) {
      toast.error('Failed to reject: ' + e.message);
    } finally {
      setActionLoading(prev => {
        const newState = { ...prev };
        delete newState[appointmentId];
        return newState;
      });
    }
  };

  const handleCompleteAppointment = async (appointmentId, notes = '') => {
    if (!notes) {
      setPrompt({ open: true, mode: 'complete', appointmentId, title: 'Complete appointment', label: 'Consultation notes (optional)', placeholder: 'Add notes for this consultation' });
      return;
    }
    try {
      setActionLoading(prev => ({ ...prev, [appointmentId]: 'completing' }));
      await appointmentsAPI.completeAppointment(appointmentId, notes);
      await loadAppointments(); // Refresh appointments
      toast.success('Appointment completed');
      emitNotificationsRefresh();
    } catch (e) {
      toast.error('Failed to complete appointment: ' + e.message);
    } finally {
      setActionLoading(prev => {
        const newState = { ...prev };
        delete newState[appointmentId];
        return newState;
      });
    }
  };

  const handleRescheduleAppointment = (appointment) => {
    setRescheduleModal({ isOpen: true, appointment });
  };

  const handleRescheduleSuccess = () => {
    setRescheduleModal({ isOpen: false, appointment: null });
    loadAppointments(); // Refresh appointments
    toast.success('Appointment rescheduled successfully!');
    emitNotificationsRefresh();
  };

  const handleRescheduleClose = () => {
    setRescheduleModal({ isOpen: false, appointment: null });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'warning', text: 'Pending', icon: Clock },
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
    const patient = appointment.patientId;
    const slot = appointment.slotId;
    const dateTime = appointment.appointmentDate || slot?.dateTime;
    const safeDate = dateTime ? formatDateTime(dateTime) : { date: 'TBD', time: '' };
    const { date, time } = safeDate;
    const currentAction = actionLoading[appointment._id];
    
    const getCardGradient = (status) => {
      switch (status) {
        case 'pending': return 'from-yellow-50 to-orange-50 border-yellow-200';
        case 'confirmed': return 'from-blue-50 to-indigo-50 border-blue-200';
        case 'completed': return 'from-green-50 to-emerald-50 border-green-200';
        case 'cancelled': case 'rejected': return 'from-red-50 to-pink-50 border-red-200';
        default: return 'from-gray-50 to-slate-50 border-gray-200';
      }
    };
    
    const getStatusIcon = (status) => {
      switch (status) {
        case 'pending': return Clock;
        case 'confirmed': return CheckCircle;
        case 'completed': return Star;
        case 'cancelled': case 'rejected': return XCircle;
        default: return AlertCircle;
      }
    };
    
    const StatusIcon = getStatusIcon(appointment.status);
    const isPatientReschedule = !!(appointment?.pendingReschedule?.active && appointment?.pendingReschedule?.proposedBy === 'patient');
    const proposedDate = appointment?.pendingReschedule?.proposedDateTime ? new Date(appointment.pendingReschedule.proposedDateTime) : null;
    const proposedReason = appointment?.pendingReschedule?.reason || '';
    
    return (
      <Card onClick={onClick} className={`cursor-pointer border shadow-sm hover:shadow-md transition-all duration-200 bg-white overflow-hidden group`}>
        <CardHeader className="pb-3 relative">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {isPatientReschedule && (
              <Badge variant="warning" className="text-xs">Reschedule requested</Badge>
            )}
            <div className={`p-2 rounded-full ${appointment.status === 'pending' ? 'bg-yellow-100' : appointment.status === 'confirmed' ? 'bg-blue-100' : appointment.status === 'completed' ? 'bg-green-100' : 'bg-red-100'}`}>
              <StatusIcon className={`h-5 w-5 ${appointment.status === 'pending' ? 'text-yellow-600' : appointment.status === 'confirmed' ? 'text-blue-600' : appointment.status === 'completed' ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg">
                {patient.userId.profilePicture ? (
                  <img 
                    src={patient.userId.profilePicture} 
                    alt={`${patient.userId.firstName}`}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <User className="h-8 w-8 text-white" />
                )}
              </div>
              {appointment.status === 'confirmed' && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Activity className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                  {patient.userId.firstName} {patient.userId.lastName}
                </h3>
                {appointment.status === 'completed' && (
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                <Phone className="h-3 w-3" />
                {patient.userId.phone || 'No phone provided'}
              </p>
              <p className="text-sm text-muted-foreground">{patient.userId.email}</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div className="flex items-center gap-3 p-3 bg-white/70 rounded-lg">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Date</p>
                <p className="font-semibold text-foreground">{date}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/70 rounded-lg">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Time</p>
                <p className="font-semibold text-foreground">{time}</p>
              </div>
            </div>
          </div>

          {/* Reschedule proposal details (patient-initiated) */}
          {isPatientReschedule && (
            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="text-sm font-semibold text-amber-800 mb-2">Patient requested a new time</div>
              {proposedDate && (
                <div className="grid grid-cols-2 gap-3 text-sm">
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
          
          {/* Appointment Type */}
          {(appointment.appointmentType || slot?.type) && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Stethoscope className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Appointment Type</span>
              </div>
              <Badge variant="outline" className="bg-white/50 capitalize">
                {(slot?.type === 'video' || appointment.consultationType === 'telemedicine') && <Video className="h-3 w-3 mr-1" />}
                {appointment.appointmentType || slot?.type}
              </Badge>
            </div>
          )}

          {/* Reason for Visit */}
          {appointment.reasonForVisit && (
            <div className="mb-4 p-4 bg-white/50 border border-primary/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Reason for Visit</span>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{appointment.reasonForVisit}</p>
            </div>
          )}

          {/* Doctor Notes */}
          {appointment.doctorNotes && (
            <div className="mb-4 p-4 bg-green-50/70 border border-green-200/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-green-600" />
                <span className="text-sm font-semibold text-green-700">Consultation Notes</span>
              </div>
              <p className="text-sm text-green-700 leading-relaxed">{appointment.doctorNotes}</p>
            </div>
          )}

          {/* Rejection Reason */}
          {appointment.rejectionReason && (
            <div className="mb-4 p-4 bg-red-50/70 border border-red-200/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-semibold text-red-700">Rejection Reason</span>
              </div>
              <p className="text-sm text-red-700 leading-relaxed">{appointment.rejectionReason}</p>
            </div>
          )}

          {/* no inline actions; click opens dialog */}
        </CardContent>
      </Card>
    );
  };

  const handlePromptSubmit = async (value) => {
    const { appointmentId, mode } = prompt;
    setPrompt(prev => ({ ...prev, open: false }));
    if (mode === 'reject') {
      await handleRejectAppointment(appointmentId, value || '');
    } else if (mode === 'complete') {
      await handleCompleteAppointment(appointmentId, value || '');
    }
  };

  if (!isAuthenticated || user?.userType !== 'doctor') {
    return (
      <div className="min-h-screen bg-gradient-light">
        <Header 
          isAuthenticated={isAuthenticated}
          userInitial={(user?.firstName?.[0]?.toUpperCase?.() || 'U')}
          userType={user?.userType || 'doctor'}
        />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p>Access denied. Doctor login required.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-light">
        <Header 
          isAuthenticated={isAuthenticated}
          userInitial={(user?.firstName?.[0]?.toUpperCase?.() || 'U')}
          userType={user?.userType || 'doctor'}
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
        userType={user?.userType || 'doctor'}
      />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Appointments</h1>
            <p className="text-muted-foreground mt-1">Manage your patient appointments and requests</p>
          </div>
          <Button onClick={loadAppointments} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {error && (
          <Card className="mb-6 border-red-200">
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
            <TabsTrigger value="pending">
              Pending ({appointments.pending.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              Upcoming ({appointments.upcoming.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({appointments.completed.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled ({appointments.cancelled.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-1 xl:grid-cols-2 gap-4">
              {appointments.pending.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No pending appointment requests</p>
                    <p className="text-sm text-muted-foreground">New appointment requests from patients will appear here</p>
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

          <TabsContent value="upcoming" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-1 xl:grid-cols-2 gap-4">
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

          <TabsContent value="completed" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-1 xl:grid-cols-2 gap-4">
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
            <div className="grid grid-cols-1 sm:grid-cols-1 xl:grid-cols-2 gap-4">
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
        
        {/* Prompt Dialog */}
        <PromptDialog
          open={prompt.open}
          title={prompt.title}
          label={prompt.label}
          placeholder={prompt.placeholder}
          onSubmit={handlePromptSubmit}
          onClose={() => setPrompt(prev => ({ ...prev, open: false }))}
        />

        {/* Quick Actions Dialog */}
        <AppointmentQuickDialog
          open={quickModal.isOpen}
          onClose={() => setQuickModal({ isOpen: false, appointment: null })}
          appointment={quickModal.appointment}
          userType="doctor"
          onApprove={handleApproveAppointment}
          onReject={(id) => handleRejectAppointment(id)}
          onReschedule={(apt) => setRescheduleModal({ isOpen: true, appointment: apt })}
          onComplete={(id) => handleCompleteAppointment(id)}
          onCancel={async (id, reason) => {
            try {
              await appointmentsAPI.rejectAppointment(id, reason || 'Cancelled by doctor');
              await loadAppointments();
              emitNotificationsRefresh();
            } catch (e) {
              // show error via toast instead of native alert
              toast.error(e.message || 'Failed to cancel');
            }
          }}
        />

        {/* Reschedule Modal */}
        <RescheduleModal
          appointment={rescheduleModal.appointment}
          isOpen={rescheduleModal.isOpen}
          onClose={handleRescheduleClose}
          onReschedule={handleRescheduleSuccess}
          userType="doctor"
        />
      </div>
    </div>
  );
};

export default DoctorAppointmentsPage;
