import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { careProviderAPI } from '@/services/api';
import ProfileImageUpload from '@/components/ui/ProfileImageUpload';
import { User, Mail, Phone, MapPin, Star, Calendar, Edit as EditIcon } from 'lucide-react';

const CareProviderProfilePage = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    providerType: '',
    services: [],
    yearsOfExperience: '',
    hourlyRate: '',
    acceptsNewClients: true,
    bio: '',
    credentials: {
      licenseNumber: '',
      licenseType: '',
      licenseState: '',
      licenseExpiryDate: ''
    },
    education: [],
    availability: {
      workSchedule: '',
      availableDays: []
    }
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const providerTypes = [
    'nurse', 'nursing_assistant', 'home_health_aide', 'physical_therapist',
    'occupational_therapist', 'speech_therapist', 'respiratory_therapist',
    'social_worker', 'case_manager', 'pharmacist', 'nutritionist',
    'mental_health_counselor', 'family_caregiver', 'professional_caregiver',
    'volunteer', 'other'
  ];

  const serviceOptions = [
    'medication_management', 'wound_care', 'vital_signs_monitoring',
    'mobility_assistance', 'personal_care', 'meal_preparation', 'transportation',
    'companionship', 'physical_therapy', 'occupational_therapy', 'speech_therapy',
    'respiratory_care', 'pain_management', 'chronic_disease_management',
    'mental_health_support', 'family_support', 'care_coordination'
  ];

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError('');
        const cp = await careProviderAPI.getProfile();
        setProfile(cp);
        setFormData({
          providerType: cp.providerType || '',
          services: Array.isArray(cp.services) ? cp.services : [],
          yearsOfExperience: cp.experience?.yearsOfExperience?.toString() || '',
          hourlyRate: cp.preferences?.hourlyRate?.min?.toString() || '',
          acceptsNewClients: cp.preferences?.acceptsNewClients ?? true,
          bio: cp.userId?.bio || '',
          credentials: {
            licenseNumber: cp.credentials?.licenseNumber || '',
            licenseType: cp.credentials?.licenseType || '',
            licenseState: cp.credentials?.licenseState || '',
            licenseExpiryDate: cp.credentials?.licenseExpiryDate ? new Date(cp.credentials.licenseExpiryDate).toISOString().slice(0,10) : ''
          },
          education: Array.isArray(cp.education) ? cp.education.map(e => ({
            institution: e.institution || '',
            program: e.program || '',
            degree: e.degree || '',
            graduationYear: e.graduationYear || ''
          })) : [],
          availability: {
            workSchedule: cp.availability?.workSchedule || '',
            availableDays: Array.isArray(cp.availability?.availableDays) ? cp.availability.availableDays : []
          }
        });
      } catch (e) {
        console.error('Failed to load profile:', e);
        setError(e.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    // If not authenticated, avoid hitting the API and show message
    if (!isAuthenticated) {
      setLoading(false);
      setError('You must be logged in as a care provider to view this page.');
      return;
    }

    loadProfile();
  }, [isAuthenticated]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleServiceToggle = (service) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError('');
      const updates = {
        providerType: formData.providerType,
        services: formData.services,
        experience: {
          yearsOfExperience: parseInt(formData.yearsOfExperience) || 0
        },
        preferences: {
          hourlyRate: {
            min: parseFloat(formData.hourlyRate) || 0
          },
          acceptsNewClients: formData.acceptsNewClients
        },
        credentials: {
          licenseNumber: formData.credentials.licenseNumber || undefined,
          licenseType: formData.credentials.licenseType || undefined,
          licenseState: formData.credentials.licenseState || undefined,
          licenseExpiryDate: formData.credentials.licenseExpiryDate ? new Date(formData.credentials.licenseExpiryDate) : undefined
        },
        education: formData.education.map(e => ({
          institution: e.institution,
          program: e.program,
          degree: e.degree,
          graduationYear: e.graduationYear ? parseInt(e.graduationYear) : undefined
        })),
        availability: {
          workSchedule: formData.availability.workSchedule || undefined,
          availableDays: formData.availability.availableDays || []
        }
      };
      
      const updated = await careProviderAPI.updateProfile(updates);
      setProfile(updated);
      setIsEditing(false);
    } catch (e) {
      console.error('Failed to update profile:', e);
      setError(e.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const formatProviderType = (type) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatService = (service) => {
    return service.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-light">
        <Header 
          isAuthenticated={isAuthenticated}
          userInitial={(user?.firstName?.[0]?.toUpperCase?.() || 'U')}
          userType={user?.userType || 'careprovider'}
          onLogout={logout}
        />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-gradient-light">
        <Header 
          isAuthenticated={isAuthenticated}
          userInitial={(user?.firstName?.[0]?.toUpperCase?.() || 'U')}
          userType={user?.userType || 'careprovider'}
          onLogout={logout}
        />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
          {!isAuthenticated ? (
            <div className="text-center">
              <a className="underline text-primary" href="/login">Go to Login</a>
            </div>
          ) : (
            <div className="text-center">
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-light">
      <Header 
        isAuthenticated={isAuthenticated}
        userInitial={(user?.firstName?.[0]?.toUpperCase?.() || 'U')}
        userType={user?.userType || 'careprovider'}
        onLogout={logout}
      />
      
      {/* Profile Header */}
      <section className="py-8 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <Card className="shadow-medium border-0">
            <CardContent className="p-8">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {error}
                </div>
              )}
              
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Profile Photo & Basic Info */}
                <div className="flex flex-col items-center lg:items-start">
                  <ProfileImageUpload 
                    currentImage={user?.profilePicture}
                    size="lg"
                    onImageUpdate={(url, publicId) => {
                      console.log('Profile image updated:', url, publicId);
                    }}
                  />
                  
                  <div className="text-center lg:text-left mt-4">
                    <h1 className="text-2xl font-bold text-foreground mb-2">
                      {user?.firstName} {user?.lastName}
                    </h1>
                    <p className="text-muted-foreground mb-4">
                      {profile.providerType ? formatProviderType(profile.providerType) : 'Care Provider'}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        variant={isEditing ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setIsEditing(!isEditing)}
                        disabled={isSaving}
                      >
                        <EditIcon className="h-4 w-4 mr-2" />
                        {isEditing ? "Cancel" : "Edit Profile"}
                      </Button>
                      {isEditing && (
                        <Button 
                          variant="medical" 
                          size="sm"
                          onClick={handleSave}
                          disabled={isSaving}
                        >
                          {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact & Profile Info */}
                <div className="flex-1 grid md:grid-cols-2 gap-6">
                  {/* Contact Information */}
                  <div>
                    <h3 className="font-semibold text-foreground mb-4">Contact Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{user?.email}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{user?.phone || 'Not provided'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {user?.address?.city && user?.address?.state 
                            ? `${user.address.city}, ${user.address.state}` 
                            : 'Location not provided'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Professional Info */}
                  <div>
                    <h3 className="font-semibold text-foreground mb-4">Professional Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {profile.experience?.yearsOfExperience 
                            ? `${profile.experience.yearsOfExperience} years experience`
                            : 'Experience not specified'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Star className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {profile.ratings?.averageRating 
                            ? `${profile.ratings.averageRating}/5 (${profile.ratings.totalReviews || 0} reviews)`
                            : 'No reviews yet'}
                        </span>
                      </div>
                      <div>
                        <Badge 
                          variant={profile.preferences?.acceptsNewClients ? "default" : "secondary"}
                        >
                          {profile.preferences?.acceptsNewClients ? 'Accepting New Clients' : 'Not Accepting New Clients'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
          
          {/* Provider Type */}
          <Card className="shadow-soft border-0">
            <CardHeader>
              <CardTitle>Provider Type</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Select 
                  value={formData.providerType} 
                  onValueChange={(value) => handleInputChange('providerType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider type" />
                  </SelectTrigger>
                  <SelectContent>
                    {providerTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {formatProviderType(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-lg">
                  {profile.providerType ? formatProviderType(profile.providerType) : 'Not specified'}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Credentials */}
          <Card className="shadow-soft border-0">
            <CardHeader>
              <CardTitle>Credentials</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">License Number</label>
                    <Input value={formData.credentials.licenseNumber}
                      onChange={(e) => handleNestedChange('credentials','licenseNumber', e.target.value)}
                      placeholder="License Number" />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">License Type</label>
                    <Select value={formData.credentials.licenseType}
                      onValueChange={(v)=>handleNestedChange('credentials','licenseType', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select license type" />
                      </SelectTrigger>
                      <SelectContent>
                        {['RN','LPN','CNA','PTA','OTA','SLP','RRT','LSW','LCSW','PharmD','RD','LPC','Other'].map(t=> (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">License State</label>
                    <Input value={formData.credentials.licenseState}
                      onChange={(e)=>handleNestedChange('credentials','licenseState', e.target.value)}
                      placeholder="e.g. NY" />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">License Expiry</label>
                    <Input type="date" value={formData.credentials.licenseExpiryDate}
                      onChange={(e)=>handleNestedChange('credentials','licenseExpiryDate', e.target.value)} />
                  </div>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-2 text-muted-foreground">
                  <div>License: {profile.credentials?.licenseNumber || '—'}</div>
                  <div>Type: {profile.credentials?.licenseType || '—'}</div>
                  <div>State: {profile.credentials?.licenseState || '—'}</div>
                  <div>Expiry: {profile.credentials?.licenseExpiryDate ? new Date(profile.credentials.licenseExpiryDate).toLocaleDateString() : '—'}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Services */}
          <Card className="shadow-soft border-0">
            <CardHeader>
              <CardTitle>Services Provided</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {serviceOptions.map(service => (
                    <div key={service} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={service}
                        checked={formData.services.includes(service)}
                        onChange={() => handleServiceToggle(service)}
                        className="rounded"
                      />
                      <label htmlFor={service} className="text-sm">
                        {formatService(service)}
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.services?.length > 0 ? (
                    profile.services.map(service => (
                      <Badge key={service} variant="secondary">
                        {formatService(service)}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No services specified</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Education */}
          <Card className="shadow-soft border-0">
            <CardHeader>
              <CardTitle>Education</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  {formData.education.map((ed, idx) => (
                    <div key={idx} className="grid md:grid-cols-4 gap-3 items-end">
                      <div>
                        <label className="block text-sm text-muted-foreground mb-1">Institution</label>
                        <Input value={ed.institution} onChange={(e)=>{
                          const v = e.target.value;
                          setFormData(prev => {
                            const arr = [...prev.education]; arr[idx] = { ...arr[idx], institution: v }; return { ...prev, education: arr };
                          });
                        }} />
                      </div>
                      <div>
                        <label className="block text-sm text-muted-foreground mb-1">Program</label>
                        <Input value={ed.program} onChange={(e)=>{
                          const v = e.target.value;
                          setFormData(prev => { const arr = [...prev.education]; arr[idx] = { ...arr[idx], program: v }; return { ...prev, education: arr }; });
                        }} />
                      </div>
                      <div>
                        <label className="block text-sm text-muted-foreground mb-1">Degree</label>
                        <Select value={ed.degree || ''} onValueChange={(v)=>{
                          setFormData(prev => { const arr = [...prev.education]; arr[idx] = { ...arr[idx], degree: v }; return { ...prev, education: arr }; });
                        }}>
                          <SelectTrigger><SelectValue placeholder="Select degree" /></SelectTrigger>
                          <SelectContent>
                            {['Certificate','Associates','Bachelors','Masters','Doctorate','Other'].map(d => (
                              <SelectItem key={d} value={d}>{d}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm text-muted-foreground mb-1">Graduation Year</label>
                        <Input type="number" value={ed.graduationYear || ''} onChange={(e)=>{
                          const v = e.target.value;
                          setFormData(prev => { const arr = [...prev.education]; arr[idx] = { ...arr[idx], graduationYear: v }; return { ...prev, education: arr }; });
                        }} />
                      </div>
                      <div className="md:col-span-4 text-right">
                        <Button variant="outline" size="sm" onClick={()=>{
                          setFormData(prev => ({ ...prev, education: prev.education.filter((_,i)=> i!==idx) }));
                        }}>Remove</Button>
                      </div>
                    </div>
                  ))}
                  <Button variant="secondary" size="sm" onClick={()=>{
                    setFormData(prev => ({ ...prev, education: [...prev.education, { institution:'', program:'', degree:'', graduationYear:'' }] }));
                  }}>Add Education</Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {profile.education?.length ? profile.education.map((ed, idx) => (
                    <div key={idx} className="flex flex-wrap gap-3 text-muted-foreground">
                      <Badge variant="secondary">{ed.degree || 'Degree'}</Badge>
                      <span>{ed.program}</span>
                      <span>• {ed.institution}</span>
                      {ed.graduationYear && <span>• {ed.graduationYear}</span>}
                    </div>
                  )) : <p className="text-muted-foreground">No education added</p>}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Experience, Rate & Availability */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-soft border-0">
              <CardHeader>
                <CardTitle>Experience</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">
                      Years of Experience
                    </label>
                    <Input
                      type="number"
                      value={formData.yearsOfExperience}
                      onChange={(e) => handleInputChange('yearsOfExperience', e.target.value)}
                      placeholder="0"
                      min="0"
                      max="50"
                    />
                  </div>
                ) : (
                  <p className="text-lg">
                    {profile.experience?.yearsOfExperience 
                      ? `${profile.experience.yearsOfExperience} years`
                      : 'Not specified'}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-soft border-0">
              <CardHeader>
                <CardTitle>Hourly Rate</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">
                      Minimum Hourly Rate ($)
                    </label>
                    <Input
                      type="number"
                      value={formData.hourlyRate}
                      onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                ) : (
                  <p className="text-lg">
                    {profile.preferences?.hourlyRate?.min 
                      ? `$${profile.preferences.hourlyRate.min}/hour`
                      : 'Rate not specified'}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Availability */}
          <Card className="shadow-soft border-0">
            <CardHeader>
              <CardTitle>Client Availability</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">Work Schedule</label>
                    <Select value={formData.availability.workSchedule || ''} onValueChange={(v)=>handleNestedChange('availability','workSchedule', v)}>
                      <SelectTrigger><SelectValue placeholder="Select schedule" /></SelectTrigger>
                      <SelectContent>
                        {['day_shift','night_shift','evening_shift','rotating','weekends','on_call','flexible'].map(s => (
                          <SelectItem key={s} value={s}>{s.replace(/_/g,' ')}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Available Days</label>
                    <div className="flex flex-wrap gap-3">
                      {['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map(d => {
                        const checked = formData.availability.availableDays.includes(d);
                        return (
                          <label key={d} className="flex items-center gap-2">
                            <input type="checkbox" checked={checked} onChange={(e)=>{
                              setFormData(prev => {
                                const set = new Set(prev.availability.availableDays);
                                if (e.target.checked) set.add(d); else set.delete(d);
                                return { ...prev, availability: { ...prev.availability, availableDays: Array.from(set) } };
                              });
                            }} />
                            <span className="capitalize">{d}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="acceptsNewClients"
                    checked={formData.acceptsNewClients}
                    onChange={(e) => handleInputChange('acceptsNewClients', e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="acceptsNewClients">
                    Currently accepting new clients
                  </label>
                </div>
              </div>
              ) : (
                <Badge 
                  variant={profile.preferences?.acceptsNewClients ? "default" : "secondary"}
                >
                  {profile.preferences?.acceptsNewClients 
                    ? 'Accepting New Clients' 
                    : 'Not Accepting New Clients'}
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default CareProviderProfilePage;