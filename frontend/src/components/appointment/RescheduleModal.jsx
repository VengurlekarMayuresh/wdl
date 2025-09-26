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
    if (!selectedSlot) {
      setError('Please select a new time slot');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await appointmentsAPI.rescheduleAppointment(
        appointment._id,
        selectedSlot._id,
        reason
      );
      
      // Notify parent component
      if (onReschedule) {
        onReschedule();
      }
      
      // Close modal and reset
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