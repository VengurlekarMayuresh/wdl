import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, User, Stethoscope, MapPin, Phone, AlertCircle, CheckCircle, XCircle, MessageCircle, Star, Edit } from 'lucide-react';
import { appointmentsAPI } from '@/services/api';
import RescheduleModal from '@/components/appointment/RescheduleModal';

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

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const allAppointments = await appointmentsAPI.getMyAppointments();
      
      // Categorize appointments
      const categorized = {
        pending: allAppointments.filter(apt => apt.status === 'pending'),
        upcoming: allAppointments.filter(apt => apt.status === 'confirmed' && new Date(apt.slotId.dateTime) > new Date()),
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
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    
    try {
      await appointmentsAPI.cancelAppointment(appointmentId);
      loadAppointments(); // Refresh appointments
    } catch (e) {
      alert('Failed to cancel appointment: ' + e.message);
    }
  };

  const handleRescheduleAppointment = (appointment) => {
    setRescheduleModal({ isOpen: true, appointment });
  };

  const handleRescheduleSuccess = () => {
    setRescheduleModal({ isOpen: false, appointment: null });
    loadAppointments(); // Refresh appointments
    alert('Appointment rescheduled successfully!');
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

  const AppointmentCard = ({ appointment, showActions = false }) => {
    const doctor = appointment.doctorId;
    const slot = appointment.slotId;
    const { date, time } = formatDateTime(slot.dateTime);
    
    return (
      <Card className="border-none shadow-soft hover:shadow-medium transition-all duration-300">
        <CardContent className="p-6">
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
            {getStatusBadge(appointment.status)}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{date}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{time}</span>
            </div>
          </div>

          {appointment.reason && (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Reason:</span> {appointment.reason}
              </p>
            </div>
          )}

          {slot.type && (
            <div className="mb-4">
              <Badge variant="outline" className="text-xs">
                {slot.type}
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

          {showActions && appointment.status === 'pending' && (
            <div className="flex gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCancelAppointment(appointment._id)}
              >
                Cancel Request
              </Button>
            </div>
          )}

          {showActions && appointment.status === 'confirmed' && new Date(slot.dateTime) > new Date() && (
            <div className="flex gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRescheduleAppointment(appointment)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Reschedule
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCancelAppointment(appointment._id)}
              >
                Cancel Appointment
              </Button>
              {doctor.userId.phone && (
                <Button variant="ghost" size="sm">
                  <Phone className="h-4 w-4 mr-1" />
                  Contact
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-light">
        <Header />
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
      <Header />
      
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
            <div className="space-y-4">
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
                    showActions={true} 
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            <div className="space-y-4">
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
                    showActions={true} 
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            <div className="space-y-4">
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
                  <AppointmentCard key={appointment._id} appointment={appointment} />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="cancelled" className="mt-6">
            <div className="space-y-4">
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
                  <AppointmentCard key={appointment._id} appointment={appointment} />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
        
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

export default PatientAppointmentsPage;
