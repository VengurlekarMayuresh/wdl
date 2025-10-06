import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
const [medEdits, setMedEdits] = useState({ dosage: '', frequency: '', isActive: true, notes: '', schedule: [] });

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
      schedule: Array.isArray(med.schedule) ? med.schedule : [],
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
          <Tabs defaultValue="overview" className="space-y-6">
<TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="edit">Edit</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-6">
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

            {/* Allergies (read-only) */}
            {Array.isArray(patient.allergies) && patient.allergies.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="h-4 w-4 text-red-600" />
                    <div className="font-medium">Allergies</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {patient.allergies.map((a, idx) => (
                      <Badge key={idx} variant="destructive">{a.allergen} ({a.severity})</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Medications (read-only) */}
            <Card>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Pill className="h-4 w-4 text-muted-foreground" />
                  <div className="font-medium">Current Medications</div>
                </div>
                {(!medications || medications.length === 0) ? (
                  <div className="text-sm text-muted-foreground">No current medications</div>
                ) : medications.map((m) => (
                  <div key={m._id} className="flex items-center justify-between border rounded-md p-2">
                    <div>
                      <div className="font-medium">{m.name}</div>
                      <div className="text-xs text-muted-foreground">{m.dosage || '—'} • {m.frequency || '—'}</div>
                    </div>
                    <Badge variant={m.isActive ? 'success' : 'secondary'}>{m.isActive ? 'Active' : 'Inactive'}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

</TabsContent>

            <TabsContent value="history" className="space-y-6">
              {/* Rich Medical History */}
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div>
                    <div className="font-medium mb-2 flex items-center gap-2">
                      <Stethoscope className="h-4 w-4 text-muted-foreground" /> Current Conditions
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(patient.medicalHistory?.currentConditions || []).map((c, idx) => (
                        <Badge key={idx} variant="outline">{c.condition} ({c.status || 'active'})</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium mb-2">Past Conditions</div>
                    <div className="grid gap-2 text-sm text-muted-foreground">
                      {(patient.medicalHistory?.pastConditions || []).map((c, idx) => (
                        <div key={idx}>{c.condition} {c.resolutionDate ? `(resolved ${new Date(c.resolutionDate).toLocaleDateString()})` : ''}</div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium mb-2">Surgeries</div>
                    <div className="grid gap-2 text-sm text-muted-foreground">
                      {(patient.medicalHistory?.surgeries || []).map((s, idx) => (
                        <div key={idx}>{s.procedure} {s.date ? `on ${new Date(s.date).toLocaleDateString()}` : ''}</div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium mb-2">Hospitalizations</div>
                    <div className="grid gap-2 text-sm text-muted-foreground">
                      {(patient.medicalHistory?.hospitalizations || []).map((h, idx) => (
                        <div key={idx}>{h.reason} {h.admissionDate ? `(${new Date(h.admissionDate).toLocaleDateString()}` : ''}{h.dischargeDate ? ` - ${new Date(h.dischargeDate).toLocaleDateString()})` : (h.admissionDate ? ')' : '')}</div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="edit" className="space-y-6">
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
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
                            <div>
                              <Label className="text-xs">Frequency (per day)</Label>
                              <Input type="number" min={1} max={6} value={medEdits.frequency || ''}
                                     onChange={(e) => setMedEdits(s => ({ ...s, frequency: e.target.value }))} />
                            </div>
                            <div>
                              <Label className="text-xs">Notes</Label>
                              <Input value={medEdits.notes} onChange={(e) => setMedEdits(s => ({ ...s, notes: e.target.value }))} />
                            </div>
                            <div className="flex gap-2 justify-end">
                              <Button size="sm" onClick={saveEditMedication} disabled={savingMed}>Save</Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingMedId(null)}>Cancel</Button>
                            </div>
                          </div>

                          {/* Schedule rows based on medEdits.frequency */}
                          {Number(medEdits.frequency) > 0 && (
                            <div className="space-y-2">
                              {Array.from({ length: Number(medEdits.frequency) }).map((_, idx) => (
                                <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                  <div>
                                    <Label className="text-xs">Time</Label>
                                    <Input type="time" value={medEdits.schedule?.[idx]?.time || ''}
                                           onChange={(e) => {
                                             const arr = [...(medEdits.schedule || [])];
                                             arr[idx] = { ...(arr[idx] || {}), time: e.target.value };
                                             setMedEdits(s => ({ ...s, schedule: arr }));
                                           }} />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Meal</Label>
                                    <select className="w-full px-3 py-2 border rounded-md text-sm" value={medEdits.schedule?.[idx]?.mealRelation || ''}
                                            onChange={(e) => {
                                              const arr = [...(medEdits.schedule || [])];
                                              arr[idx] = { ...(arr[idx] || {}), mealRelation: e.target.value };
                                              setMedEdits(s => ({ ...s, schedule: arr }));
                                            }}>
                                      <option value="">Select</option>
                                      <option value="pre-breakfast">Pre-breakfast</option>
                                      <option value="post-breakfast">Post-breakfast</option>
                                      <option value="pre-lunch">Pre-lunch</option>
                                      <option value="post-lunch">Post-lunch</option>
                                      <option value="pre-dinner">Pre-dinner</option>
                                      <option value="post-dinner">Post-dinner</option>
                                      <option value="with-meal">With meal</option>
                                      <option value="empty-stomach">Empty stomach</option>
                                      <option value="other">Other</option>
                                    </select>
                                  </div>
                                  <div>
                                    <Label className="text-xs">Quantity/Dosage</Label>
                                    <Input placeholder="e.g., 1 tablet" value={medEdits.schedule?.[idx]?.quantity || ''}
                                           onChange={(e) => {
                                             const arr = [...(medEdits.schedule || [])];
                                             arr[idx] = { ...(arr[idx] || {}), quantity: e.target.value };
                                             setMedEdits(s => ({ ...s, schedule: arr }));
                                           }} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{m.name}</div>
                            <div className="text-sm text-muted-foreground">{m.frequency ? `${m.frequency}x/day` : (m.dosage || '—')}</div>
                          </div>
                          <div className="flex gap-2 items-center">
                            <Badge variant={m.isActive ? 'success' : 'secondary'}>{m.isActive ? 'Active' : 'Inactive'}</Badge>
                            <Button size="sm" variant="outline" onClick={() => startEditMedication(m)}>Edit</Button>
                            <Button size="sm" variant="destructive" onClick={async () => {
                              try {
                                setSavingMed(true);
                                await doctorPatientsAPI.deleteMedication(patientId, m._id);
                                setMedications(prev => prev.filter(x => x._id !== m._id));
                              } catch (e) {
                                setError(e.message || 'Failed to delete medication');
                              } finally {
                                setSavingMed(false);
                              }
                            }}>Delete</Button>
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
                      <Label className="text-xs">Frequency (per day)</Label>
                      <Input type="number" min={1} max={6} value={newMed.frequency || ''}
                             onChange={(e) => setNewMed(v => ({ ...v, frequency: e.target.value }))} />
                    </div>
                    <div>
                      <Label className="text-xs">Notes</Label>
                      <Input value={newMed.notes || ''} onChange={(e) => setNewMed(v => ({ ...v, notes: e.target.value }))} />
                    </div>
                  </div>

                  {/* Schedule rows based on frequency */}
                  {Number(newMed.frequency) > 0 && (
                    <div className="space-y-2">
                      {Array.from({ length: Number(newMed.frequency) }).map((_, idx) => (
                        <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <div>
                            <Label className="text-xs">Time</Label>
                            <Input type="time" value={newMed.schedule?.[idx]?.time || ''}
                                   onChange={(e) => {
                                     const arr = [...(newMed.schedule || [])];
                                     arr[idx] = { ...(arr[idx] || {}), time: e.target.value };
                                     setNewMed(v => ({ ...v, schedule: arr }));
                                   }} />
                          </div>
                          <div>
                            <Label className="text-xs">Meal</Label>
                            <select className="w-full px-3 py-2 border rounded-md text-sm" value={newMed.schedule?.[idx]?.mealRelation || ''}
                                    onChange={(e) => {
                                      const arr = [...(newMed.schedule || [])];
                                      arr[idx] = { ...(arr[idx] || {}), mealRelation: e.target.value };
                                      setNewMed(v => ({ ...v, schedule: arr }));
                                    }}>
                              <option value="">Select</option>
                              <option value="pre-breakfast">Pre-breakfast</option>
                              <option value="post-breakfast">Post-breakfast</option>
                              <option value="pre-lunch">Pre-lunch</option>
                              <option value="post-lunch">Post-lunch</option>
                              <option value="pre-dinner">Pre-dinner</option>
                              <option value="post-dinner">Post-dinner</option>
                              <option value="with-meal">With meal</option>
                              <option value="empty-stomach">Empty stomach</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                          <div>
                            <Label className="text-xs">Quantity/Dosage</Label>
                            <Input placeholder="e.g., 1 tablet" value={newMed.schedule?.[idx]?.quantity || ''}
                                   onChange={(e) => {
                                     const arr = [...(newMed.schedule || [])];
                                     arr[idx] = { ...(arr[idx] || {}), quantity: e.target.value };
                                     setNewMed(v => ({ ...v, schedule: arr }));
                                   }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <div className="text-xs text-muted-foreground">Specify dosage per timing above. No separate dosage field needed.</div>
                    <div className="flex gap-2">
                      <Button onClick={async () => {
                        try {
                          setSavingMed(true);
                          setError('');
                          const payload = { 
                            name: newMed.name,
                            frequency: newMed.frequency,
                            notes: newMed.notes,
                            schedule: newMed.schedule || []
                          };
                          const med = await doctorPatientsAPI.addMedication(patientId, payload);
                          setMedications(prev => [...prev, med]);
                          setNewMed({ name: '', frequency: '', notes: '', schedule: [] });
                        } catch (e) {
                          setError(e.message || 'Failed to add medication');
                        } finally {
                          setSavingMed(false);
                        }
                      }} disabled={savingMed}>
                        {savingMed ? 'Adding...' : 'Add Medication'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button variant="outline" onClick={closeDialog}>Close</Button>
            </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="py-8 text-center">No patient data</div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PatientProfileDialog;
