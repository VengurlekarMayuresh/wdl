import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import Slot from '../models/Slot.js';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';

const router = express.Router();

// =======================
// SLOT MANAGEMENT ROUTES
// =======================

// @route   GET /api/appointments/slots/my
// @desc    Get current doctor's slots
// @access  Private (Doctor only)
router.get('/slots/my', authenticate, authorize('doctor'), async (req, res) => {
  try {
    let doctor = await Doctor.findOne({ userId: req.user._id });
    
    // Development mode: Create mock doctor if needed
    if (!doctor && process.env.NODE_ENV === 'development' && req.user._id === 'doctor_123456') {
      console.log('🔧 Development mode: Creating mock doctor profile');
      doctor = await Doctor.create({
        userId: req.user._id,
        medicalLicenseNumber: 'DEV123456',
        licenseState: 'NY',
        primarySpecialty: 'Cardiology',
        consultationFee: 100
      });
    }
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    const { 
      page = 1, 
      limit = 20, 
      status = 'all',
      fromDate,
      toDate 
    } = req.query;

    // Build query
    const query = { doctorId: doctor._id };

    // Filter by status
    if (status !== 'all') {
      if (status === 'available') {
        query.isAvailable = true;
        query.isBooked = false;
        query.status = 'active';
      } else if (status === 'booked') {
        query.isBooked = true;
      } else {
        query.status = status;
      }
    }

    // Filter by date range
    if (fromDate || toDate) {
      query.dateTime = {};
      if (fromDate) query.dateTime.$gte = new Date(fromDate);
      if (toDate) query.dateTime.$lte = new Date(toDate);
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const slots = await Slot.find(query)
      .populate('patientId', 'firstName lastName phone email')
      .populate('appointmentId')
      .sort({ dateTime: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Slot.countDocuments(query);

    res.json({
      success: true,
      data: {
        slots,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalSlots: total,
          hasNextPage: skip + slots.length < total,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get doctor slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching slots'
    });
  }
});

// @route   POST /api/appointments/slots
// @desc    Create a new slot
// @access  Private (Doctor only)
router.post('/slots', authenticate, authorize('doctor'), async (req, res) => {
  try {
    let doctor = await Doctor.findOne({ userId: req.user._id });
    
    // Development mode: Create mock doctor if needed
    if (!doctor && process.env.NODE_ENV === 'development' && req.user._id === 'doctor_123456') {
      console.log('🔧 Development mode: Creating mock doctor profile for slots');
      doctor = await Doctor.create({
        userId: req.user._id,
        medicalLicenseNumber: 'DEV123456',
        licenseState: 'NY',
        primarySpecialty: 'Cardiology',
        consultationFee: 100
      });
    }
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    const {
      dateTime,
      type = 'consultation',
      duration = 30,
      consultationFee,
      notes,
      requirements,
      consultationType = 'in-person',
      telemedicineLink
    } = req.body;

    // Validation
    if (!dateTime) {
      return res.status(400).json({
        success: false,
        message: 'Date and time are required'
      });
    }

    // Check if slot date/time is in the past
    const slotDateTime = new Date(dateTime);
    if (slotDateTime < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create slots in the past'
      });
    }

    // Check for conflicting slots
    const conflictingSlot = await Slot.findOne({
      doctorId: doctor._id,
      dateTime: slotDateTime,
      status: 'active'
    });

    if (conflictingSlot) {
      return res.status(400).json({
        success: false,
        message: 'A slot already exists at this date and time'
      });
    }

    // Create new slot
    const slot = new Slot({
      doctorId: doctor._id,
      dateTime: slotDateTime,
      duration,
      consultationFee: consultationFee || doctor.consultationFee || 0,
      notes,
      requirements,
      consultationType,
      telemedicineLink
    });

    await slot.save();

    res.status(201).json({
      success: true,
      message: 'Slot created successfully',
      data: { slot }
    });

  } catch (error) {
    console.error('Create slot error:', error);
    
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
      message: 'Server error creating slot'
    });
  }
});

// @route   PUT /api/appointments/slots/:slotId
// @desc    Update a slot
// @access  Private (Doctor only)
router.put('/slots/:slotId', authenticate, authorize('doctor'), async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    const slot = await Slot.findOne({
      _id: req.params.slotId,
      doctorId: doctor._id
    });

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Slot not found'
      });
    }

    // Check if slot is booked
    if (slot.isBooked) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update a booked slot'
      });
    }

    // Update allowed fields
    const allowedFields = [
      'dateTime', 'duration', 'consultationFee',
      'notes', 'requirements', 'consultationType', 'telemedicineLink'
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

    // If updating dateTime, check for conflicts
    if (updates.dateTime) {
      const newDateTime = new Date(updates.dateTime);
      
      if (newDateTime < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Cannot schedule slots in the past'
        });
      }

      const conflictingSlot = await Slot.findOne({
        _id: { $ne: slot._id },
        doctorId: doctor._id,
        dateTime: newDateTime,
        status: 'active'
      });

      if (conflictingSlot) {
        return res.status(400).json({
          success: false,
          message: 'A slot already exists at this date and time'
        });
      }
    }

    // Update the slot
    Object.assign(slot, updates);
    await slot.save();

    res.json({
      success: true,
      message: 'Slot updated successfully',
      data: { slot }
    });

  } catch (error) {
    console.error('Update slot error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating slot'
    });
  }
});

// @route   DELETE /api/appointments/slots/:slotId
// @desc    Delete a slot
// @access  Private (Doctor only)
router.delete('/slots/:slotId', authenticate, authorize('doctor'), async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    const slot = await Slot.findOne({
      _id: req.params.slotId,
      doctorId: doctor._id
    });

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Slot not found'
      });
    }

    // Check if slot is booked
    if (slot.isBooked) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a booked slot. Cancel the appointment first.'
      });
    }

    await Slot.findByIdAndDelete(req.params.slotId);

    res.json({
      success: true,
      message: 'Slot deleted successfully'
    });

  } catch (error) {
    console.error('Delete slot error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting slot'
    });
  }
});

// @route   GET /api/appointments/slots/doctor/:doctorId
// @desc    Get available slots for a specific doctor (public)
// @access  Public
router.get('/slots/doctor/:doctorId', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { 
      fromDate = new Date().toISOString().split('T')[0], 
      toDate,
      type,
      consultationType 
    } = req.query;

    // Build query for available slots only
    const query = {
      doctorId,
      isAvailable: true,
      isBooked: false,
      status: 'active',
      dateTime: { $gte: new Date(fromDate) }
    };

    if (toDate) {
      query.dateTime.$lte = new Date(toDate);
    }

    if (type) {
      query.type = type;
    }

    if (consultationType) {
      query.consultationType = consultationType;
    }

    const slots = await Slot.find(query)
      .sort({ dateTime: 1 })
      .limit(50); // Limit to prevent too many results

    res.json({
      success: true,
      data: { slots }
    });

  } catch (error) {
    console.error('Get doctor slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching doctor slots'
    });
  }
});

// =======================
// APPOINTMENT ROUTES
// =======================

// @route   POST /api/appointments
// @desc    Book an appointment (Patient)
// @access  Private (Patient only)
router.post('/', authenticate, authorize('patient'), async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    const {
      slotId,
      reasonForVisit,
      appointmentType = 'consultation', // Allow patient to specify appointment type
      symptoms,
      relevantMedicalHistory,
      currentMedications = [],
      allergies = [],
      contactPreferences = {}
    } = req.body;

    // Validation
    if (!slotId || !reasonForVisit) {
      return res.status(400).json({
        success: false,
        message: 'Slot ID and reason for visit are required'
      });
    }

    // Find and validate the slot
    const slot = await Slot.findById(slotId).populate('doctorId');
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Slot not found'
      });
    }

    if (!slot.canBeBooked()) {
      return res.status(400).json({
        success: false,
        message: 'This slot is no longer available'
      });
    }

    // Extract appointment date from slot
    const appointmentDate = slot.dateTime;

    // Create the appointment
    const appointment = new Appointment({
      doctorId: slot.doctorId._id,
      patientId: patient._id,
      slotId: slot._id,
      appointmentDate,
      duration: slot.duration,
      appointmentType: appointmentType, // Use patient-specified appointment type
      consultationType: slot.consultationType,
      reasonForVisit,
      symptoms,
      relevantMedicalHistory,
      currentMedications,
      allergies,
      contactPreferences,
      consultationFee: slot.consultationFee
    });

    await appointment.save();

    // Reserve the slot immediately (mark as booked but not confirmed)
    // This prevents other patients from booking the same slot
    await slot.book(patient._id, appointment._id);
    
    // Populate appointment data for response
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('doctorId', 'primarySpecialty')
      .populate('slotId');

    res.status(201).json({
      success: true,
      message: 'Appointment request sent successfully! The doctor will review your request.',
      data: { appointment: populatedAppointment }
    });

  } catch (error) {
    console.error('Book appointment error:', error);
    
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
      message: 'Server error booking appointment'
    });
  }
});

// @route   GET /api/appointments/doctor/my
// @desc    Get current doctor's appointments
// @access  Private (Doctor only)
router.get('/doctor/my', authenticate, authorize('doctor'), async (req, res) => {
  try {
    let doctor = await Doctor.findOne({ userId: req.user._id });
    
    // Development mode: Create mock doctor if needed
    if (!doctor && process.env.NODE_ENV === 'development' && req.user._id === 'doctor_123456') {
      console.log('🔧 Development mode: Creating mock doctor profile for appointments');
      doctor = await Doctor.create({
        userId: req.user._id,
        medicalLicenseNumber: 'DEV123456',
        licenseState: 'NY',
        primarySpecialty: 'Cardiology',
        consultationFee: 100
      });
    }
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    const { 
      page = 1, 
      limit = 20, 
      status = 'all',
      fromDate,
      toDate 
    } = req.query;

    // Build query
    const query = { doctorId: doctor._id };

    if (status !== 'all') {
      query.status = status;
    }

    // Filter by date range
    if (fromDate || toDate) {
      query.appointmentDate = {};
      if (fromDate) query.appointmentDate.$gte = new Date(fromDate);
      if (toDate) query.appointmentDate.$lte = new Date(toDate);
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const appointments = await Appointment.find(query)
      .populate({
        path: 'patientId',
        select: 'firstName lastName phone email dateOfBirth',
        populate: {
          path: 'userId',
          select: 'firstName lastName email phone profilePicture'
        }
      })
      .populate('slotId')
      .sort({ appointmentDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Appointment.countDocuments(query);

    res.json({
      success: true,
      data: {
        appointments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalAppointments: total,
          hasNextPage: skip + appointments.length < total,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get doctor appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching appointments'
    });
  }
});

// @route   GET /api/appointments/patient/my
// @desc    Get current patient's appointments
// @access  Private (Patient only)
router.get('/patient/my', authenticate, authorize('patient'), async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    const { limit = 20 } = req.query;

    const appointments = await Appointment.findForPatient(patient._id, parseInt(limit))
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'firstName lastName'
        }
      });

    res.json({
      success: true,
      data: { appointments }
    });

  } catch (error) {
    console.error('Get patient appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching appointments'
    });
  }
});

// @route   PUT /api/appointments/:appointmentId/status
// @desc    Update appointment status (Doctor)
// @access  Private (Doctor only)
router.put('/:appointmentId/status', authenticate, authorize('doctor'), async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    const { status, notes, diagnosis, treatmentPlan, cancellationReason, rejectionReason } = req.body;

    const appointment = await Appointment.findOne({
      _id: req.params.appointmentId,
      doctorId: doctor._id
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

  // Handle different status updates
    switch (status) {
      case 'confirmed':
        // Slot is already reserved, just confirm the appointment
        await appointment.confirm();
        break;
      case 'cancelled':
      case 'rejected':
        const reason = status === 'rejected' ? rejectionReason : cancellationReason;
        
        // For rejection, update appointment status and free up the slot
        if (status === 'rejected') {
          appointment.status = 'rejected';
          appointment.rejectionReason = reason || 'No reason provided';
          appointment.cancelledBy = 'doctor';
          appointment.cancelledAt = new Date();
          await appointment.save();
        } else {
          await appointment.cancel('doctor', reason);
        }
        
        // Free up the reserved slot so other patients can book it
        const slot = await Slot.findById(appointment.slotId);
        if (slot) {
          await slot.cancelBooking('doctor', reason || 'Appointment cancelled/rejected');
        }
        break;
      case 'completed':
        await appointment.complete(notes, diagnosis, treatmentPlan);
        break;
      default:
        appointment.status = status;
        await appointment.save();
    }

    res.json({
      success: true,
      message: `Appointment ${status} successfully`,
      data: { appointment }
    });

  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating appointment status'
    });
  }
});

// @route   PUT /api/appointments/:appointmentId/reschedule
// @desc    Reschedule an appointment
// @access  Private (Doctor or Patient)
router.put('/:appointmentId/reschedule', authenticate, async (req, res) => {
  try {
    const { newSlotId, reason } = req.body;
    
    if (!newSlotId) {
      return res.status(400).json({
        success: false,
        message: 'New slot ID is required for rescheduling'
      });
    }

    // Find the appointment
    const appointment = await Appointment.findById(req.params.appointmentId)
      .populate('doctorId')
      .populate('patientId');
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user has permission to reschedule
    let canReschedule = false;
    if (req.user.userType === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      canReschedule = doctor && doctor._id.equals(appointment.doctorId._id);
    } else if (req.user.userType === 'patient') {
      const patient = await Patient.findOne({ userId: req.user._id });
      canReschedule = patient && patient._id.equals(appointment.patientId._id);
    }

    if (!canReschedule) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reschedule this appointment'
      });
    }

    // Find and validate the new slot
    const newSlot = await Slot.findById(newSlotId);
    if (!newSlot) {
      return res.status(404).json({
        success: false,
        message: 'New slot not found'
      });
    }

    if (!newSlot.canBeBooked()) {
      return res.status(400).json({
        success: false,
        message: 'Selected slot is not available'
      });
    }

    // Free up the old slot
    const oldSlot = await Slot.findById(appointment.slotId);
    if (oldSlot) {
      await oldSlot.cancelBooking(req.user.userType, reason || 'Rescheduled');
    }

    // Book the new slot
    await newSlot.book(appointment.patientId._id, appointment._id);

    // Update appointment with reschedule information
    await appointment.reschedule(
      newSlotId,
      newSlot.dateTime,
      req.user.userType,
      reason || 'Rescheduled'
    );

    // Reset status to pending if rescheduled by patient
    if (req.user.userType === 'patient') {
      appointment.status = 'pending';
      await appointment.save();
    }

    const updatedAppointment = await Appointment.findById(appointment._id)
      .populate('doctorId', 'primarySpecialty')
      .populate('patientId', 'firstName lastName')
      .populate('slotId');

    res.json({
      success: true,
      message: 'Appointment rescheduled successfully',
      data: { appointment: updatedAppointment }
    });

  } catch (error) {
    console.error('Reschedule appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error rescheduling appointment'
    });
  }
});

// @route   DELETE /api/appointments/slots/all
// @desc    Delete all slots for the current doctor (Admin cleanup)
// @access  Private (Doctor only) - for admin cleanup
router.delete('/slots/all', authenticate, authorize('doctor'), async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    // Delete only unbooked slots
    const result = await Slot.deleteMany({
      doctorId: doctor._id,
      isBooked: false
    });

    res.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} unbooked slots`,
      data: { deletedCount: result.deletedCount }
    });

  } catch (error) {
    console.error('Delete all slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting slots'
    });
  }
});

export default router;