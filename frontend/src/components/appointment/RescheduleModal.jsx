import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { slotsAPI, appointmentsAPI } from '@/services/api';
import { toast } from '@/components/ui/sonner';
import { emitNotificationsRefresh } from '@/services/notifications';

const RescheduleModal = ({ 
  appointment, 
  isOpen, 
  onClose, 
  onReschedule,
  trigger, 
  userType = 'patient' 
}) => {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState('');
  const [newDateTime, setNewDateTime] = useState('');
  const [newDuration, setNewDuration] = useState(30);
  const [creatingSlot, setCreatingSlot] = useState(false);

  useEffect(() => {
    if (isOpen && appointment) {
      loadAvailableSlots();
    }
  }, [isOpen, appointment]);

  const loadAvailableSlots = async () => {
    try {
      setSlotsLoading(true);
      setError('');
      
      // Get available slots for this doctor
      const slots = await slotsAPI.getDoctorSlots(
        appointment.doctorId._id || appointment.doctorId
      );
      
      // Filter out past slots and current appointment slot
      const futureSlots = slots.filter(slot => {
        const slotDate = new Date(slot.dateTime);
        const now = new Date();
        const isNotCurrent = slot._id !== (appointment.slotId._id || appointment.slotId);
        const isFuture = slotDate > now;
        const isAvailable = slot.isAvailable && !slot.isBooked;
        
        return isNotCurrent && isFuture && isAvailable;
      });
      
      setAvailableSlots(futureSlots);
    } catch (e) {
      console.error('Error loading available slots:', e);
      setError(e.message);
      setAvailableSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleReschedule = async () => {
    try {
      setLoading(true);
      setError('');

      if (userType === 'patient') {
        if (!reason || !reason.trim()) {
          setError('Please provide a reason for rescheduling.');
          return;
        }
        // For patients: propose a reschedule on the existing appointment
        if (!selectedSlot && !newDateTime) {
          setError('Please select a slot or request a specific time');
          return;
        }
        if (selectedSlot) {
          await appointmentsAPI.proposeReschedule(appointment._id, {
            proposedSlotId: selectedSlot._id,
            reason,
          });
        } else if (newDateTime) {
          const iso = new Date(newDateTime).toISOString();
          await appointmentsAPI.proposeReschedule(appointment._id, {
            proposedDateTime: iso,
            reason,
          });
        }
        toast.success('Reschedule request sent. The doctor will approve or reject.');
        emitNotificationsRefresh();
        onReschedule?.();
        handleClose();
        return;
      }

      // For doctors: propose reschedule (requires patient approval)
      if (!reason || !reason.trim()) {
        setError('Please provide a reason for rescheduling.');
        return;
      }
      if (!selectedSlot && !newDateTime) {
        setError('Please select a slot or specify a time');
        return;
      }
      try {
        if (selectedSlot) {
          await appointmentsAPI.proposeReschedule(appointment._id, {
            proposedSlotId: selectedSlot._id,
            reason,
          });
        } else if (newDateTime) {
          const iso = new Date(newDateTime).toISOString();
          await appointmentsAPI.proposeReschedule(appointment._id, {
            proposedDateTime: iso,
            reason,
          });
        }
      } catch (e) {
        // Backend route not available: fall back to creating a pending request via bookAppointment
        if (selectedSlot) {
          await appointmentsAPI.bookAppointment({
            slotId: selectedSlot._id,
            forAppointmentId: appointment._id,
            requestedBy: 'doctor',
            patientId: appointment.patientId?._id || appointment.patientId,
            reasonForVisit: `Doctor reschedule request for appointment ${appointment._id}${reason ? `: ${reason}` : ''}`,
          });
        } else if (newDateTime) {
          const iso = new Date(newDateTime).toISOString();
          await appointmentsAPI.bookAppointment({
            doctorId: appointment.doctorId?._id || appointment.doctorId,
            patientId: appointment.patientId?._id || appointment.patientId,
            requestedDateTime: iso,
            forAppointmentId: appointment._id,
            requestedBy: 'doctor',
            reasonForVisit: `Doctor reschedule request for appointment ${appointment._id}${reason ? `: ${reason}` : ''}`,
            appointmentType: 'consultation',
          });
        }
      }
      toast.success('Reschedule proposal sent to patient for approval');
      emitNotificationsRefresh();
      onReschedule?.();
      handleClose();
    } catch (e) {
      console.error('Error rescheduling appointment:', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedSlot(null);
    setReason('');
    setError('');
    onClose();
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

  const SlotCard = ({ slot }) => {
    const { date, time } = formatDateTime(slot.dateTime);
    const isSelected = selectedSlot?._id === slot._id;
    
    return (
      <Card 
        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
          isSelected 
            ? 'ring-2 ring-primary border-primary bg-primary/5' 
            : 'border hover:border-primary/50'
        }`}
        onClick={() => setSelectedSlot(slot)}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{time}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {slot.type && (
                <Badge variant="outline" className="text-xs">
                  {slot.type}
                </Badge>
              )}
              {isSelected && (
                <Badge variant="success" className="text-xs">
                  Selected
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Reschedule Appointment</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Current Appointment Info */}
          {appointment && (
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-medium mb-2">Current Appointment</h4>
              <div className="text-sm text-muted-foreground">
                <p>
                  <strong>Doctor:</strong> Dr. {appointment.doctorId?.userId?.firstName} {appointment.doctorId?.userId?.lastName}
                </p>
                <p>
                  <strong>Date & Time:</strong> {formatDateTime(appointment.slotId?.dateTime || appointment.appointmentDate).date} at {formatDateTime(appointment.slotId?.dateTime || appointment.appointmentDate).time}
                </p>
                <p>
                  <strong>Status:</strong> 
                  <Badge variant={appointment.status === 'confirmed' ? 'success' : 'warning'} className="ml-2 text-xs">
                    {appointment.status}
                  </Badge>
                </p>
              </div>
            </div>
          )}

          {/* Reason for Reschedule */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for rescheduling (optional)</Label>
            <Textarea
              id="reason"
              placeholder="Please provide a reason for rescheduling this appointment..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-600">{error}</span>
            </div>
          )}

          {/* Available Slots */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Select new appointment time</Label>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadAvailableSlots}
                disabled={slotsLoading}
              >
                <RefreshCw className={`h-4 w-4 ${slotsLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            
            {slotsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                <span className="ml-2">Loading available slots...</span>
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No available slots found</p>
                <p className="text-sm">Please try again later or contact the doctor's office</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {availableSlots.map((slot) => (
                  <SlotCard key={slot._id} slot={slot} />
                ))}
              </div>
            )}
          </div>

          {/* Patient: request a specific time (custom) OR Doctor: create custom slot */}
          <div className="space-y-3 pt-4 border-t">
            <Label>{userType === 'doctor' ? 'Create a new slot (custom)' : 'Request a specific time (custom)'}</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <Label htmlFor="newDateTime" className="text-xs text-muted-foreground">Date & Time</Label>
                  <Input 
                    id="newDateTime" 
                    type="datetime-local" 
                    value={newDateTime} 
                    onChange={(e) => setNewDateTime(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="newDuration" className="text-xs text-muted-foreground">Duration (min)</Label>
                  <Input 
                    id="newDuration" 
                    type="number" 
                    min={5}
                    step={5}
                    value={newDuration}
                    onChange={(e) => setNewDuration(parseInt(e.target.value || '30'))}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                {userType === 'doctor' ? (
                  <Button 
                    variant="outline"
                    onClick={async () => {
                      try {
                        setCreatingSlot(true);
                        setError('');
                        if (!newDateTime) {
                          setError('Please select a date and time to create a new slot');
                          return;
                        }
                        const slot = await slotsAPI.createSlot({ dateTime: newDateTime, duration: newDuration });
                        // Propose using the newly created slot; patient must approve
                        await appointmentsAPI.proposeReschedule(appointment._id, {
                          proposedSlotId: slot._id,
                          reason,
                        });
                        toast.success('Reschedule proposal sent to patient for approval');
                        emitNotificationsRefresh();
                        onReschedule?.();
                        handleClose();
                      } catch (e) {
                        console.error('Error creating slot and proposing reschedule:', e);
                        setError(e.message);
                      } finally {
                        setCreatingSlot(false);
                      }
                    }}
                    disabled={creatingSlot || !newDateTime}
                  >
                    {creatingSlot ? 'Creating slot...' : 'Create slot & propose'}
                  </Button>
                ) : (
                  <Button 
                    variant="outline"
                    onClick={async () => {
                      try {
                        setCreatingSlot(true);
                        setError('');
                        if (!newDateTime) {
                          setError('Please select a date and time to request');
                          return;
                        }
                        const iso = new Date(newDateTime).toISOString();
                        await appointmentsAPI.bookAppointment({
                          doctorId: appointment.doctorId?._id || appointment.doctorId,
                          requestedDateTime: iso,
                          reasonForVisit: `Reschedule request for appointment ${appointment._id}${reason ? `: ${reason}` : ''}`,
                          appointmentType: 'consultation'
                        });
                        toast.success('Reschedule request sent for your custom time');
                        emitNotificationsRefresh();
                        onReschedule?.();
                        handleClose();
                      } catch (e) {
                        console.error('Error requesting custom reschedule:', e);
                        setError(e.message);
                      } finally {
                        setCreatingSlot(false);
                      }
                    }}
                    disabled={creatingSlot || !newDateTime}
                  >
                    {creatingSlot ? 'Requesting...' : 'Request custom time'}
                  </Button>
                )}
              </div>
            </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button 
              onClick={handleReschedule} 
              disabled={loading || !selectedSlot}
              className="flex-1"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Rescheduling...
                </>
              ) : (
                'Reschedule Appointment'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RescheduleModal;