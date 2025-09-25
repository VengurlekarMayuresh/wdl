import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Trash2, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { slotsAPI, doctorAPI } from '@/services/api';

const AdminSlotCleanupPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [allDoctors, setAllDoctors] = useState([]);
  const [doctorSlots, setDoctorSlots] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleting, setDeleting] = useState(false);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get all doctors
      const { doctors } = await doctorAPI.list({});
      setAllDoctors(doctors || []);
      
      // Get slots for each doctor
      const slotsData = {};
      let totalSlots = 0;
      
      for (const doctor of doctors || []) {
        try {
          const slots = await slotsAPI.getDoctorSlots(doctor._id);
          slotsData[doctor._id] = slots;
          totalSlots += slots.length;
        } catch (e) {
          console.log(`Failed to load slots for doctor ${doctor._id}:`, e);
          slotsData[doctor._id] = [];
        }
      }
      
      setDoctorSlots(slotsData);
      console.log(`Loaded ${totalSlots} total slots across ${doctors?.length || 0} doctors`);
      
    } catch (e) {
      console.error('Error loading data:', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated]);

  const deleteAllSlots = async () => {
    if (!confirm('⚠️ WARNING: This will delete ALL appointment slots from ALL doctors. This action cannot be undone. Are you sure?')) {
      return;
    }

    try {
      setDeleting(true);
      setError('');
      setSuccess('');

      let deletedCount = 0;
      let errorCount = 0;

      // Delete slots for each doctor
      for (const doctorId of Object.keys(doctorSlots)) {
        const slots = doctorSlots[doctorId];
        
        for (const slot of slots) {
          try {
            await slotsAPI.deleteSlot(slot._id);
            deletedCount++;
          } catch (e) {
            console.error(`Failed to delete slot ${slot._id}:`, e);
            errorCount++;
          }
        }
      }

      setSuccess(`Successfully deleted ${deletedCount} slots. ${errorCount > 0 ? `${errorCount} slots failed to delete.` : ''}`);
      
      // Reload data to reflect changes
      await loadAllData();
      
    } catch (e) {
      console.error('Error during bulk delete:', e);
      setError('Failed to delete slots: ' + e.message);
    } finally {
      setDeleting(false);
    }
  };

  const getTotalSlots = () => {
    return Object.values(doctorSlots).reduce((total, slots) => total + slots.length, 0);
  };

  const getAvailableSlots = () => {
    return Object.values(doctorSlots).reduce((total, slots) => {
      return total + slots.filter(slot => slot.isAvailable && !slot.isBooked).length;
    }, 0);
  };

  const getBookedSlots = () => {
    return Object.values(doctorSlots).reduce((total, slots) => {
      return total + slots.filter(slot => slot.isBooked).length;
    }, 0);
  };

  const getFutureSlots = () => {
    const now = new Date();
    return Object.values(doctorSlots).reduce((total, slots) => {
      return total + slots.filter(slot => new Date(slot.dateTime) > now).length;
    }, 0);
  };

  const getPastSlots = () => {
    const now = new Date();
    return Object.values(doctorSlots).reduce((total, slots) => {
      return total + slots.filter(slot => new Date(slot.dateTime) <= now).length;
    }, 0);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-light">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p>Please login to access admin functions</p>
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
            <h1 className="text-3xl font-bold text-foreground">Slot Cleanup Admin</h1>
            <p className="text-muted-foreground mt-1">
              Clean up and manage appointment slots across all doctors
            </p>
          </div>
          <Button onClick={loadAllData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>

        {/* Status Messages */}
        {error && (
          <Card className="mb-6 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <div>
                  <p className="font-semibold">Error:</p>
                  <p>{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {success && (
          <Card className="mb-6 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <div>
                  <p className="font-semibold">Success:</p>
                  <p>{success}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{allDoctors.length}</div>
              <div className="text-sm text-muted-foreground">Doctors</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-secondary-foreground">{getTotalSlots()}</div>
              <div className="text-sm text-muted-foreground">Total Slots</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{getAvailableSlots()}</div>
              <div className="text-sm text-muted-foreground">Available</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{getBookedSlots()}</div>
              <div className="text-sm text-muted-foreground">Booked</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{getPastSlots()}</div>
              <div className="text-sm text-muted-foreground">Past Slots</div>
            </CardContent>
          </Card>
        </div>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Delete All Appointment Slots</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This will permanently delete all appointment slots from all doctors in the system. 
                  This includes past, present, and future appointments. This action cannot be undone.
                </p>
                <Button 
                  variant="destructive" 
                  onClick={deleteAllSlots}
                  disabled={deleting || loading || getTotalSlots() === 0}
                >
                  {deleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Deleting All Slots...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete All {getTotalSlots()} Slots
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Doctor Slots Breakdown */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Slots by Doctor</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading doctor slots...</p>
            ) : allDoctors.length === 0 ? (
              <p className="text-muted-foreground">No doctors found</p>
            ) : (
              <div className="space-y-4">
                {allDoctors.map((doctor) => {
                  const slots = doctorSlots[doctor._id] || [];
                  const availableSlots = slots.filter(slot => slot.isAvailable && !slot.isBooked);
                  const bookedSlots = slots.filter(slot => slot.isBooked);
                  const futureSlots = slots.filter(slot => new Date(slot.dateTime) > new Date());
                  
                  return (
                    <div key={doctor._id} className="p-4 border rounded-md">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">
                            Dr. {doctor.userId.firstName} {doctor.userId.lastName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {doctor.primarySpecialty} • {doctor.userId.email}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline">{slots.length} total</Badge>
                          <Badge variant="success">{availableSlots.length} available</Badge>
                          <Badge variant="destructive">{bookedSlots.length} booked</Badge>
                          <Badge variant="secondary">{futureSlots.length} future</Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mt-8 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-600">Next Steps After Cleanup</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>1. <strong>Delete all slots</strong> using the button above</p>
              <p>2. <strong>Login as a doctor</strong> and use the SlotManager component to create new slots</p>
              <p>3. <strong>New slots will be immediately visible</strong> to patients on the doctor profile page</p>
              <p>4. <strong>Patients can book appointments</strong> which will send requests to doctors</p>
              <p>5. <strong>Doctors can approve/reject</strong> appointment requests through their dashboard</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSlotCleanupPage;