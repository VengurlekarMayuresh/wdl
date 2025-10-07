import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  MapPin,
  Phone,
  Clock,
  Star,
  CheckCircle,
  Calendar,
  Navigation,
  Mail,
  Globe,
  Building2,
  X,
  Share2,
  Bookmark,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { healthcareFacilitiesAPI } from '@/services/healthcareFacilitiesAPI';

const FacilityDetailsModal = ({ facilityId, isOpen, onClose, facility: initialFacility }) => {
  const [facility, setFacility] = useState(initialFacility || null);
  const [loading, setLoading] = useState(!initialFacility);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (initialFacility) {
      setFacility(initialFacility);
      setLoading(false);
    } else if (facilityId && isOpen && !initialFacility) {
      fetchFacilityDetails();
    }
  }, [facilityId, isOpen, initialFacility]);

  const fetchFacilityDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await healthcareFacilitiesAPI.getById(facilityId);
      setFacility(response.data);
    } catch (error) {
      console.error('Error fetching facility details:', error);
      setError('Failed to load facility details');
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // TODO: Implement actual bookmarking functionality
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: facility?.name,
        text: facility?.description,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleCall = (phone) => {
    window.open(`tel:${phone}`);
  };

  const handleGetDirections = () => {
    if (facility?.address?.coordinates?.latitude && facility?.address?.coordinates?.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${facility.address.coordinates.latitude},${facility.address.coordinates.longitude}`;
      window.open(url, '_blank');
    }
  };

  const formatOperatingHours = (hours, is24x7) => {
    return healthcareFacilitiesAPI.utils.formatOperatingHours(hours, is24x7);
  };

  const isCurrentlyOpen = (hours, is24x7) => {
    return healthcareFacilitiesAPI.utils.isCurrentlyOpen(hours, is24x7);
  };

  const formatType = (type, subCategory) => {
    return healthcareFacilitiesAPI.utils.formatType(type, subCategory);
  };

  const nextImage = () => {
    if (facility?.media?.images?.length > 0) {
      setSelectedImageIndex((prev) => 
        (prev + 1) % facility.media.images.length
      );
    }
  };

  const prevImage = () => {
    if (facility?.media?.images?.length > 0) {
      setSelectedImageIndex((prev) => 
        prev === 0 ? facility.media.images.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Loading Facility Details</DialogTitle>
            <DialogDescription>Please wait while we load the facility information.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !facility) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
            <DialogDescription>
              {error || 'Facility not found'}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[80vh] p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>{facility.name}</DialogTitle>
          <DialogDescription>
            {formatType(facility.type, facility.subCategory)} - {facility.fullAddress}
          </DialogDescription>
        </DialogHeader>
        
        {/* Header */}
        <div className="p-4 border-b bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{facility.name}</h2>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-base text-muted-foreground">{formatType(facility.type, facility.subCategory)}</p>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-base font-medium">{facility.rating?.overall || 'N/A'}</span>
                  {facility.rating?.totalReviews && (
                    <span className="text-sm text-muted-foreground">
                      ({facility.rating.totalReviews} reviews)
                    </span>
                  )}
                </div>
              </div>
            </div>
            {/* <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button> */}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex h-full overflow-hidden">
          {/* Left - Fixed Image and Specialties */}
          <div className="w-80 flex-shrink-0 p-4 bg-gray-50 flex flex-col">
            {/* Image */}
            <div className="w-64 h-48 rounded-lg overflow-hidden border bg-white shadow-sm mt-4 mx-auto">
              {facility.media?.images?.length > 0 && (
                <>
                  <img
                    src={facility.media.images[selectedImageIndex]?.url}
                    alt={facility.name}
                    className="w-full h-full object-cover"
                  />
                  {facility.media.images.length > 1 && (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute left-2 top-1/2 transform -translate-y-1/2"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        onClick={nextImage}
                      >
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </>
              )}
              {(!facility.media?.images?.length) && (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <Building2 className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>
            
            {/* Specialties below image */}
            {facility.specialties && facility.specialties.length > 0 && (
              <Card className="mt-4 w-64 mx-auto">
                <CardContent className="p-4">
                  <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Specialties
                  </h3>
                  <div className="grid gap-2">
                    {facility.specialties.map((specialty, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                        <span>{specialty}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Right - Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-5 space-y-5">
              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => handleCall(facility.phone)} className="flex-1">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Now
                </Button>
                <Button variant="outline" onClick={handleGetDirections} className="flex-1">
                  <Navigation className="h-4 w-4 mr-2" />
                  Directions
                </Button>
                <Button variant="outline" className="flex-1">
                  <Calendar className="h-4 w-4 mr-2" />
                  Book
                </Button>
              </div>

              {/* About */}
              <Card>
                <CardContent className="p-5">
                  <h3 className="text-lg font-semibold mb-3">About</h3>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    {facility.description || 
                      `${facility.name} is a ${formatType(facility.type, facility.subCategory).toLowerCase()} providing quality healthcare services.`}
                  </p>
                  {facility.acceptedInsurance && facility.acceptedInsurance.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Insurance Accepted</h4>
                      <div className="flex flex-wrap gap-2">
                        {facility.acceptedInsurance.map((insurance, index) => (
                          <Badge key={index} variant="secondary" className="text-sm">
                            {insurance}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 gap-5">
                {/* Contact Information */}
                <Card>
                  <CardContent className="p-5">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Phone className="h-5 w-5 text-primary" />
                      Contact
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 text-base">
                        <MapPin className="h-5 w-5 mt-0.5 text-muted-foreground" />
                        <div>
                          <p>{facility.fullAddress}</p>
                          {facility.address?.landmark && (
                            <p className="text-sm text-muted-foreground">
                              Near {facility.address.landmark}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 text-base">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <span>{facility.phone}</span>
                      </div>

                      {facility.email && (
                        <div className="flex items-center gap-3 text-base">
                          <Mail className="h-5 w-5 text-muted-foreground" />
                          <span>{facility.email}</span>
                        </div>
                      )}

                      {facility.website && (
                        <div className="flex items-center gap-3 text-base">
                          <Globe className="h-5 w-5 text-muted-foreground" />
                          <a href={facility.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            Visit Website
                          </a>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Operating Hours */}
                <Card>
                  <CardContent className="p-5">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Hours
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-base">
                          {formatOperatingHours(facility.operatingHours, facility.is24x7)}
                        </span>
                        <Badge variant={isCurrentlyOpen(facility.operatingHours, facility.is24x7) ? "default" : "secondary"} className="text-sm">
                          {isCurrentlyOpen(facility.operatingHours, facility.is24x7) ? 'Open Now' : 'Closed'}
                        </Badge>
                      </div>
                      
                      {!facility.is24x7 && facility.operatingHours && (
                        <div className="bg-muted/50 rounded-lg p-3">
                          <div className="space-y-2">
                            {Array.isArray(facility.operatingHours) ? (
                              // API array format: [{ day, isOpen, openTime, closeTime, _id }]
                              facility.operatingHours.map((h, idx) => (
                                <div key={h._id || idx} className="flex justify-between text-sm">
                                  <span className="capitalize">{String(h.day || '').toLowerCase()}</span>
                                  <span className="text-muted-foreground">
                                    {h.isOpen ? `${h.openTime} - ${h.closeTime}` : 'Closed'}
                                  </span>
                                </div>
                              ))
                            ) : (
                              // Object map format: { monday: "09:00 - 17:00", tuesday: "Closed", ... }
                              Object.entries(facility.operatingHours).map(([day, hours]) => (
                                <div key={day} className="flex justify-between text-sm">
                                  <span className="capitalize">{day}</span>
                                  <span className="text-muted-foreground">{typeof hours === 'string' ? hours : (hours?.isOpen ? `${hours.openTime} - ${hours.closeTime}` : 'Closed')}</span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Facility Information */}
                <Card>
                  <CardContent className="p-5">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      Facility Info
                    </h3>
                    <div className="space-y-3">
                      {facility.emergencyServices && (
                        <div className="flex items-center gap-3 text-base text-green-700 bg-green-50 p-3 rounded">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>24/7 Emergency Services</span>
                        </div>
                      )}
                      {facility.bedCount && (
                        <div className="flex items-center gap-3 text-base">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>{facility.bedCount} Beds Available</span>
                        </div>
                      )}
                      {facility.traumaCenter && facility.traumaCenter !== 'None' && (
                        <div className="flex items-center gap-3 text-base text-red-700 bg-red-50 p-3 rounded">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span>Trauma Center - {facility.traumaCenter}</span>
                        </div>
                      )}
                      {facility.languages && facility.languages.length > 0 && (
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span className="text-sm font-medium text-muted-foreground">Languages Spoken</span>
                          </div>
                          <div className="flex flex-wrap gap-2 ml-5">
                            {facility.languages.map((language, index) => (
                              <Badge key={index} variant="outline" className="text-sm">
                                {language}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FacilityDetailsModal;