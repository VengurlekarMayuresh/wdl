import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { 
  uploadProfilePictureMiddleware,
  uploadDocumentMiddleware,
  uploadProfilePicture,
  uploadDocument,
  deleteFromCloudinary
} from '../config/cloudinary.js';
import User from '../models/User.js';

const router = express.Router();

// @route   POST /api/upload/profile-picture
// @desc    Upload profile picture
// @access  Private
router.post('/profile-picture', authenticate, uploadProfilePictureMiddleware, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided'
      });
    }

    // Upload to Cloudinary
    const result = await uploadProfilePicture(req.file.buffer);
    
    // Update user profile picture
    const updatedUser = await User.findByIdAndUpdate(req.user._id, {
      profilePicture: result.secure_url,
      profilePictureCloudinaryId: result.public_id
    }, { new: true, select: 'firstName lastName email profilePicture profilePictureCloudinaryId userType' });

    res.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        user: updatedUser
      }
    });

  } catch (error) {
    console.error('Profile picture upload error:', error);
    
    if (error.message.includes('Invalid file type')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error uploading profile picture'
    });
  }
});

// @route   POST /api/upload/document
// @desc    Upload document (for verification, etc.)
// @access  Private
router.post('/document', authenticate, uploadDocumentMiddleware, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided'
      });
    }

    const { documentType = 'general', description } = req.body;

    // Upload to Cloudinary
    const result = await uploadDocument(req.file.buffer);

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        documentType,
        description,
        originalName: req.file.originalname,
        size: req.file.size,
        uploadDate: new Date()
      }
    });

  } catch (error) {
    console.error('Document upload error:', error);
    
    if (error.message.includes('Invalid file type')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error uploading document'
    });
  }
});

// @route   DELETE /api/upload/delete/:publicId
// @desc    Delete file from Cloudinary
// @access  Private
router.delete('/delete/:publicId', authenticate, async (req, res) => {
  try {
    const { publicId } = req.params;
    
    // Delete from Cloudinary
    const result = await deleteFromCloudinary(publicId);

    if (result.result === 'ok') {
      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to delete file'
      });
    }

  } catch (error) {
    console.error('File deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting file'
    });
  }
});

export default router;