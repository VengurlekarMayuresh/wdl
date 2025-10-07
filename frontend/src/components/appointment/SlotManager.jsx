import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Plus, Edit2, Trash2, Save, X, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { slotsAPI } from '@/services/api';
import { toast } from '@/components/ui/sonner';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

const SlotManager = ({ doctorId }) => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, slotId: null });

  // Debug logging
  useEffect(() => {
    console.log('SlotManager initialized with doctorId:', doctorId);
  }, [doctorId]);

  // Form states
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    duration: 30,
    consultationFee: 200,
    isAvailable: true,
  });

  useEffect(() => {
    loadSlots();
  }, []);

  const loadSlots = async () => {
    try {
      setLoading(true);
      setError('');
      const fetchedSlots = await slotsAPI.getMySlots();
      console.log('Loaded my slots:', fetchedSlots);
      setSlots(fetchedSlots);
    } catch (e) {
      console.error('Error loading slots:', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    try {
      const slotData = {
        dateTime: new Date(`${formData.date}T${formData.startTime}`),
        duration: formData.duration,
        consultationFee: formData.consultationFee,
        consultationType: 'in-person',
        isAvailable: true, // Explicitly set as available
        isBooked: false,   // Explicitly set as not booked
      };
      
      console.log('Creating slot with data:', slotData);
      const newSlot = await slotsAPI.createSlot(slotData);
      console.log('Created slot response:', newSlot);
      
      // Add to slots list and show success
      setSlots(prev => [...prev, newSlot]);
      setSuccess('Slot created successfully! It is now visible to patients.');
      setError('');
      setShowAddForm(false);
      resetForm();
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
    } catch (e) {
      console.error('Error creating slot:', e);
      setError(e.message);
      setSuccess('');
    }
  };

  const handleUpdateSlot = async (slotId, updates) => {
    try {
      const updatedSlot = await slotsAPI.updateSlot(slotId, updates);
      setSlots(prev => prev.map(slot => slot._id === slotId ? updatedSlot : slot));
      setEditingSlot(null);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    setConfirmDelete({ open: true, slotId });
  };

  const confirmDeleteYes = async () => {
    const slotId = confirmDelete.slotId;
    try {
      await slotsAPI.deleteSlot(slotId);
      setSlots(prev => prev.filter(slot => slot._id !== slotId));
      toast.success('Slot deleted');
    } catch (e) {
      setError(e.message);
      toast.error(e.message || 'Failed to delete slot');
    } finally {
      setConfirmDelete({ open: false, slotId: null });
    }
  };

  const resetForm = () => {
    setFormData({
      date: '',
      startTime: '',
      duration: 30,
      consultationFee: 200,
      isAvailable: true,
    });
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSlotStatus = (slot) => {
    if (!slot.isAvailable) return { text: 'Unavailable', variant: 'secondary' };
    if (slot.isBooked) return { text: 'Booked', variant: 'destructive' };
    if (slot.hasPendingRequest) return { text: 'Pending Request', variant: 'warning' };
    return { text: 'Available', variant: 'success' };
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
            <p className="text-sm text-muted-foreground">Cannot load slots without a valid doctor ID</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            <span className="ml-2">Loading slots...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Only show slots that are available; hide slots marked as unavailable
  const visibleSlots = Array.isArray(slots) ? slots.filter((slot) => slot.isAvailable) : [];

  return (
    <div className="space-y-6">
      <ConfirmDialog
        open={confirmDelete.open}
        title="Delete slot?"
        description="This will permanently remove the slot if it is not booked."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDeleteYes}
        onClose={() => setConfirmDelete({ open: false, slotId: null })}
      />
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Appointment Slots</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadSlots} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button onClick={() => setShowAddForm(true)} disabled={showAddForm}>
                <Plus className="h-4 w-4 mr-2" /> Add Slot
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md mb-4">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-600">{error}</span>
            </div>
          )}
          
          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md mb-4">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">{success}</span>
            </div>
          )}

          {/* Add Slot Form */}
          {showAddForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Add New Slot</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddSlot} className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
                    <Select value={formData.duration.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, duration: parseInt(value) }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Consultation Fee ($)</label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.consultationFee}
                      onChange={(e) => setFormData(prev => ({ ...prev, consultationFee: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="md:col-span-3 flex gap-2">
                    <Button type="submit" className="flex-1">
                      <Save className="h-4 w-4 mr-2" /> Save Slot
                    </Button>
                    <Button type="button" variant="outline" onClick={() => {
                      setShowAddForm(false);
                      resetForm();
                    }}>
                      <X className="h-4 w-4 mr-2" /> Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Slots List */}
          <div className="space-y-4">
            {visibleSlots.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No appointment slots created yet.</p>
                <p className="text-sm">Add your first slot to start accepting appointments.</p>
              </div>
            ) : (
              visibleSlots.map((slot) => {
                const status = getSlotStatus(slot);
                return (
                  <Card key={slot._id} className="border-none shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{formatDateTime(slot.dateTime)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {slot.duration} minutes
                            </span>
                          </div>
                          <Badge variant={status.variant} className="text-xs">
                            {status.text}
                          </Badge>
                          {slot.consultationFee && (
                            <Badge variant="outline" className="text-xs">
                              ${slot.consultationFee}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {slot.bookedBy && (
                            <span className="text-sm text-muted-foreground">
                              Patient: {slot.bookedBy.firstName} {slot.bookedBy.lastName}
                            </span>
                          )}
                          {!slot.isBooked && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingSlot(slot._id)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteSlot(slot._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Pending Request Alert */}
                      {slot.hasPendingRequest && (
                        <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-md">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-orange-600" />
                            <span className="text-sm text-orange-700">
                              Pending appointment request from a patient
                            </span>
                            <Button variant="outline" size="sm" className="ml-auto">
                              View Request
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SlotManager;