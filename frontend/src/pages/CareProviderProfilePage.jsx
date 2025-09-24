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
    bio: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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
        const cp = await careProviderAPI.getProfile();
        setProfile(cp);
        setFormData({
          providerType: cp.providerType || '',
          services: cp.services || [],
          yearsOfExperience: cp.experience?.yearsOfExperience?.toString() || '',
          hourlyRate: cp.preferences?.hourlyRate?.min?.toString() || '',
          acceptsNewClients: cp.preferences?.acceptsNewClients ?? true,
          bio: cp.userId?.bio || ''
        });
      } catch (e) {
        console.error('Failed to load profile:', e);
        setError(e.message || 'Failed to load profile');
      }
    };
    loadProfile();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

  if (!profile) {
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

          {/* Experience & Rate */}
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