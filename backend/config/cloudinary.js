import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Validate Cloudinary configuration
const validateCloudinaryConfig = () => {
  const requiredVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing Cloudinary environment variables:', missingVars.join(', '));
    throw new Error('Cloudinary configuration incomplete');
  }
  
  console.log('✅ Cloudinary configured successfully');
  return true;
};

// Helper function to upload to Cloudinary
export const uploadToCloudinary = async (fileBuffer, options = {}) => {
  const {
    folder = 'healthcare/general',
    width,
    height,
    crop = 'fill',
    quality = 'auto',
    resource_type = 'auto'
  } = options;

  try {
    const result = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${fileBuffer.toString('base64')}`,
      {
        folder,
        transformation: [
          ...(width && height ? [{ width, height, crop }] : []),
          { quality, fetch_format: 'auto' }
        ],
        resource_type
      }
    );
    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

// Profile picture upload function
export const uploadProfilePicture = async (fileBuffer) => {
  return uploadToCloudinary(fileBuffer, {
    folder: 'healthcare/profile-pictures',
    width: 300,
    height: 300,
    crop: 'fill'
  });
};

// Document upload function
export const uploadDocument = async (fileBuffer) => {
  return uploadToCloudinary(fileBuffer, {
    folder: 'healthcare/documents',
    resource_type: 'auto'
  });
};

// File size limits (in bytes)
const FILE_SIZE_LIMITS = {
  profilePicture: 5 * 1024 * 1024, // 5MB
  document: 10 * 1024 * 1024, // 10MB
  general: 5 * 1024 * 1024 // 5MB
};

// Create multer upload middleware for file handling
export const createUploadMiddleware = (fieldName, maxSize = FILE_SIZE_LIMITS.general) => {
  return multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: maxSize,
      files: 5 // Maximum 5 files per request
    },
    fileFilter: (req, file, cb) => {
      // Check file type
      const allowedTypes = /jpeg|jpg|png|gif|webp|pdf/;
      const extname = allowedTypes.test(file.originalname.toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);
      
      if (extname && mimetype) {
        return cb(null, true);
      } else {
        return cb(new Error('Invalid file type. Only images (JPEG, PNG, GIF, WebP) and PDF files are allowed.'));
      }
    }
  }).single(fieldName);
};

// Specific upload middlewares
export const uploadProfilePictureMiddleware = createUploadMiddleware('profilePicture', FILE_SIZE_LIMITS.profilePicture);
export const uploadDocumentMiddleware = createUploadMiddleware('document', FILE_SIZE_LIMITS.document);
export const uploadGeneralMiddleware = createUploadMiddleware('file', FILE_SIZE_LIMITS.general);

// Helper function to delete files from Cloudinary
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('Cloudinary delete result:', result);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

// Helper function to get optimized image URL
export const getOptimizedImageUrl = (publicId, options = {}) => {
  const {
    width = 'auto',
    height = 'auto',
    crop = 'fill',
    quality = 'auto',
    format = 'auto'
  } = options;
  
  return cloudinary.url(publicId, {
    width,
    height,
    crop,
    quality,
    fetch_format: format
  });
};

// Initialize and validate configuration
validateCloudinaryConfig();

export default cloudinary;