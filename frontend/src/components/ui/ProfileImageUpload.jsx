import { useState, useRef } from 'react';
import { Button } from './button';
import { toast } from './use-toast';
import { Camera, Upload, X, User } from 'lucide-react';
import { uploadAPI, authAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

const ProfileImageUpload = ({ currentImage, onImageUpdate, size = 'lg' }) => {
  const { user, setUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24', 
    lg: 'w-32 h-32',
    xl: 'w-40 h-40'
  };

  const iconSizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-20 w-20'
  };

  const buttonSizes = {
    sm: 'w-6 h-6',
    md: 'w-7 h-7',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10'
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      // Show preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      
      // Upload to Cloudinary via backend
      const response = await uploadAPI.uploadProfilePicture(file);
      
      if (response.success && response.data) {
        // Update user profile with new image URL
        const updatedUser = await authAPI.updateProfile({
          profilePicture: response.data.url
        });

        // Update local user state
        setUser(updatedUser);
        
        // Call parent callback if provided
        if (onImageUpdate) {
          onImageUpdate(response.data.url, response.data.publicId);
        }

        // Clear preview
        setPreviewImage(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        toast({
          title: "Profile picture updated",
          description: "Your profile picture has been successfully updated.",
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload profile picture. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayImage = previewImage || currentImage || user?.profilePicture;

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className={`${sizeClasses[size]} bg-gradient-to-br from-primary/20 to-primary-light/20 rounded-full flex items-center justify-center overflow-hidden`}>
          {displayImage ? (
            <img
              src={displayImage}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <User className={`${iconSizes[size]} text-primary/50`} />
          )}
        </div>
        
        {!previewImage && (
          <Button
            variant="medical"
            size="icon"
            className={`absolute bottom-0 right-0 ${buttonSizes[size]} rounded-full`}
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Camera className="h-4 w-4" />
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {previewImage && (
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleUpload}
            disabled={isUploading}
            size="sm"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? 'Uploading...' : 'Save Photo'}
          </Button>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isUploading}
            size="sm"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      )}

      {!previewImage && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Photo
        </Button>
      )}
    </div>
  );
};

export default ProfileImageUpload;