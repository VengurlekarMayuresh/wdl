import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Stethoscope, AlertCircle, CheckCircle } from 'lucide-react';
import { appointmentsAPI } from '@/services/api';

const BookingModal = ({ 
  doctor,
  slot,
  isOpen, 
  onClose, 
  onBookingSuccess,
  trigger 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    appointmentType: 'consultation',
    reasonForVisit: '',
    symptoms: '',
    relevantMedicalHistory: '',
    currentMedications: [],
    allergies: [],
    contactPreferences: {
      email: true,
      sms: true,
      call: false
    }
  });
  
  // Medication form state
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: '',
    notes: ''
  });
  
  // Allergy form state
  const [newAllergy, setNewAllergy] = useState('');

  const appointmentTypeOptions = [
    { value: 'consultation', label: 'Consultation' },
    { value: 'follow-up', label: 'Follow-up' },
    { value: 'check-up', label: 'Check-up' },
    { value: 'procedure', label: 'Procedure' },
    { value: 'telemedicine', label: 'Telemedicine' }
  ];

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContactPreferenceChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      contactPreferences: {
        ...prev.contactPreferences,
        [field]: value
      }
    }));
  };

  const addMedication = () => {
    if (!newMedication.name.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      currentMedications: [...prev.currentMedications, { ...newMedication }]
    }));
    
    setNewMedication({ name: '', dosage: '', frequency: '', notes: '' });
  };

  const removeMedication = (index) => {
    setFormData(prev => ({
      ...prev,
      currentMedications: prev.currentMedications.filter((_, i) => i !== index)
    }));
  };

  const addAllergy = () => {
    if (!newAllergy.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      allergies: [...prev.allergies, newAllergy.trim()]
    }));
    
    setNewAllergy('');
  };

  const removeAllergy = (index) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index)
    }));
  };

  const handleBooking = async () => {
    if (!formData.reasonForVisit.trim()) {
      setError('Please provide a reason for your visit');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const bookingData = {
        slotId: slot._id,
        appointmentType: formData.appointmentType,
        reasonForVisit: formData.reasonForVisit,
        symptoms: formData.symptoms,
        relevantMedicalHistory: formData.relevantMedicalHistory,
        currentMedications: formData.currentMedications,
        allergies: formData.allergies,
        contactPreferences: formData.contactPreferences
      };
      
      console.log('Booking appointment with data:', bookingData);
      
      const response = await appointmentsAPI.bookAppointment(bookingData);
      
      setSuccess('Appointment request sent successfully! The doctor will review your request.');
      
      // Notify parent component
      if (onBookingSuccess) {
        onBookingSuccess(response.appointment || response.data || response);
      }
      
      // Close modal after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);
      
    } catch (e) {
      console.error('Error booking appointment:', e);
      setError(e.message || 'Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setFormData({
      appointmentType: 'consultation',
      reasonForVisit: '',
      symptoms: '',
      relevantMedicalHistory: '',
      currentMedications: [],
      allergies: [],
      contactPreferences: {
        email: true,
        sms: true,
        call: false
      }
    });
    setNewMedication({ name: '', dosage: '', frequency: '', notes: '' });
    setNewAllergy('');
    setError('');
    setSuccess('');
    onClose();
  };

  if (!doctor || !slot) {
    return null;
  }

  const { date, time } = formatDateTime(slot.dateTime);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book Appointment</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Doctor and Slot Info */}
          <div className="p-4 bg-primary/5 rounded-lg border">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                {doctor.userId?.profilePicture ? (
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
                <h3 className="font-semibold text-lg">
                  Dr. {doctor.userId?.firstName} {doctor.userId?.lastName}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Stethoscope className="h-3 w-3" />
                  <span>{doctor.primarySpecialty}</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{time}</span>
              </div>
              {slot.duration && (
                <div className="text-muted-foreground">
                  <span className="font-medium">Duration:</span> {slot.duration} minutes
                </div>
              )}
              {slot.consultationFee && (
                <div className="text-muted-foreground">
                  <span className="font-medium">Fee:</span> ${slot.consultationFee}
                </div>
              )}
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">{success}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-600">{error}</span>
            </div>
          )}

          {/* Appointment Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="appointmentType">Appointment Type *</Label>
            <Select 
              value={formData.appointmentType} 
              onValueChange={(value) => handleInputChange('appointmentType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select appointment type" />
              </SelectTrigger>
              <SelectContent>
                {appointmentTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reason for Visit */}
          <div className="space-y-2">
            <Label htmlFor="reasonForVisit">Reason for Visit *</Label>
            <Textarea
              id="reasonForVisit"
              placeholder="Please describe the reason for your visit..."
              value={formData.reasonForVisit}
              onChange={(e) => handleInputChange('reasonForVisit', e.target.value)}
              rows={3}
              required
            />
          </div>

          {/* Symptoms */}
          <div className="space-y-2">
            <Label htmlFor="symptoms">Current Symptoms (optional)</Label>
            <Textarea
              id="symptoms"
              placeholder="Please describe any symptoms you're experiencing..."
              value={formData.symptoms}
              onChange={(e) => handleInputChange('symptoms', e.target.value)}
              rows={2}
            />
          </div>

          {/* Medical History */}
          <div className="space-y-2">
            <Label htmlFor="medicalHistory">Relevant Medical History (optional)</Label>
            <Textarea
              id="medicalHistory"
              placeholder="Please share any relevant medical history..."
              value={formData.relevantMedicalHistory}
              onChange={(e) => handleInputChange('relevantMedicalHistory', e.target.value)}
              rows={2}
            />
          </div>

          {/* Current Medications */}
          <div className="space-y-3">
            <Label>Current Medications (optional)</Label>
            
            {/* Add Medication Form */}
            <div className="border rounded-lg p-3 bg-muted/30">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <Input
                  placeholder="Medication name"
                  value={newMedication.name}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, name: e.target.value }))}
                />
                <Input
                  placeholder="Dosage"
                  value={newMedication.dosage}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, dosage: e.target.value }))}
                />
                <Input
                  placeholder="Frequency"
                  value={newMedication.frequency}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, frequency: e.target.value }))}
                />
              </div>
              <div className="flex gap-3">
                <Input
                  placeholder="Notes (optional)"
                  value={newMedication.notes}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, notes: e.target.value }))}
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={addMedication}
                  disabled={!newMedication.name.trim()}
                >
                  Add
                </Button>
              </div>
            </div>
            
            {/* Medications List */}
            {formData.currentMedications.length > 0 && (
              <div className="space-y-2">
                {formData.currentMedications.map((med, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <span className="font-medium">{med.name}</span>
                      {med.dosage && <span className="text-muted-foreground ml-2">({med.dosage})</span>}
                      {med.frequency && <span className="text-muted-foreground ml-2">- {med.frequency}</span>}
                      {med.notes && <div className="text-sm text-muted-foreground">{med.notes}</div>}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMedication(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Allergies */}
          <div className="space-y-3">
            <Label>Known Allergies (optional)</Label>
            
            <div className="flex gap-3">
              <Input
                placeholder="Add allergy"
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                className="flex-1"
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={addAllergy}
                disabled={!newAllergy.trim()}
              >
                Add
              </Button>
            </div>
            
            {formData.allergies.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.allergies.map((allergy, index) => (
                  <Badge key={index} variant="secondary" className="cursor-pointer">
                    {allergy}
                    <button
                      type="button"
                      onClick={() => removeAllergy(index)}
                      className="ml-2 text-red-600 hover:text-red-700"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Contact Preferences */}
          <div className="space-y-3">
            <Label>Contact Preferences</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="emailPref"
                  checked={formData.contactPreferences.email}
                  onChange={(e) => handleContactPreferenceChange('email', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="emailPref" className="text-sm">Email notifications</label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="smsPref"
                  checked={formData.contactPreferences.sms}
                  onChange={(e) => handleContactPreferenceChange('sms', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="smsPref" className="text-sm">SMS notifications</label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="callPref"
                  checked={formData.contactPreferences.call}
                  onChange={(e) => handleContactPreferenceChange('call', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="callPref" className="text-sm">Phone call notifications</label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button 
              onClick={handleBooking} 
              disabled={loading || !formData.reasonForVisit.trim()}
              className="flex-1"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Booking Appointment...
                </>
              ) : (
                'Book Appointment'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;