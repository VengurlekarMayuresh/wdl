import express from 'express';
import { authenticate, authorize, checkOwnership } from '../middleware/auth.js';
import Patient from '../models/Patient.js';
import User from '../models/User.js';

const router = express.Router();

// @route   GET /api/patients/profile/me
// @desc    Get current patient's profile
// @access  Private (Patient only)
router.get('/profile/me', authenticate, authorize('patient'), async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id })
      .populate('userId')
      .populate('healthcareTeam.doctorId', 'userId primarySpecialty');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    res.json({
      success: true,
      data: { patient }
    });

  } catch (error) {
    console.error('Get patient profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching patient profile'
    });
  }
});

// @route   PUT /api/patients/profile/me
// @desc    Update current patient's profile
// @access  Private (Patient only)
router.put('/profile/me', authenticate, authorize('patient'), async (req, res) => {
  try {
    const allowedFields = [
      'emergencyContacts',
      'insurance',
      'preferences',
      'advanceDirectives'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key) && req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    const patient = await Patient.findOneAndUpdate(
      { userId: req.user._id },
      updates,
      { new: true, runValidators: true }
    ).populate('userId');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    res.json({
      success: true,
      message: 'Patient profile updated successfully',
      data: { patient }
    });

  } catch (error) {
    console.error('Update patient profile error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error updating patient profile'
    });
  }
});

// @route   POST /api/patients/profile/emergency-contact
// @desc    Add emergency contact
// @access  Private (Patient only)
router.post('/profile/emergency-contact', authenticate, authorize('patient'), async (req, res) => {
  try {
    const { name, relationship, phone, email, address, isPrimary } = req.body;

    if (!name || !relationship || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name, relationship, and phone are required'
      });
    }

    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    // If setting as primary, remove primary flag from others
    if (isPrimary) {
      patient.emergencyContacts.forEach(contact => {
        contact.isPrimary = false;
      });
    }

    patient.emergencyContacts.push({
      name,
      relationship,
      phone,
      email,
      address,
      isPrimary: isPrimary || false
    });

    await patient.save();

    res.status(201).json({
      success: true,
      message: 'Emergency contact added successfully',
      data: { 
        emergencyContact: patient.emergencyContacts[patient.emergencyContacts.length - 1] 
      }
    });

  } catch (error) {
    console.error('Add emergency contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding emergency contact'
    });
  }
});

// @route   PUT /api/patients/profile/emergency-contact/:contactId
// @desc    Update emergency contact
// @access  Private (Patient only)
router.put('/profile/emergency-contact/:contactId', authenticate, authorize('patient'), async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    const contact = patient.emergencyContacts.id(req.params.contactId);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Emergency contact not found'
      });
    }

    // If setting as primary, remove primary flag from others
    if (req.body.isPrimary) {
      patient.emergencyContacts.forEach(c => {
        if (c._id.toString() !== req.params.contactId) {
          c.isPrimary = false;
        }
      });
    }

    // Update fields
    const allowedFields = ['name', 'relationship', 'phone', 'email', 'address', 'isPrimary'];
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        contact[key] = req.body[key];
      }
    });

    await patient.save();

    res.json({
      success: true,
      message: 'Emergency contact updated successfully',
      data: { emergencyContact: contact }
    });

  } catch (error) {
    console.error('Update emergency contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating emergency contact'
    });
  }
});

// @route   DELETE /api/patients/profile/emergency-contact/:contactId
// @desc    Delete emergency contact
// @access  Private (Patient only)
router.delete('/profile/emergency-contact/:contactId', authenticate, authorize('patient'), async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    const contact = patient.emergencyContacts.id(req.params.contactId);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Emergency contact not found'
      });
    }

    contact.remove();
    await patient.save();

    res.json({
      success: true,
      message: 'Emergency contact deleted successfully'
    });

  } catch (error) {
    console.error('Delete emergency contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting emergency contact'
    });
  }
});

// @route   PUT /api/patients/profile/medical-history
// @desc    Update medical history
// @access  Private (Patient only)
router.put('/profile/medical-history', authenticate, authorize('patient'), async (req, res) => {
  try {
    const allowedFields = [
      'medicalHistory.currentConditions',
      'medicalHistory.pastConditions',
      'medicalHistory.surgeries',
      'medicalHistory.hospitalizations'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (key === 'medicalHistory' && req.body[key]) {
        Object.keys(req.body[key]).forEach(subKey => {
          const fullKey = `medicalHistory.${subKey}`;
          if (allowedFields.includes(fullKey)) {
            updates[fullKey] = req.body[key][subKey];
          }
        });
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid medical history fields to update'
      });
    }

    const patient = await Patient.findOneAndUpdate(
      { userId: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    res.json({
      success: true,
      message: 'Medical history updated successfully',
      data: { medicalHistory: patient.medicalHistory }
    });

  } catch (error) {
    console.error('Update medical history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating medical history'
    });
  }
});

// @route   POST /api/patients/profile/medication
// @desc    Add current medication
// @access  Private (Patient only)
router.post('/profile/medication', authenticate, authorize('patient'), async (req, res) => {
  try {
    const { name, dosage, frequency, route, startDate, prescribedBy, reason, notes } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Medication name is required'
      });
    }

    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    patient.medications.current.push({
      name,
      dosage,
      frequency,
      route: route || 'oral',
      startDate: startDate ? new Date(startDate) : new Date(),
      prescribedBy,
      reason,
      notes,
      isActive: true
    });

    await patient.save();

    res.status(201).json({
      success: true,
      message: 'Medication added successfully',
      data: { 
        medication: patient.medications.current[patient.medications.current.length - 1] 
      }
    });

  } catch (error) {
    console.error('Add medication error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding medication'
    });
  }
});

// @route   PUT /api/patients/profile/medication/:medicationId
// @desc    Update current medication
// @access  Private (Patient only)
router.put('/profile/medication/:medicationId', authenticate, authorize('patient'), async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    const medication = patient.medications.current.id(req.params.medicationId);
    if (!medication) {
      return res.status(404).json({
        success: false,
        message: 'Medication not found'
      });
    }

    // Update fields
    const allowedFields = ['name', 'dosage', 'frequency', 'route', 'startDate', 'prescribedBy', 'reason', 'notes', 'isActive'];
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        if (key === 'startDate' && req.body[key]) {
          medication[key] = new Date(req.body[key]);
        } else {
          medication[key] = req.body[key];
        }
      }
    });

    await patient.save();

    res.json({
      success: true,
      message: 'Medication updated successfully',
      data: { medication }
    });

  } catch (error) {
    console.error('Update medication error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating medication'
    });
  }
});

// @route   POST /api/patients/profile/allergy
// @desc    Add allergy
// @access  Private (Patient only)
router.post('/profile/allergy', authenticate, authorize('patient'), async (req, res) => {
  try {
    const { allergen, type, reaction, severity, notes, dateIdentified } = req.body;

    if (!allergen || !type || !reaction || !severity) {
      return res.status(400).json({
        success: false,
        message: 'Allergen, type, reaction, and severity are required'
      });
    }

    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    patient.allergies.push({
      allergen,
      type,
      reaction,
      severity,
      notes,
      dateIdentified: dateIdentified ? new Date(dateIdentified) : new Date()
    });

    await patient.save();

    res.status(201).json({
      success: true,
      message: 'Allergy added successfully',
      data: { 
        allergy: patient.allergies[patient.allergies.length - 1] 
      }
    });

  } catch (error) {
    console.error('Add allergy error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding allergy'
    });
  }
});

// @route   PUT /api/patients/profile/vital-signs
// @desc    Update vital signs
// @access  Private (Patient only)
router.put('/profile/vital-signs', authenticate, authorize('patient'), async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    const allowedVitals = ['height', 'weight', 'bloodPressure', 'heartRate', 'temperature', 'respiratoryRate', 'oxygenSaturation'];
    const currentTime = new Date();

    Object.keys(req.body).forEach(vital => {
      if (allowedVitals.includes(vital) && req.body[vital]) {
        if (vital === 'bloodPressure') {
          if (req.body[vital].systolic && req.body[vital].diastolic) {
            patient.vitalSigns[vital] = {
              systolic: req.body[vital].systolic,
              diastolic: req.body[vital].diastolic,
              lastUpdated: currentTime
            };
          }
        } else {
          patient.vitalSigns[vital] = {
            ...patient.vitalSigns[vital].toObject(),
            value: req.body[vital].value || req.body[vital],
            lastUpdated: currentTime
          };
        }
      }
    });

    await patient.save();

    res.json({
      success: true,
      message: 'Vital signs updated successfully',
      data: { vitalSigns: patient.vitalSigns, bmi: patient.bmi, bmiCategory: patient.bmiCategory }
    });

  } catch (error) {
    console.error('Update vital signs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating vital signs'
    });
  }
});

// @route   GET /api/patients/profile/summary
// @desc    Get patient summary for healthcare providers
// @access  Private (Patient only or Healthcare Provider with permission)
router.get('/profile/summary', authenticate, async (req, res) => {
  try {
    // For now, only allow patients to access their own summary
    // In a real app, you'd check if the requester is an authorized healthcare provider
    if (req.user.userType !== 'patient') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only patients can access this endpoint currently.'
      });
    }

    const patient = await Patient.findOne({ userId: req.user._id })
      .populate('userId', 'firstName lastName dateOfBirth gender')
      .populate('healthcareTeam.doctorId');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    // Create summary with key information
    const summary = {
      patientInfo: {
        name: patient.userInfo?.fullName || `${patient.userId.firstName} ${patient.userId.lastName}`,
        patientId: patient.patientId,
        dateOfBirth: patient.userId.dateOfBirth,
        age: patient.userInfo?.age,
        gender: patient.userId.gender
      },
      emergencyContact: patient.getPrimaryEmergencyContact(),
      activeMedications: patient.getActiveMedications(),
      severeAllergies: patient.getSevereAllergies(),
      primaryCarePhysician: patient.getPrimaryCarePhysician(),
      currentConditions: patient.medicalHistory?.currentConditions?.filter(condition => 
        condition.status === 'active' || condition.status === 'chronic'
      ),
      vitalSigns: patient.vitalSigns,
      bmi: patient.bmi,
      bmiCategory: patient.bmiCategory,
      insurance: patient.insurance?.isActive ? {
        provider: patient.insurance.provider,
        policyNumber: patient.insurance.policyNumber?.replace(/./g, '*').slice(-4)
      } : null
    };

    res.json({
      success: true,
      data: { summary }
    });

  } catch (error) {
    console.error('Get patient summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching patient summary'
    });
  }
});

// @route   GET /api/patients/stats/dashboard
// @desc    Get patient dashboard statistics
// @access  Private (Patient only)
router.get('/stats/dashboard', authenticate, authorize('patient'), async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    const stats = {
      profileCompletion: calculatePatientProfileCompletion(patient),
      activeMedicationsCount: patient.getActiveMedications().length,
      allergiesCount: patient.allergies.length,
      emergencyContactsCount: patient.emergencyContacts.length,
      hasPrimaryCarePhysician: !!patient.getPrimaryCarePhysician(),
      healthcareTeamSize: patient.healthcareTeam.filter(member => member.isActive).length,
      lastVitalSignsUpdate: getLastVitalSignsUpdate(patient.vitalSigns),
      hasInsurance: !!patient.insurance?.isActive,
      bmi: patient.bmi,
      bmiCategory: patient.bmiCategory
    };

    res.json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    console.error('Get patient stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching dashboard statistics'
    });
  }
});

// Helper function to calculate patient profile completion
function calculatePatientProfileCompletion(patient) {
  const sections = [
    { name: 'basicInfo', weight: 20, completed: !!patient.userId },
    { name: 'emergencyContacts', weight: 15, completed: patient.emergencyContacts.length > 0 },
    { name: 'insurance', weight: 15, completed: !!patient.insurance?.provider },
    { name: 'allergies', weight: 10, completed: patient.allergies.length > 0 },
    { name: 'medications', weight: 10, completed: patient.medications.current.length > 0 },
    { name: 'vitalSigns', weight: 15, completed: !!(patient.vitalSigns?.height?.value && patient.vitalSigns?.weight?.value) },
    { name: 'medicalHistory', weight: 15, completed: !!(patient.medicalHistory?.currentConditions?.length > 0 || patient.medicalHistory?.pastConditions?.length > 0) }
  ];

  let totalWeight = 0;
  let completedWeight = 0;

  sections.forEach(section => {
    totalWeight += section.weight;
    if (section.completed) {
      completedWeight += section.weight;
    }
  });

  return Math.round((completedWeight / totalWeight) * 100);
}

// Helper function to get last vital signs update
function getLastVitalSignsUpdate(vitalSigns) {
  if (!vitalSigns) return null;

  const dates = [];
  Object.values(vitalSigns).forEach(vital => {
    if (vital?.lastUpdated) {
      dates.push(new Date(vital.lastUpdated));
    }
  });

  return dates.length > 0 ? new Date(Math.max(...dates)) : null;
}

export default router;