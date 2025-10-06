import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Pill, Activity, Heart, Stethoscope } from 'lucide-react';
import { doctorPatientsAPI } from '@/services/api';

const PatientProfileDialog = ({ open, onClose, patientId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [patient, setPatient] = useState(null);

  // Health overview form state
  const [health, setHealth] = useState({
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    heartRate: '',
    weight: '',
    height: '',
    bloodSugar: '',
  });

  // Medications
  const [medications, setMedications] = useState([]);
  const [newMed, setNewMed] = useState({ name: '', dosage: '', frequency: '' });
  const [savingHealth, setSavingHealth] = useState(false);
  const [savingMed, setSavingMed] = useState(false);
  const [editingMedId, setEditingMedId] = useState(null);
  const [medEdits, setMedEdits] = useState({ dosage: '', frequency: '', isActive: true, notes: '' });

  useEffect(() => {
    if (open && patientId) {
      loadPatient();
    }
  }, [open, patientId]);

  const loadPatient = async () => {
    try {
      setLoading(true);
      setError('');
      const p = await doctorPatientsAPI.getPatientProfile(patientId);
      setPatient(p);

      // Initialize health from patient data when present
      setHealth({
        bloodPressureSystolic: p?.vitalSigns?.bloodPressure?.systolic || '',
        bloodPressureDiastolic: p?.vitalSigns?.bloodPressure?.diastolic || '',
        heartRate: p?.vitalSigns?.heartRate?.value || '',
        weight: p?.vitalSigns?.weight?.value || '',
        height: p?.vitalSigns?.height?.value || '',
        bloodSugar: p?.customVitals?.bloodSugar?.value || '',
      });

      setMedications(p?.medications?.current || []);
    } catch (e) {
      console.error('Failed to load patient profile:', e);
      setError(e.message || 'Failed to load patient');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHealth = async () => {
    try {
      setSavingHealth(true);
      setError('');
      await doctorPatientsAPI.updateHealthOverview(patientId, health);
      await loadPatient();
    } catch (e) {
      setError(e.message || 'Failed to save health overview');
    } finally {
      setSavingHealth(false);
    }
  };

  const handleAddMedication = async () => {
    if (!newMed.name) {
      setError('Medication name is required');
      return;
    }
    try {
      setSavingMed(true);
      setError('');
      const med = await doctorPatientsAPI.addMedication(patientId, newMed);
      setMedications(prev => [...prev, med]);
      setNewMed({ name: '', dosage: '', frequency: '' });
    } catch (e) {
      setError(e.message || 'Failed to add medication');
    } finally {
      setSavingMed(false);
    }
  };

  const startEditMedication = (med) => {
    setEditingMedId(med._id);
    setMedEdits({
      dosage: med.dosage || '',
      frequency: med.frequency || '',
      isActive: med.isActive !== false,
      notes: med.notes || '',
    });
  };

  const saveEditMedication = async () => {
    try {
      setSavingMed(true);
      setError('');
      const updated = await doctorPatientsAPI.updateMedication(patientId, editingMedId, medEdits);
      setMedications(prev => prev.map(m => (m._id === editingMedId ? { ...m, ...updated } : m)));
      setEditingMedId(null);
    } catch (e) {
      setError(e.message || 'Failed to update medication');
    } finally {
      setSavingMed(false);
    }
  };

  const closeDialog = () => {
    setError('');
    setEditingMedId(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && closeDialog()}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Patient Profile</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md mb-3">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-600">{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-8 text-center">Loading profile...</div>
        ) : patient ? (
          <div className="space-y-6">
            {/* Basic Info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-semibold">
                      {patient.userId?.firstName} {patient.userId?.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {patient.userId?.email} • {patient.userId?.phone}
                    </div>
                  </div>
                  <Badge variant="secondary">DOB: {patient.userId?.dateOfBirth ? new Date(patient.userId.dateOfBirth).toLocaleDateString() : '—'}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Medical History (read-only) */}
            {Array.isArray(patient.medicalHistory?.currentConditions) && patient.medicalHistory.currentConditions.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Stethoscope className="h-4 w-4 text-muted-foreground" />
                    <div className="font-medium">Medical History</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {patient.medicalHistory.currentConditions.map((c, idx) => (
                      <Badge key={idx} variant="outline">{c.condition}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Health Overview (editable) */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <div className="font-medium">Health Overview</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">BP Systolic</Label>
                    <Input value={health.bloodPressureSystolic} onChange={(e) => setHealth(h => ({ ...h, bloodPressureSystolic: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">BP Diastolic</Label>
                    <Input value={health.bloodPressureDiastolic} onChange={(e) => setHealth(h => ({ ...h, bloodPressureDiastolic: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Heart Rate</Label>
                    <Input value={health.heartRate} onChange={(e) => setHealth(h => ({ ...h, heartRate: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Weight</Label>
                    <Input value={health.weight} onChange={(e) => setHealth(h => ({ ...h, weight: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Height</Label>
                    <Input value={health.height} onChange={(e) => setHealth(h => ({ ...h, height: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Blood Sugar</Label>
                    <Input value={health.bloodSugar} onChange={(e) => setHealth(h => ({ ...h, bloodSugar: e.target.value }))} />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSaveHealth} disabled={savingHealth}>{savingHealth ? 'Saving...' : 'Save Health Overview'}</Button>
                </div>
              </CardContent>
            </Card>

            {/* Medications (editable) */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Pill className="h-4 w-4 text-muted-foreground" />
                  <div className="font-medium">Medications</div>
                </div>

                {/* Existing Medications List */}
                <div className="space-y-2">
                  {medications.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No current medications</div>
                  ) : medications.map((m) => (
                    <div key={m._id} className="border rounded-md p-3">
                      {editingMedId === m._id ? (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
                          <div>
                            <Label className="text-xs">Dosage</Label>
                            <Input value={medEdits.dosage} onChange={(e) => setMedEdits(s => ({ ...s, dosage: e.target.value }))} />
                          </div>
                          <div>
                            <Label className="text-xs">Frequency</Label>
                            <Input value={medEdits.frequency} onChange={(e) => setMedEdits(s => ({ ...s, frequency: e.target.value }))} />
                          </div>
                          <div>
                            <Label className="text-xs">Notes</Label>
                            <Input value={medEdits.notes} onChange={(e) => setMedEdits(s => ({ ...s, notes: e.target.value }))} />
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={saveEditMedication} disabled={savingMed}>Save</Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingMedId(null)}>Cancel</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{m.name}</div>
                            <div className="text-sm text-muted-foreground">{m.dosage || '—'} • {m.frequency || '—'}</div>
                          </div>
                          <div className="flex gap-2 items-center">
                            <Badge variant={m.isActive ? 'success' : 'secondary'}>{m.isActive ? 'Active' : 'Inactive'}</Badge>
                            <Button size="sm" variant="outline" onClick={() => startEditMedication(m)}>Edit</Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add Medication */}
                <div className="pt-3 border-t space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs">Name</Label>
                      <Input value={newMed.name} onChange={(e) => setNewMed(v => ({ ...v, name: e.target.value }))} />
                    </div>
                    <div>
                      <Label className="text-xs">Dosage</Label>
                      <Input value={newMed.dosage} onChange={(e) => setNewMed(v => ({ ...v, dosage: e.target.value }))} />
                    </div>
                    <div>
                      <Label className="text-xs">Frequency</Label>
                      <Input value={newMed.frequency} onChange={(e) => setNewMed(v => ({ ...v, frequency: e.target.value }))} />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleAddMedication} disabled={savingMed}>{savingMed ? 'Adding...' : 'Add Medication'}</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button variant="outline" onClick={closeDialog}>Close</Button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">No patient data</div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PatientProfileDialog;
