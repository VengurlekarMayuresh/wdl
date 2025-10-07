import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, ArrowLeft, Building2, MapPin, Phone, Globe, Clock, Star } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';

// Minimal Facility Profile page
// Assumes backend provides /api/healthcare-facilities/profile/me protected by facility token
// This page can be expanded to show and edit facility profile details.

const FacilityProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState(null);
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to read a stored facility token (adjust this key to match your auth storage)
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Not authenticated as a facility. Please log in as a facility.');
          return;
        }

        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${API_BASE_URL}/healthcare-facilities/profile/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const contentType = res.headers.get('content-type') || '';
        if (!res.ok) {
          const msg = contentType.includes('application/json') ? (await res.json())?.message : await res.text();
          throw new Error(msg || 'Failed to load facility profile');
        }

        const data = contentType.includes('application/json') ? await res.json() : (()=>{ throw new Error('Unexpected non-JSON response from server'); })();
        // API returns { success, data: facility }
        const facility = data?.data || data;
        setProfile(facility);
        setEditData({
          name: facility?.name || '',
          description: facility?.description || '',
          contact: {
            email: facility?.contact?.email || facility?.email || '',
            phone: { primary: facility?.contact?.phone?.primary || facility?.phone || '' },
            website: facility?.contact?.website || '',
          },
          address: {
            street: facility?.address?.street || '',
            area: facility?.address?.area || '',
            city: facility?.address?.city || '',
            state: facility?.address?.state || '',
            pincode: facility?.address?.pincode || '',
          },
          clinicType: facility?.clinicType || '',
          is24x7: !!facility?.is24x7,
          appointmentRequired: !!facility?.appointmentRequired,
        });
      } catch (err) {
        console.error('Facility profile load error:', err);
        setError(err.message || 'Failed to load facility profile');
        toast({
          title: 'Failed to load profile',
          description: err.message || 'Unexpected error occurred.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-light">
      <Header 
        isAuthenticated={isAuthenticated}
        userInitial={(user?.firstName?.[0]?.toUpperCase?.() || 'U')}
        userType={user?.userType || 'facility'}
        onLogout={logout}
      />
      <div className="max-w-6xl mx-auto p-4">
        <div className="mb-6">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading profile...
          </div>
        )}

        {error && (
            <div className="space-y-3">
              <p className="text-destructive">{error}</p>
              <div className="flex gap-3">
                <Button onClick={() => window.location.reload()}>Retry</Button>
                <Link to="/facility-login" className="underline text-primary">Facility Login</Link>
              </div>
            </div>
          )}

          {!loading && !error && profile && (
            <>
              {/* Hero Section */}
              <div className="relative overflow-hidden rounded-xl mb-6 bg-gradient-to-r from-primary to-primary-dark text-white">
                <div className="absolute inset-0 opacity-10" style={{backgroundImage:'radial-gradient(circle at 20% 20%, #fff 1px, transparent 1px)', backgroundSize:'20px 20px'}}/>
                <div className="relative p-6 sm:p-8">
                  <div className="flex items-start gap-4">
                    <div className="bg-white/20 rounded-lg p-3">
                      <Building2 className="h-8 w-8" />
                    </div>
                    <div className="flex-1">
                      <h1 className="text-2xl sm:text-3xl font-bold">{profile?.name || 'Facility Profile'}</h1>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                        {profile?.type && <Badge variant="secondary" className="bg-white/20 text-white border-white/30">{profile.type}</Badge>}
                        {profile?.clinicType && <Badge variant="secondary" className="bg-white/20 text-white border-white/30">{profile.clinicType}</Badge>}
                        {profile?.is24x7 && <Badge variant="secondary" className="bg-white/20 text-white border-white/30">24/7</Badge>}
                        {profile?.rating?.overall && (
                          <span className="inline-flex items-center gap-1"><Star className="h-4 w-4" /> {profile.rating.overall}/5</span>
                        )}
                      </div>
                      <div className="mt-3 grid sm:grid-cols-3 gap-3 text-white/90 text-sm">
                        <div className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" /> {profile?.fullAddress || [profile?.address?.city, profile?.address?.state].filter(Boolean).join(', ') || 'Address not set'}</div>
                        <div className="inline-flex items-center gap-2"><Phone className="h-4 w-4" /> {profile?.phone || profile?.contact?.phone?.primary || 'N/A'}</div>
                        <div className="inline-flex items-center gap-2"><Globe className="h-4 w-4" /> {profile?.contact?.website ? <a href={profile.contact.website} target="_blank" rel="noreferrer" className="underline">{profile.contact.website}</a> : 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Cards */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Left: Contact & Hours */}
                <Card className="shadow-strong border-0 lg:col-span-1">
                  <CardContent className="p-6 space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold mb-3">Contact</h2>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> {profile?.phone || profile?.contact?.phone?.primary || 'N/A'}</div>
                        <div className="flex items-center gap-2"><Globe className="h-4 w-4 text-muted-foreground" /> {profile?.contact?.website ? <a href={profile.contact.website} target="_blank" rel="noreferrer" className="underline">{profile.contact.website}</a> : 'N/A'}</div>
                        <div className="flex items-start gap-2"><MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <span>{profile?.fullAddress || [profile?.address?.street, profile?.address?.area, profile?.address?.city, profile?.address?.state, profile?.address?.pincode].filter(Boolean).join(', ') || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    {profile?.operatingHoursText && (
                      <div>
                        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><Clock className="h-4 w-4" /> Operating Hours</h2>
                        <div className="space-y-1 text-sm">
                          {['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map(day => (
                            <div key={day} className="flex justify-between"><span className="capitalize text-muted-foreground">{day}</span><span>{profile.operatingHoursText[day] || 'Closed'}</span></div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Right: Details */}
                <Card className="shadow-strong border-0 lg:col-span-2">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-lg font-semibold">Details</div>
                      <div className="flex gap-2">
                        {!isEditing ? (
                          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>Edit</Button>
                        ) : (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => { setIsEditing(false); setEditData(prev => ({...prev})); }}>Cancel</Button>
                            <Button variant="medical" size="sm" disabled={isSaving} onClick={async () => {
                              try {
                                setIsSaving(true);
                                const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                                const token = localStorage.getItem('token');
                                const payload = {
                                  name: editData.name,
                                  description: editData.description,
                                  contact: editData.contact,
                                  address: editData.address,
                                  clinicType: editData.clinicType || undefined,
                                  is24x7: !!editData.is24x7,
                                  appointmentRequired: !!editData.appointmentRequired,
                                };
                                const res = await fetch(`${API_BASE_URL}/healthcare-facilities/profile/me`, {
                                  method: 'PUT',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${token}`,
                                  },
                                  body: JSON.stringify(payload),
                                });
                                const data = await res.json();
                                if (!res.ok || !data?.success) throw new Error(data?.message || 'Update failed');
                                setProfile(data.data);
                                setIsEditing(false);
                                toast({ title: 'Profile updated' });
                              } catch (e) {
                                toast({ title: 'Update failed', description: e.message, variant: 'destructive' });
                              } finally {
                                setIsSaving(false);
                              }
                            }}>{isSaving ? 'Saving...' : 'Save'}</Button>
                          </>
                        )}
                      </div>
                    </div>
                    {/* Stats row */}
                    <div className="grid md:grid-cols-3 gap-4 mb-6 text-sm">
                      <div className="rounded bg-accent/40 p-3"><div className="text-muted-foreground">Type</div><div className="font-medium">{profile?.type || 'N/A'}{profile?.clinicType ? ` • ${profile.clinicType}` : ''}</div></div>
                      <div className="rounded bg-accent/40 p-3"><div className="text-muted-foreground">Open</div><div className="font-medium">{profile?.is24x7 ? '24/7' : (profile?.operatingHoursText ? 'See hours' : 'N/A')}</div></div>
                      <div className="rounded bg-accent/40 p-3"><div className="text-muted-foreground">Rating</div><div className="font-medium">{profile?.rating?.overall ? `${profile.rating.overall}/5 (${profile.rating.totalReviews || 0})` : 'N/A'}</div></div>
                    </div>

                    {/* Editable form */}
                    {isEditing && editData && (
                      <div className="mb-8 grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <label className="block text-sm text-muted-foreground">Facility Name</label>
                          <Input value={editData.name} onChange={(e)=>setEditData(d=>({...d, name: e.target.value}))} />
                          <label className="block text-sm text-muted-foreground">Website</label>
                          <Input value={editData.contact.website} onChange={(e)=>setEditData(d=>({...d, contact:{...d.contact, website: e.target.value}}))} />
                          <label className="block text-sm text-muted-foreground">Primary Phone</label>
                          <Input value={editData.contact.phone.primary} onChange={(e)=>setEditData(d=>({...d, contact:{...d.contact, phone:{...d.contact.phone, primary: e.target.value}}}))} />
                          <label className="block text-sm text-muted-foreground">Description</label>
                          <Textarea rows={4} value={editData.description} onChange={(e)=>setEditData(d=>({...d, description: e.target.value}))} />
                        </div>
                        <div className="space-y-3">
                          <label className="block text-sm text-muted-foreground">Street</label>
                          <Input value={editData.address.street} onChange={(e)=>setEditData(d=>({...d, address:{...d.address, street: e.target.value}}))} />
                          <label className="block text-sm text-muted-foreground">Area</label>
                          <Input value={editData.address.area} onChange={(e)=>setEditData(d=>({...d, address:{...d.address, area: e.target.value}}))} />
                          <label className="block text-sm text-muted-foreground">City</label>
                          <Input value={editData.address.city} onChange={(e)=>setEditData(d=>({...d, address:{...d.address, city: e.target.value}}))} />
                          <label className="block text-sm text-muted-foreground">State</label>
                          <Input value={editData.address.state} onChange={(e)=>setEditData(d=>({...d, address:{...d.address, state: e.target.value}}))} />
                          <label className="block text-sm text-muted-foreground">Pincode</label>
                          <Input value={editData.address.pincode} onChange={(e)=>setEditData(d=>({...d, address:{...d.address, pincode: e.target.value}}))} />
                          {profile?.type === 'clinic' && (
                            <div className="mt-2">
                              <label className="block text-sm text-muted-foreground mb-1">Clinic Type</label>
                              <Select value={editData.clinicType || ''} onValueChange={(val)=>setEditData(d=>({...d, clinicType: val}))}>
                                <SelectTrigger><SelectValue placeholder="Select clinic type" /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="general_clinic">General</SelectItem>
                                  <SelectItem value="specialty_clinic">Specialty</SelectItem>
                                  <SelectItem value="urgent_care">Urgent Care</SelectItem>
                                  <SelectItem value="walk_in_clinic">Walk-in</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm text-muted-foreground">24/7 Open</span>
                            <Switch checked={!!editData.is24x7} onCheckedChange={(val)=>setEditData(d=>({...d, is24x7: val}))} />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Appointment Required</span>
                            <Switch checked={!!editData.appointmentRequired} onCheckedChange={(val)=>setEditData(d=>({...d, appointmentRequired: val}))} />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Specialties */}
                    {Array.isArray(profile?.specialties) && profile.specialties.length > 0 && (
                      <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-2">Specialties</h2>
                        <div className="flex flex-wrap gap-2">
                          {profile.specialties.map((s, i) => (
                            <span key={i} className="px-2 py-1 text-sm bg-accent rounded">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Services */}
                    {Array.isArray(profile?.services) && profile.services.length > 0 && (
                      <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-2">Services</h2>
                        <div className="grid md:grid-cols-2 gap-3">
                          {profile.services.slice(0, 10).map((srv, idx) => (
                            <div key={idx} className="p-3 rounded border">
                              <div className="font-medium">{srv.name}</div>
                              <div className="text-xs text-muted-foreground">{srv.category || 'other'}{srv.duration ? ` • ${srv.duration} min` : ''}{srv.price ? ` • $${srv.price}` : ''}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Insurance and Languages */}
                    {(Array.isArray(profile?.acceptedInsurance) && profile.acceptedInsurance.length > 0) || (Array.isArray(profile?.languages) && profile.languages.length > 0) ? (
                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        {Array.isArray(profile?.acceptedInsurance) && profile.acceptedInsurance.length > 0 && (
                          <div>
                            <h2 className="text-lg font-semibold mb-2">Accepted Insurance</h2>
                            <div className="flex flex-wrap gap-2">
                              {profile.acceptedInsurance.map((ins, i) => (<span key={i} className="px-2 py-1 text-sm bg-accent rounded">{ins}</span>))}
                            </div>
                          </div>
                        )}
                        {Array.isArray(profile?.languages) && profile.languages.length > 0 && (
                          <div>
                            <h2 className="text-lg font-semibold mb-2">Languages</h2>
                            <div className="flex flex-wrap gap-2">
                              {profile.languages.map((lang, i) => (<span key={i} className="px-2 py-1 text-sm bg-accent rounded">{lang}</span>))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : null}

                    {/* Media */}
                    {Array.isArray(profile?.media?.images) && profile.media.images.length > 0 && (
                      <div>
                        <h2 className="text-lg font-semibold mb-2">Gallery</h2>
                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {profile.media.images.slice(0,6).map((img, i) => (
                            <img key={i} src={img.url} alt={img.caption || 'Facility'} className="w-full h-40 object-cover rounded" />
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
      </div>
    </div>
  );
};

export default FacilityProfilePage;
