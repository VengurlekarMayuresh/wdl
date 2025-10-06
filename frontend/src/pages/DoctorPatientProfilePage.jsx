import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, Stethoscope, Heart, Pill, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { doctorPatientsAPI, appointmentsAPI, doctorAPI } from '@/services/api';
import RescheduleModal from '@/components/appointment/RescheduleModal';
import { toast } from '@/components/ui/sonner';

const DoctorPatientProfilePage = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [patient, setPatient] = useState(null);

  const [health, setHealth] = useState({
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    heartRate: '',
    weight: '',
    height: '',
    bloodSugar: '',
  });

  const [medications, setMedications] = useState([]);
  const [newMed, setNewMed] = useState({ name: '', frequency: '', notes: '', schedule: [] });
  const [savingHealth, setSavingHealth] = useState(false);
  const [savingMed, setSavingMed] = useState(false);
  const [editingMedId, setEditingMedId] = useState(null);
  const [medEdits, setMedEdits] = useState({ frequency: '', notes: '', schedule: [] });

  const [appointments, setAppointments] = useState({ upcoming: [], completed: [] });
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [notesByAppointment, setNotesByAppointment] = useState({});
  const [actionLoading, setActionLoading] = useState({});
  const [rescheduleModal, setRescheduleModal] = useState({ isOpen: false, appointment: null });

  useEffect(() => {
    if (!isAuthenticated || user?.userType !== 'doctor') {
      navigate('/login');
      return;
    }
    loadAll();
    (async () => { try { const d = await doctorAPI.getProfile(); setDoctorProfile(d); } catch {} })();
  }, [patientId]);

  const loadAll = async () => {
    try {
      setLoading(true);
      setError('');

      // Patient
      const p = await doctorPatientsAPI.getPatientProfile(patientId);
      setPatient(p);
      setHealth({
        bloodPressureSystolic: p?.vitalSigns?.bloodPressure?.systolic || '',
        bloodPressureDiastolic: p?.vitalSigns?.bloodPressure?.diastolic || '',
        heartRate: p?.vitalSigns?.heartRate?.value || '',
        weight: p?.vitalSigns?.weight?.value || '',
        height: p?.vitalSigns?.height?.value || '',
        bloodSugar: p?.customVitals?.bloodSugar?.value || '',
      });
      setMedications(p?.medications?.current || []);

      // Appointments for this doctor filtered by this patient
      const allDocsAppointments = await appointmentsAPI.getDoctorAppointments('all');
      const filtered = (allDocsAppointments || []).filter(a => {
        const pid = a.patientId?._id || a.patientId;
        return pid?.toString?.() === patientId?.toString?.();
      });
      const now = new Date();
      setAppointments({
        upcoming: filtered.filter(a => (a.status === 'confirmed' || a.status === 'rescheduled') && new Date(a.appointmentDate) > now),
        completed: filtered.filter(a => a.status === 'completed'),
      });
    } catch (e) {
      console.error(e);
      setError(e.message || 'Failed to load patient data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHealth = async () => {
    try {
      setSavingHealth(true);
      setError('');
      await doctorPatientsAPI.updateHealthOverview(patientId, health);
      await loadAll();
      toast.success('Health overview saved');
    } catch (e) {
      setError(e.message || 'Failed to save health overview');
      toast.error(e.message || 'Failed to save health overview');
    } finally {
      setSavingHealth(false);
    }
  };

  const startEditMedication = (med) => {
    setEditingMedId(med._id);
    setMedEdits({
      frequency: med.frequency || '',
      notes: med.notes || '',
      schedule: Array.isArray(med.schedule) ? med.schedule : [],
    });
  };

  const saveEditMedication = async () => {
    try {
      setSavingMed(true);
      setError('');
      const schedule = (medEdits.schedule || []).filter(r => (r && (r.time || r.quantity)));
      const payload = { ...medEdits, schedule };
      const updated = await doctorPatientsAPI.updateMedication(patientId, editingMedId, payload);
      setMedications(prev => prev.map(m => (m._id === editingMedId ? { ...m, ...updated } : m)));
      setEditingMedId(null);
      toast.success('Medication updated');
    } catch (e) {
      setError(e.message || 'Failed to update medication');
      toast.error(e.message || 'Failed to update medication');
    } finally {
      setSavingMed(false);
    }
  };

  const addMedication = async () => {
    if (!newMed.name || !newMed.frequency) {
      setError('Please provide medication name and frequency');
      toast.error('Please provide medication name and frequency');
      return;
    }
    try {
      setSavingMed(true);
      setError('');
      const schedule = (newMed.schedule || []).filter(r => (r && (r.time || r.quantity)));
      const med = await doctorPatientsAPI.addMedication(patientId, { ...newMed, schedule });
      setMedications(prev => [...prev, med]);
      setNewMed({ name: '', frequency: '', notes: '', schedule: [] });
      toast.success('Medication added');
    } catch (e) {
      setError(e.message || 'Failed to add medication');
      toast.error(e.message || 'Failed to add medication');
    } finally {
      setSavingMed(false);
    }
  };

  const deleteMedication = async (mid) => {
    try {
      setSavingMed(true);
      await doctorPatientsAPI.deleteMedication(patientId, mid);
      setMedications(prev => prev.filter(m => m._id !== mid));
      toast.success('Medication deleted');
    } catch (e) {
      setError(e.message || 'Failed to delete medication');
      toast.error(e.message || 'Failed to delete medication');
    } finally {
      setSavingMed(false);
    }
  };

  const handleComplete = async (appointmentId) => {
    const notes = notesByAppointment[appointmentId] || '';
    try {
      setActionLoading(prev => ({ ...prev, [appointmentId]: true }));
      await appointmentsAPI.completeAppointment(appointmentId, notes);
      await loadAll();
      toast.success('Appointment marked as completed');
    } catch (e) {
      toast.error(e.message || 'Failed to complete appointment');
    } finally {
      setActionLoading(prev => ({ ...prev, [appointmentId]: false }));
    }
  };

  const formatDateTime = (dt) => {
    const d = new Date(dt);
    return {
      date: d.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }),
      time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  if (!isAuthenticated || user?.userType !== 'doctor') {
    return (
      <div className="min-h-screen bg-gradient-light">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p>Access denied. Doctor login required.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-light">
        <Header isAuthenticated={isAuthenticated} userInitial={(user?.firstName?.[0]?.toUpperCase?.() || 'U')} userType={user?.userType || 'doctor'} onLogout={logout} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-lg font-medium">Loading patient...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-light">
      <Header isAuthenticated={isAuthenticated} userInitial={(user?.firstName?.[0]?.toUpperCase?.() || 'U')} userType={user?.userType || 'doctor'} onLogout={logout} />

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {error && (
          <Card className="border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Patient Info */}
        <Card className="border-none shadow-soft">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">
                  {patient?.userId?.profilePicture ? (
                    <img src={patient.userId.profilePicture} alt={`${patient?.userId?.firstName}`} className="w-full h-full object-cover" />
                  ) : (
                    <span>{(patient?.userId?.firstName?.[0] || 'P').toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{patient?.userId?.firstName} {patient?.userId?.lastName}</h1>
                  <div className="text-muted-foreground text-sm mt-1">{patient?.userId?.email} • {patient?.userId?.phone}</div>
                </div>
              </div>
              <Badge variant="secondary">DOB: {patient?.userId?.dateOfBirth ? new Date(patient.userId.dateOfBirth).toLocaleDateString() : '—'}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Overview */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-none shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Stethoscope className="h-4 w-4" /> Medical History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <div className="text-sm font-medium mb-1">Current Conditions</div>
                <div className="flex flex-wrap gap-2">
                  {(patient?.medicalHistory?.currentConditions || []).map((c, idx) => (
                    <Badge key={idx} variant="outline">{c.condition} ({c.status || 'active'})</Badge>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium mb-1">Allergies</div>
                <div className="flex flex-wrap gap-2">
                  {(patient?.allergies || []).map((a, idx) => (
                    <Badge key={idx} variant="destructive">{a.allergen} ({a.severity})</Badge>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium mb-1">Medication Plan</div>
                {medications.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No current medications</div>
                ) : (
                  <div className="space-y-3">
                    {medications.map((m) => (
                      <div key={m._id} className="rounded-md border p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">{m.name}</div>
                          <Badge variant={m.isActive ? 'success' : 'secondary'}>{m.isActive ? 'Active' : 'Inactive'}</Badge>
                        </div>
                        {m.frequency && (
                          <div className="text-xs text-muted-foreground mb-1">{m.frequency}x/day</div>
                        )}
                        {(m.schedule && m.schedule.length > 0) ? (
                          <div className="grid gap-2">
                            {m.schedule.map((row, idx) => (
                              <div key={idx} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary">{row.time || '—'}</Badge>
                                  <span className="text-muted-foreground">{row.mealRelation || '—'}</span>
                                </div>
                                <div className="font-medium">{row.quantity || '—'}</div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground">No detailed schedule provided</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Health Overview Edit */}
          <Card className="border-none shadow-soft">
            <CardHeader>
              <CardTitle>Health Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
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
        </div>

        {/* Medications Edit */}
        <Card className="border-none shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Pill className="h-4 w-4" /> Medications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Existing */}
            <div className="space-y-2">
              {medications.length === 0 ? (
                <div className="text-sm text-muted-foreground">No current medications</div>
              ) : medications.map((m) => (
                <div key={m._id} className="border rounded-md p-3 space-y-2">
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
                        {doctorProfile && m.createdByDoctorId && (m.createdByDoctorId === doctorProfile._id || m.createdByDoctorId?.toString?.() === doctorProfile._id?.toString?.()) ? (
                          <Button size="sm" variant="destructive" onClick={() => deleteMedication(m._id)}>Delete</Button>
                        ) : null}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add */}
            <div className="pt-2 border-t space-y-2">
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

              <div className="flex justify-end">
                <Button onClick={addMedication} disabled={savingMed}>{savingMed ? 'Adding...' : 'Add Medication'}</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointments */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-none shadow-soft">
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {appointments.upcoming.length === 0 ? (
                <div className="text-sm text-muted-foreground">No upcoming appointments</div>
              ) : appointments.upcoming.map(a => {
                const { date, time } = formatDateTime(a.appointmentDate);
                return (
                  <div key={a._id} className="rounded-lg p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-md border">
                          <Calendar className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold">{date}</div>
                          <div className="text-xs text-muted-foreground">{time}</div>
                        </div>
                        {a.status === 'rescheduled' && <Badge variant="secondary" className="ml-2">Rescheduled</Badge>}
                      </div>
                      <Badge variant="outline">{a.status}</Badge>
                    </div>
                    {a.reasonForVisit && (
                      <div className="text-sm text-muted-foreground mb-2">Reason: {a.reasonForVisit}</div>
                    )}
                    <div className="space-y-1">
                      <Label className="text-xs">Remarks (optional)</Label>
                      <Textarea rows={2} placeholder="Add consultation notes..." value={notesByAppointment[a._id] || ''}
                                onChange={(e) => setNotesByAppointment(prev => ({ ...prev, [a._id]: e.target.value }))} />
                    </div>
                    <div className="flex justify-end mt-2">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setRescheduleModal({ isOpen: true, appointment: a })}>
                          Reschedule
                        </Button>
                        <Button size="sm" onClick={() => handleComplete(a._id)} disabled={!!actionLoading[a._id]} className="bg-blue-600 hover:bg-blue-700 text-white">
                          {actionLoading[a._id] ? 'Completing...' : 'Mark as Completed'}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="border-none shadow-soft">
            <CardHeader>
              <CardTitle>Completed Appointments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {appointments.completed.length === 0 ? (
                <div className="text-sm text-muted-foreground">No completed appointments</div>
              ) : appointments.completed.map(a => {
                const { date, time } = formatDateTime(a.appointmentDate);
                return (
                  <div key={a._id} className="rounded-lg p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-md border">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="font-semibold">{date} at {time}</div>
                      </div>
                      <Badge variant="secondary">Completed</Badge>
                    </div>
                    {a.doctorNotes ? (
                      <div className="text-sm text-green-700">Notes: {a.doctorNotes}</div>
                    ) : (
                      <div className="text-xs text-muted-foreground">No notes provided.</div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reschedule Modal */}
      <RescheduleModal
        appointment={rescheduleModal.appointment}
        isOpen={rescheduleModal.isOpen}
        onClose={() => setRescheduleModal({ isOpen: false, appointment: null })}
        onReschedule={async () => { setRescheduleModal({ isOpen: false, appointment: null }); await loadAll(); toast.success('Appointment rescheduled'); }}
        userType="doctor"
      />
    </div>
  );
};

export default DoctorPatientProfilePage;
