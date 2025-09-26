import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search,
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  MapPin,
  Heart,
  Activity,
  FileText,
  Filter,
  SortAsc,
  Eye,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const DoctorPatientsPage = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Mock data for patients - replace with API call
  const mockPatients = [
    {
      id: 1,
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1 (555) 123-4567',
      profilePicture: null,
      dateOfBirth: '1985-03-15',
      lastAppointment: '2024-01-15',
      nextAppointment: '2024-02-10',
      totalAppointments: 8,
      status: 'active',
      priority: 'high',
      conditions: ['Hypertension', 'Diabetes Type 2'],
      lastVisitNotes: 'Patient responding well to treatment. Continue current medication.',
      contactPreference: 'email'
    },
    {
      id: 2,
      firstName: 'Michael',
      lastName: 'Chen',
      email: 'michael.chen@email.com',
      phone: '+1 (555) 234-5678',
      profilePicture: null,
      dateOfBirth: '1978-07-22',
      lastAppointment: '2024-01-20',
      nextAppointment: null,
      totalAppointments: 12,
      status: 'active',
      priority: 'medium',
      conditions: ['Anxiety', 'Insomnia'],
      lastVisitNotes: 'Patient reports improvement in sleep patterns. Reduce medication dosage.',
      contactPreference: 'phone'
    },
    {
      id: 3,
      firstName: 'Emily',
      lastName: 'Rodriguez',
      email: 'emily.rodriguez@email.com',
      phone: '+1 (555) 345-6789',
      profilePicture: null,
      dateOfBirth: '1992-11-08',
      lastAppointment: '2024-01-25',
      nextAppointment: '2024-02-15',
      totalAppointments: 3,
      status: 'new',
      priority: 'low',
      conditions: ['Allergies', 'Asthma'],
      lastVisitNotes: 'New patient. Established care plan and prescribed inhaler.',
      contactPreference: 'email'
    },
    {
      id: 4,
      firstName: 'David',
      lastName: 'Park',
      email: 'david.park@email.com',
      phone: '+1 (555) 456-7890',
      profilePicture: null,
      dateOfBirth: '1970-12-03',
      lastAppointment: '2024-01-10',
      nextAppointment: '2024-02-05',
      totalAppointments: 15,
      status: 'active',
      priority: 'high',
      conditions: ['Cardiovascular Disease', 'High Cholesterol'],
      lastVisitNotes: 'Patient requires more frequent monitoring. Schedule follow-up in 2 weeks.',
      contactPreference: 'phone'
    }
  ];

  useEffect(() => {
    // Simulate API call
    const fetchPatients = async () => {
      setLoading(true);
      try {
        // Replace with actual API call
        // const response = await patientAPI.getDoctorPatients();
        // setPatients(response.data);
        
        // For now, use mock data
        setTimeout(() => {
          setPatients(mockPatients);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching patients:', error);
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.conditions.some(condition => 
        condition.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesFilter = 
      selectedFilter === 'all' || 
      patient.status === selectedFilter ||
      patient.priority === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-light">
        <Header 
          isAuthenticated={isAuthenticated}
          userInitial={(user?.firstName?.[0]?.toUpperCase?.() || 'U')}
          userType={user?.userType || 'doctor'}
          onLogout={logout}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-lg font-medium text-muted-foreground">Loading your patients...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-light">
      <Header 
        isAuthenticated={isAuthenticated}
        userInitial={(user?.firstName?.[0]?.toUpperCase?.() || 'U')}
        userType={user?.userType || 'doctor'}
        onLogout={logout}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary rounded-lg">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Patients</h1>
              <p className="text-muted-foreground">
                Manage and view all patients who have appointments with you
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="border-none shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{patients.length}</p>
                    <p className="text-sm text-muted-foreground">Total Patients</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Activity className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {patients.filter(p => p.status === 'active').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Active Patients</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {patients.filter(p => p.nextAppointment).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Upcoming Appointments</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Heart className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {patients.filter(p => p.priority === 'high').length}
                    </p>
                    <p className="text-sm text-muted-foreground">High Priority</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter Section */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search patients by name, email, or condition..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-4 py-2 border border-input rounded-md bg-background"
              >
                <option value="all">All Patients</option>
                <option value="active">Active</option>
                <option value="new">New Patients</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <SortAsc className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Patients Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPatients.map((patient) => (
            <Card key={patient.id} className="border-none shadow-soft hover:shadow-medium transition-all duration-300 overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={patient.profilePicture} />
                        <AvatarFallback className="bg-primary text-white text-lg font-semibold">
                          {patient.firstName[0]}{patient.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full ${getPriorityColor(patient.priority)}`} 
                           title={`${patient.priority} priority`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">
                        {patient.firstName} {patient.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Age {calculateAge(patient.dateOfBirth)}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge className={getStatusColor(patient.status)}>
                          {patient.status}
                        </Badge>
                        <Badge variant="outline">
                          {patient.totalAppointments} visits
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{patient.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{patient.phone}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Last Visit</p>
                      <p className="font-medium">
                        {patient.lastAppointment ? new Date(patient.lastAppointment).toLocaleDateString() : 'Never'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Next Visit</p>
                      <p className="font-medium">
                        {patient.nextAppointment ? new Date(patient.nextAppointment).toLocaleDateString() : 'Not scheduled'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Conditions */}
                {patient.conditions && patient.conditions.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground mb-2">Medical Conditions</p>
                    <div className="flex flex-wrap gap-2">
                      {patient.conditions.map((condition, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Last Visit Notes */}
                {patient.lastVisitNotes && (
                  <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <p className="text-xs font-medium text-muted-foreground">Last Visit Notes</p>
                    </div>
                    <p className="text-sm text-foreground line-clamp-2">
                      {patient.lastVisitNotes}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" className="flex-1" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Profile
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredPatients.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No patients found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'You don\'t have any patients yet. They will appear here once they book appointments with you.'
              }
            </p>
            {searchTerm || selectedFilter !== 'all' ? (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedFilter('all');
                }}
              >
                Clear filters
              </Button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorPatientsPage;