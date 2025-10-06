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
  const [duration, setDuration] = useState(30);
  const [consultationFee, setConsultationFee] = useState(200);

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
    if (!date || !startTime) {
      setError('Please fill in date and start time');
      return;
    }

    try {
      setCreateLoading(true);
      setError('');
      setSuccess('');

      // Create the slot data (endTime will be calculated by backend)
      const slotData = {
        dateTime: new Date(`${date}T${startTime}`),
        duration: duration,
        consultationType: 'in-person',
        consultationFee: consultationFee
      };

      console.log('Creating slot with data:', slotData);
      
      const newSlot = await slotsAPI.createSlot(slotData);
      console.log('Created slot response:', newSlot);

      // Add to local state
      setSlots(prev => [...prev, newSlot]);
      
      // Reset form
      setDate('');
      setStartTime('');
      setDuration(30);
      setConsultationFee(200);
      
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
              <select
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Consultation Fee ($)</label>
              <input
                type="number"
                value={consultationFee}
                onChange={(e) => setConsultationFee(parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="200.00"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={createSlot} 
              disabled={createLoading || !date || !startTime}
              className="flex-1 md:flex-initial bg-primary hover:bg-primary/90"
            >
              {createLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Creating Slot...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Slot
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={loadSlots} 
              disabled={loading}
              className="px-4"
            >
              {loading ? 'Refreshing...' : 'Refresh Slots'}
            </Button>
          </div>

          <p className="text-xs text-gray-500 mt-2">
            💡 Create slots for times when you're available to see patients. Duration is automatically calculated.
          </p>
        </CardContent>
      </Card>

      {/* Available Slots Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Available Appointment Slots
            </span>
            <Badge variant="outline" className="text-xs">
              {slots.filter(slot => slot.isAvailable && !slot.isBooked).length} available
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              <span className="ml-2">Loading slots...</span>
            </div>
          ) : slots.filter(slot => slot.isAvailable && !slot.isBooked).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No available slots</p>
              <p className="text-sm">Create new appointment slots above for patients to book</p>
            </div>
          ) : (
            <div className="space-y-3">
              {slots
                .filter(slot => slot.isAvailable && !slot.isBooked)
                .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
                .map((slot) => (
                <div key={slot._id} className="flex items-center justify-between p-4 border-2 border-green-100 rounded-lg bg-green-50/30 hover:bg-green-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {new Date(slot.dateTime).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {new Date(slot.dateTime).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        {slot.duration && (
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {slot.duration} min
                          </span>
                        )}
                        {slot.consultationFee && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            ${slot.consultationFee}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="success" className="bg-green-100 text-green-700 hover:bg-green-100">
                      Available for Booking
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteSlot(slot._id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {slots.filter(slot => slot.isBooked).length > 0 && (
                <div className="mt-6 pt-4 border-t">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Booked Slots ({slots.filter(slot => slot.isBooked).length})
                  </h4>
                  <p className="text-xs text-gray-500 mb-3">
                    These slots have appointments scheduled. Manage them in the Appointments tab.
                  </p>
                  <div className="space-y-2">
                    {slots
                      .filter(slot => slot.isBooked)
                      .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
                      .map((slot) => (
                      <div key={slot._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md bg-gray-50">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">
                            {formatDateTime(slot.dateTime)}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            Booked
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleSlotManager;