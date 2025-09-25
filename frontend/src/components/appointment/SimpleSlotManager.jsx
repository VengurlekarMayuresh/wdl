import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Plus, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { slotsAPI } from '@/services/api';

const SimpleSlotManager = ({ doctorId }) => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form data
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    if (doctorId) {
      loadSlots();
    }
  }, [doctorId]);

  const loadSlots = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Loading slots for doctor:', doctorId);
      
      const fetchedSlots = await slotsAPI.getMySlots();
      console.log('Fetched slots:', fetchedSlots);
      
      setSlots(Array.isArray(fetchedSlots) ? fetchedSlots : []);
    } catch (e) {
      console.error('Error loading slots:', e);
      setError(`Failed to load slots: ${e.message}`);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const createSlot = async () => {
    if (!date || !startTime || !endTime) {
      setError('Please fill in all fields (date, start time, end time)');
      return;
    }

    try {
      setCreateLoading(true);
      setError('');
      setSuccess('');

      // Create the slot data
      const slotData = {
        dateTime: new Date(`${date}T${startTime}`),
        endTime: endTime,
        type: 'consultation',
        isAvailable: true,
        isBooked: false
      };

      console.log('Creating slot with data:', slotData);
      
      const newSlot = await slotsAPI.createSlot(slotData);
      console.log('Created slot response:', newSlot);

      // Add to local state
      setSlots(prev => [...prev, newSlot]);
      
      // Reset form
      setDate('');
      setStartTime('');
      setEndTime('');
      
      setSuccess('✅ Slot created successfully! It is now visible to patients.');
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
      
    } catch (e) {
      console.error('Error creating slot:', e);
      setError(`Failed to create slot: ${e.message}`);
    } finally {
      setCreateLoading(false);
    }
  };

  const deleteSlot = async (slotId) => {
    if (!confirm('Are you sure you want to delete this slot?')) return;
    
    try {
      console.log('Deleting slot:', slotId);
      await slotsAPI.deleteSlot(slotId);
      setSlots(prev => prev.filter(slot => slot._id !== slotId));
      setSuccess('Slot deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      console.error('Error deleting slot:', e);
      setError(`Failed to delete slot: ${e.message}`);
    }
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  if (!doctorId) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <p className="text-red-600 font-medium">Error: Doctor ID not found</p>
            <p className="text-sm text-muted-foreground">
              Doctor ID: {doctorId || 'undefined'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Slot Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Create New Appointment Slot
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Messages */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-600">{error}</span>
            </div>
          )}
          
          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">{success}</span>
            </div>
          )}

          {/* Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Date *</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={getTodayDate()}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Start Time *</label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Time *</label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={createSlot} 
              disabled={createLoading || !date || !startTime || !endTime}
              className="flex-1 md:flex-initial"
            >
              {createLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Slot
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={loadSlots} 
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            <strong>Debug Info:</strong> Doctor ID: {doctorId}
          </div>
        </CardContent>
      </Card>

      {/* My Slots Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              My Appointment Slots ({slots.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              <span className="ml-2">Loading slots...</span>
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No appointment slots created yet</p>
              <p className="text-sm">Create your first slot above to start accepting appointments</p>
            </div>
          ) : (
            <div className="space-y-3">
              {slots.map((slot) => (
                <div key={slot._id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {formatDateTime(slot.dateTime)}
                      </span>
                    </div>
                    {slot.endTime && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Until {new Date(`1970-01-01T${slot.endTime}`).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    )}
                    <Badge variant={slot.isBooked ? 'destructive' : 'success'} className="text-xs">
                      {slot.isBooked ? 'Booked' : 'Available'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {slot.isBooked && slot.bookedBy && (
                      <span className="text-sm text-muted-foreground mr-2">
                        Patient: {slot.bookedBy.firstName} {slot.bookedBy.lastName}
                      </span>
                    )}
                    {!slot.isBooked && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSlot(slot._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleSlotManager;