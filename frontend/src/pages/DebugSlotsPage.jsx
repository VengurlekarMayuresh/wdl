import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { slotsAPI } from '@/services/api';
import { Calendar, Clock, Plus, RefreshCw } from 'lucide-react';

const DebugSlotsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [allSlots, setAllSlots] = useState([]);
  const [mySlots, setMySlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Create slot form
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    type: 'consultation',
  });

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (user?.userType === 'doctor') {
        // Load my slots if I'm a doctor
        const mySlotData = await slotsAPI.getMySlots();
        console.log('My slots:', mySlotData);
        setMySlots(mySlotData);
        
        // Also load public view of my slots
        const publicSlots = await slotsAPI.getDoctorSlots(user._id || user.id);
        console.log('Public view of my slots:', publicSlots);
        setAllSlots(publicSlots);
      }
      
    } catch (e) {
      console.error('Error loading slots:', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated, user]);

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    try {
      const slotData = {
        ...formData,
        dateTime: new Date(`${formData.date}T${formData.startTime}`),
        endTime: formData.endTime,
        isAvailable: true,
        isBooked: false,
      };
      
      console.log('Creating slot with data:', slotData);
      const newSlot = await slotsAPI.createSlot(slotData);
      console.log('Created slot response:', newSlot);
      
      // Refresh data
      await loadAllData();
      
      // Reset form
      setFormData({
        date: '',
        startTime: '',
        endTime: '',
        type: 'consultation',
      });
      
    } catch (e) {
      console.error('Error creating slot:', e);
      setError('Failed to create slot: ' + e.message);
    }
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-light">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p>Please login to access slot debugging</p>
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
            <h1 className="text-3xl font-bold text-foreground">Slots Debug Page</h1>
            <p className="text-muted-foreground mt-1">
              User: {user?.firstName} {user?.lastName} ({user?.userType})
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={loadAllData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {user?.userType === 'doctor' && (
              <Button 
                variant="destructive" 
                onClick={async () => {
                  if (confirm('Delete all your slots?')) {
                    try {
                      await Promise.all(mySlots.map(slot => slotsAPI.deleteSlot(slot._id)));
                      await loadAllData();
                    } catch (e) {
                      setError('Failed to clear slots: ' + e.message);
                    }
                  }
                }}
                disabled={loading || mySlots.length === 0}
              >
                Clear All Slots
              </Button>
            )}
          </div>
        </div>

        {error && (
          <Card className="mb-6 border-red-200">
            <CardContent className="p-4">
              <div className="text-red-600">
                <p className="font-semibold">Error:</p>
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Create Slot Form (for doctors only) */}
          {user?.userType === 'doctor' && (
            <Card>
              <CardHeader>
                <CardTitle>Create New Slot</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateSlot} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Date</label>
                    <Input
                      type="date"
                      value={formData.date}
                      min={getTodayDate()}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Time</label>
                    <Input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Time</label>
                    <Input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Type</label>
                    <select 
                      className="w-full px-3 py-2 border border-input rounded-md text-sm"
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    >
                      <option value="consultation">Consultation</option>
                      <option value="follow-up">Follow-up</option>
                      <option value="emergency">Emergency</option>
                      <option value="routine-checkup">Routine Checkup</option>
                    </select>
                  </div>
                  <Button type="submit" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Slot
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Slots Data Display */}
          <div className="space-y-6">
            {/* My Slots (Doctor View) */}
            {user?.userType === 'doctor' && (
              <Card>
                <CardHeader>
                  <CardTitle>My Slots (Doctor View)</CardTitle>
                  <p className="text-sm text-muted-foreground">What I see in my dashboard</p>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p>Loading...</p>
                  ) : mySlots.length === 0 ? (
                    <p className="text-muted-foreground">No slots created yet</p>
                  ) : (
                    <div className="space-y-2">
                      {mySlots.map((slot) => (
                        <div key={slot._id} className="p-3 border rounded-md">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {new Date(slot.dateTime).toLocaleDateString()} at{' '}
                                {new Date(slot.dateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Badge variant={slot.isAvailable ? 'success' : 'secondary'}>
                                {slot.isAvailable ? 'Available' : 'Not Available'}
                              </Badge>
                              <Badge variant={slot.isBooked ? 'destructive' : 'secondary'}>
                                {slot.isBooked ? 'Booked' : 'Not Booked'}
                              </Badge>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-muted-foreground">
                            ID: {slot._id} | Type: {slot.type}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Public Slots View */}
            <Card>
              <CardHeader>
                <CardTitle>Public Slots View</CardTitle>
                <p className="text-sm text-muted-foreground">What patients see</p>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p>Loading...</p>
                ) : allSlots.length === 0 ? (
                  <p className="text-muted-foreground">No public slots available</p>
                ) : (
                  <div className="space-y-2">
                    {allSlots.map((slot) => (
                      <div key={slot._id} className="p-3 border rounded-md">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(slot.dateTime).toLocaleDateString()} at{' '}
                              {new Date(slot.dateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant={slot.isAvailable ? 'success' : 'secondary'}>
                              {slot.isAvailable ? 'Available' : 'Not Available'}
                            </Badge>
                            <Badge variant={slot.isBooked ? 'destructive' : 'secondary'}>
                              {slot.isBooked ? 'Booked' : 'Not Booked'}
                            </Badge>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          ID: {slot._id} | Type: {slot.type} | Future: {new Date(slot.dateTime) > new Date() ? 'Yes' : 'No'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugSlotsPage;