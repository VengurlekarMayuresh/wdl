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
      doctorId,
      requestedDateTime,
      reasonForVisit,
      appointmentType = 'consultation', // Allow patient to specify appointment type
      symptoms,
      relevantMedicalHistory,
      currentMedications = [],
      allergies = [],
      contactPreferences = {}
    } = req.body;

    // Two flows:
    // 1) Book existing slot (auto-confirm) when slotId provided
    // 2) Create custom request (pending) when doctorId and requestedDateTime provided

    if (slotId) {
      if (!reasonForVisit) {
        return res.status(400).json({
          success: false,
          message: 'Reason for visit is required'
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

      // Create the appointment (will be confirmed immediately)
      const appointment = new Appointment({
        doctorId: slot.doctorId._id,
        patientId: patient._id,
        slotId: slot._id,
        appointmentDate,
        duration: slot.duration,
        appointmentType: appointmentType,
        consultationType: slot.consultationType,
        reasonForVisit,
        symptoms,
        relevantMedicalHistory,
        currentMedications,
        allergies,
        contactPreferences,
        consultationFee: slot.consultationFee,
        status: 'pending' // will be switched to confirmed below
      });

      await appointment.save();

      // Reserve the slot immediately
      await slot.book(patient._id, appointment._id);

      // Auto-confirm the appointment since it's a doctor-created slot
      await appointment.confirm();
      
      const populatedAppointment = await Appointment.findById(appointment._id)
        .populate('doctorId', 'primarySpecialty')
        .populate('slotId');

      return res.status(201).json({
        success: true,
        message: 'Appointment booked successfully and confirmed.',
        data: { appointment: populatedAppointment }
      });
    }

    // Custom request flow
    if (doctorId && requestedDateTime) {
      if (!reasonForVisit) {
        return res.status(400).json({
          success: false,
          message: 'Reason for visit is required'
        });
      }

      const doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Doctor not found'
        });
      }

      const reqDate = new Date(requestedDateTime);
      if (isNaN(reqDate.getTime()) || reqDate < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Requested date/time must be a valid future date'
        });
      }

      const appointment = new Appointment({
        doctorId: doctor._id,
        patientId: patient._id,
        appointmentDate: reqDate,
        isCustomRequest: true,
        requestedDateTime: reqDate,
        appointmentType,
        reasonForVisit,
        symptoms,
        relevantMedicalHistory,
        currentMedications,
        allergies,
        contactPreferences,
        consultationFee: doctor.consultationFee || 0,
        status: 'pending'
      });

      await appointment.save();

      const populatedAppointment = await Appointment.findById(appointment._id)
        .populate('doctorId', 'primarySpecialty');

      return res.status(201).json({
        success: true,
        message: 'Appointment request sent successfully! The doctor will review your request.',
        data: { appointment: populatedAppointment }
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Provide either a valid slotId to book immediately or doctorId and requestedDateTime to request an appointment.'
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
// @desc    Update appointment status (Doctor or Patient cancel)
// @access  Private (Doctor or Patient)
router.put('/:appointmentId/status', authenticate, async (req, res) => {
  try {
    const { status, notes, diagnosis, treatmentPlan, cancellationReason, rejectionReason } = req.body;

    if (req.user.userType === 'patient') {
      // Patient can only cancel their own appointment
      if (status !== 'cancelled') {
        return res.status(403).json({ success: false, message: 'Patients can only cancel their own appointments' });
      }

      const patient = await Patient.findOne({ userId: req.user._id });
      if (!patient) {
        return res.status(404).json({ success: false, message: 'Patient profile not found' });
      }

      const appointment = await Appointment.findOne({ _id: req.params.appointmentId, patientId: patient._id });
      if (!appointment) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }

      await appointment.cancel('patient', cancellationReason || 'Cancelled by patient');

      const slot = await Slot.findById(appointment.slotId);
      if (slot) {
        await slot.cancelBooking('patient', cancellationReason || 'Appointment cancelled');
      }

      return res.json({ success: true, message: 'Appointment cancelled', data: { appointment } });
    }

    // Doctor flow (includes approve/reject/complete)
    if (req.user.userType !== 'doctor') {
      return res.status(403).json({ success: false, message: 'Access denied. Required role: doctor or patient' });
    }

    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

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
        await appointment.confirm();
        break;
      case 'cancelled':
      case 'rejected':
        const reason = status === 'rejected' ? rejectionReason : cancellationReason;
        if (status === 'rejected') {
          appointment.status = 'rejected';
          appointment.rejectionReason = reason || 'No reason provided';
          appointment.cancelledBy = 'doctor';
          appointment.cancelledAt = new Date();
          await appointment.save();
        } else {
          await appointment.cancel('doctor', reason);
        }
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
// @desc    Patient direct reschedule (with doctor auto-approval for better UX)
// @access  Private (Patient only)
router.put('/:appointmentId/reschedule', authenticate, async (req, res) => {
  try {
    const { newSlotId, reason } = req.body;

    // Only patients can use direct reschedule
    if (req.user.userType !== 'patient') {
      return res.status(403).json({
        success: false,
        message: 'Only patients can directly reschedule. Doctors should use the propose workflow.'
      });
    }
    
    if (!newSlotId) {
      return res.status(400).json({
        success: false,
        message: 'New slot ID is required for rescheduling'
      });
    }

    // Find the appointment
    const appointment = await Appointment.findById(req.params.appointmentId)
      .populate('doctorId')
      .populate('patientId')
      .populate('slotId');
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if patient owns this appointment
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient || !patient._id.equals(appointment.patientId._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reschedule this appointment'
      });
    }

    // Validate appointment can be rescheduled
    if (!['pending', 'confirmed'].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: 'Only pending or confirmed appointments can be rescheduled'
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
        message: 'Selected slot is not available for booking'
      });
    }

    // Ensure new slot belongs to same doctor
    if (!newSlot.doctorId.equals(appointment.doctorId._id)) {
      return res.status(400).json({
        success: false,
        message: 'New slot must belong to the same doctor'
      });
    }

    // Get the current slot
    const currentSlot = appointment.slotId;
    if (!currentSlot) {
      return res.status(404).json({
        success: false,
        message: 'Current appointment slot not found'
      });
    }

    // Store original details for history
    const originalDate = currentSlot.dateTime;
    const originalAppointmentDate = appointment.appointmentDate;
    
    // UPDATE the existing slot with new timing (keep same slot ID)
    currentSlot.dateTime = newSlot.dateTime;
    currentSlot.duration = newSlot.duration;
    currentSlot.consultationFee = newSlot.consultationFee;
    currentSlot.consultationType = newSlot.consultationType;
    await currentSlot.save();
    
    console.log(`✅ Updated existing slot ${currentSlot._id.toString().substr(-8)} with new timing`);

    // Delete the NEW slot since we copied its details
    try {
      await Slot.findByIdAndDelete(newSlot._id);
      console.log(`🗑️ Deleted temporary slot ${newSlot._id.toString().substr(-8)} after copying details`);
    } catch (deleteError) {
      console.warn(`⚠️ Could not delete temporary slot ${newSlot._id}: ${deleteError.message}`);
    }

    // UPDATE the appointment with new details
    appointment.appointmentDate = currentSlot.dateTime;
    appointment.duration = currentSlot.duration;
    appointment.consultationFee = currentSlot.consultationFee;
    appointment.status = 'confirmed'; // Auto-confirm patient reschedules for better UX
    appointment.lastModifiedBy = 'patient';
    
    // Clear any pending reschedule state
    if (appointment.pendingReschedule?.active) {
      appointment.pendingReschedule.active = false;
      appointment.pendingReschedule.decision = 'superseded';
      appointment.pendingReschedule.decisionAt = new Date();
    }
    
    // Add to reschedule history
    appointment.rescheduledFrom = {
      originalDate: originalAppointmentDate,
      rescheduledBy: 'patient',
      rescheduledAt: new Date(),
      reason: reason || 'Patient rescheduled appointment'
    };
    
    await appointment.save();
    console.log(`✅ Updated appointment ${appointment._id.toString().substr(-8)} with new timing`);

    // Comprehensive cleanup of any duplicate/orphaned appointments
    await cleanupDuplicateRescheduleAppointments(appointment);

    const updatedAppointment = await Appointment.findById(appointment._id)
      .populate('doctorId', 'primarySpecialty consultationFee')
      .populate('patientId', 'firstName lastName phone email')
      .populate('slotId');

    res.json({
      success: true,
      message: 'Appointment rescheduled successfully. Your appointment has been confirmed for the new time.',
      data: { 
        appointment: updatedAppointment,
        rescheduledFrom: originalDate,
        rescheduledTo: currentSlot.dateTime
      }
    });

  } catch (error) {
    console.error('Patient reschedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error rescheduling appointment'
    });
  }
});

// Helper function to cleanup duplicate reschedule appointments
async function cleanupDuplicateRescheduleAppointments(appointment) {
  try {
    console.log(`🧹 Starting comprehensive cleanup for appointment ${appointment._id.toString().substr(-8)}`);
    
    // Multiple patterns to catch various reschedule-related duplicates
    const reschedulePatterns = [
      new RegExp(`reschedule.*${appointment._id.toString()}`, 'i'),
      new RegExp(`doctor reschedule request.*${appointment._id.toString()}`, 'i'),
      new RegExp(`patient reschedule request.*${appointment._id.toString()}`, 'i'),
      new RegExp(`reschedule request for appointment ${appointment._id.toString()}`, 'i')
    ];
    
    // Find potential duplicates using multiple criteria
    const duplicateAppointments = await Appointment.find({
      _id: { $ne: appointment._id },
      $or: [
        // Appointments with reschedule-related reasons
        { reasonForVisit: { $in: reschedulePatterns } },
        // Recent pending appointments for same doctor-patient pair
        {
          patientId: appointment.patientId._id,
          doctorId: appointment.doctorId._id,
          status: { $in: ['pending'] },
          createdAt: { $gte: new Date(Date.now() - 48 * 60 * 60 * 1000) }, // Last 48 hours
          reasonForVisit: { $regex: /reschedule/i }
        },
        // Appointments created very recently for same pair (likely duplicates)
        {
          patientId: appointment.patientId._id,
          doctorId: appointment.doctorId._id,
          status: 'pending',
          createdAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) } // Last 10 minutes
        }
      ]
    }).populate('slotId');
    
    if (duplicateAppointments.length > 0) {
      console.log(`🗑️ Found ${duplicateAppointments.length} potential duplicate appointments`);
      
      // Log details of duplicates for debugging
      duplicateAppointments.forEach(dup => {
        console.log(`  - ${dup._id.toString().substr(-8)}: ${dup.reasonForVisit.substring(0, 50)}... (${dup.status})`);
      });
      
      // Get the slot IDs from duplicates (excluding the main appointment's slot)
      const duplicateSlotIds = duplicateAppointments
        .map(apt => apt.slotId?._id || apt.slotId)
        .filter(slotId => slotId && !slotId.equals(appointment.slotId));
      
      // Delete duplicate appointments
      const deleteResult = await Appointment.deleteMany({
        _id: { $in: duplicateAppointments.map(apt => apt._id) }
      });
      console.log(`🗑️ Deleted ${deleteResult.deletedCount} duplicate appointments`);
      
      // Delete orphaned slots from duplicates
      if (duplicateSlotIds.length > 0) {
        const slotDeleteResult = await Slot.deleteMany({
          _id: { $in: duplicateSlotIds },
          isBooked: false // Only delete unbooked slots to be safe
        });
        console.log(`🗑️ Deleted ${slotDeleteResult.deletedCount} orphaned duplicate slots`);
      }
      
      return {
        appointmentsDeleted: deleteResult.deletedCount,
        slotsDeleted: duplicateSlotIds.length > 0 ? slotDeleteResult?.deletedCount || 0 : 0
      };
    } else {
      console.log('✅ No duplicate appointments found');
      return { appointmentsDeleted: 0, slotsDeleted: 0 };
    }
    
  } catch (cleanupError) {
    console.warn('⚠️ Cleanup error (non-critical):', cleanupError.message);
    return { appointmentsDeleted: 0, slotsDeleted: 0, error: cleanupError.message };
  }
}

// Helper function to clean up all reschedule-related orphaned data
async function performGlobalRescheduleCleanup() {
  try {
    console.log('🧹 Starting global reschedule cleanup...');
    
    // Find all appointments with reschedule-related reasons that are old and pending
    const oldRescheduleRequests = await Appointment.find({
      $or: [
        { 
          reasonForVisit: { $regex: /reschedule request/i },
          status: 'pending',
          createdAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Older than 7 days
        },
        {
          reasonForVisit: { $regex: /doctor reschedule|patient reschedule/i },
          status: 'pending',
          createdAt: { $lt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) } // Older than 3 days
        }
      ]
    }).populate('slotId');
    
    if (oldRescheduleRequests.length > 0) {
      console.log(`🗑️ Found ${oldRescheduleRequests.length} old reschedule requests to clean up`);
      
      const slotIds = oldRescheduleRequests
        .map(apt => apt.slotId?._id || apt.slotId)
        .filter(Boolean);
      
      // Delete old reschedule request appointments
      await Appointment.deleteMany({
        _id: { $in: oldRescheduleRequests.map(apt => apt._id) }
      });
      
      // Delete associated slots
      if (slotIds.length > 0) {
        await Slot.deleteMany({
          _id: { $in: slotIds },
          isBooked: false
        });
      }
      
      console.log(`✅ Cleaned up ${oldRescheduleRequests.length} old reschedule requests`);
    }
    
    // Find and clean up unbooked slots that are very old
    const oldUnbookedSlots = await Slot.find({
      isBooked: false,
      dateTime: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Older than 30 days
    });
    
    if (oldUnbookedSlots.length > 0) {
      await Slot.deleteMany({
        _id: { $in: oldUnbookedSlots.map(slot => slot._id) }
      });
      console.log(`✅ Cleaned up ${oldUnbookedSlots.length} old unbooked slots`);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Global cleanup error:', error);
    return { success: false, error: error.message };
  }
}

// @route   POST /api/appointments/:appointmentId/reschedule/propose
// @desc    Propose a reschedule (primarily for doctors, but patients can also use it)
// @access  Private (Doctor or Patient)
router.post('/:appointmentId/reschedule/propose', authenticate, async (req, res) => {
  try {
    const { proposedSlotId, proposedDateTime, reason } = req.body;

    const appointment = await Appointment.findById(req.params.appointmentId)
      .populate('doctorId')
      .populate('patientId')
      .populate('slotId');
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Validate appointment can be rescheduled
    if (!['pending', 'confirmed'].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: 'Only pending or confirmed appointments can be rescheduled'
      });
    }

    // Ownership check
    let owns = false;
    let proposerProfile = null;
    if (req.user.userType === 'doctor') {
      proposerProfile = await Doctor.findOne({ userId: req.user._id });
      owns = proposerProfile && appointment.doctorId && proposerProfile._id.equals(appointment.doctorId._id);
    } else if (req.user.userType === 'patient') {
      proposerProfile = await Patient.findOne({ userId: req.user._id });
      owns = proposerProfile && appointment.patientId && proposerProfile._id.equals(appointment.patientId._id);
    }
    if (!owns) {
      return res.status(403).json({ success: false, message: 'Not authorized for this appointment' });
    }

    // Check if there's already an active reschedule proposal
    if (appointment.pendingReschedule?.active) {
      return res.status(400).json({
        success: false,
        message: `There is already an active reschedule proposal by ${appointment.pendingReschedule.proposedBy}`
      });
    }

    if (!proposedSlotId && !proposedDateTime) {
      return res.status(400).json({ success: false, message: 'Provide proposedSlotId or proposedDateTime' });
    }

    let normalizedDateTime = null;
    let proposedSlot = null;
    
    if (proposedSlotId) {
      proposedSlot = await Slot.findById(proposedSlotId);
      if (!proposedSlot) {
        return res.status(404).json({ success: false, message: 'Proposed slot not found' });
      }
      if (!proposedSlot.canBeBooked()) {
        return res.status(400).json({ success: false, message: 'Proposed slot is not available' });
      }
      // Ensure slot belongs to the same doctor as the appointment
      if (!proposedSlot.doctorId.equals(appointment.doctorId._id)) {
        return res.status(400).json({ success: false, message: 'Slot must belong to the same doctor' });
      }
      normalizedDateTime = proposedSlot.dateTime;
    } else if (proposedDateTime) {
      const dt = new Date(proposedDateTime);
      if (isNaN(dt.getTime()) || dt <= new Date()) {
        return res.status(400).json({ success: false, message: 'Proposed date/time must be a valid future date' });
      }
      normalizedDateTime = dt;
    }

    // Store the reschedule proposal
    appointment.pendingReschedule = {
      active: true,
      proposedBy: req.user.userType,
      proposedAt: new Date(),
      reason: reason || '',
      proposedSlotId: proposedSlotId || undefined,
      proposedDateTime: normalizedDateTime,
      decision: null,
      decidedBy: null,
      decisionAt: null,
      decisionReason: undefined
    };

    await appointment.save();
    console.log(`✅ ${req.user.userType} proposed reschedule for appointment ${appointment._id.toString().substr(-8)}`);

    // Populate appointment data for response
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('doctorId', 'primarySpecialty consultationFee')
      .populate('patientId', 'firstName lastName phone email')
      .populate('slotId');

    const responseMessage = req.user.userType === 'doctor' 
      ? 'Reschedule proposal sent to patient for approval'
      : 'Reschedule proposal sent to doctor for approval';

    res.status(201).json({ 
      success: true, 
      message: responseMessage,
      data: { 
        appointment: populatedAppointment,
        pendingReschedule: appointment.pendingReschedule
      }
    });
  } catch (error) {
    console.error('Propose reschedule error:', error);
    res.status(500).json({ success: false, message: 'Server error proposing reschedule' });
  }
});

// @route   PUT /api/appointments/:appointmentId/reschedule/decision
// @desc    Approve or reject a pending reschedule (counterparty only)
// @access  Private (Doctor or Patient)
router.put('/:appointmentId/reschedule/decision', authenticate, async (req, res) => {
  try {
    const { decision, reason } = req.body; // decision: 'approved' | 'rejected'
    if (!['approved', 'rejected'].includes(decision)) {
      return res.status(400).json({ success: false, message: "Decision must be 'approved' or 'rejected'" });
    }

    const appointment = await Appointment.findById(req.params.appointmentId)
      .populate('doctorId')
      .populate('patientId')
      .populate('slotId');
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const pr = appointment.pendingReschedule || {};
    if (!pr.active) {
      return res.status(400).json({ success: false, message: 'No pending reschedule to decide' });
    }

    // Only the counterparty can decide
    const counterparty = pr.proposedBy === 'doctor' ? 'patient' : 'doctor';
    if (req.user.userType !== counterparty) {
      return res.status(403).json({ success: false, message: 'Only the other party can decide on this proposal' });
    }

    // Verify user ownership of the appointment
    let deciderProfile = null;
    let canDecide = false;
    if (req.user.userType === 'doctor') {
      deciderProfile = await Doctor.findOne({ userId: req.user._id });
      canDecide = deciderProfile && appointment.doctorId && deciderProfile._id.equals(appointment.doctorId._id);
    } else if (req.user.userType === 'patient') {
      deciderProfile = await Patient.findOne({ userId: req.user._id });
      canDecide = deciderProfile && appointment.patientId && deciderProfile._id.equals(appointment.patientId._id);
    }
    if (!canDecide) {
      return res.status(403).json({ success: false, message: 'Not authorized to decide on this appointment' });
    }

    // REJECTION PATH
    if (decision === 'rejected') {
      console.log(`❌ ${req.user.userType} rejected reschedule for appointment ${appointment._id.toString().substr(-8)}`);
      
      appointment.pendingReschedule.active = false;
      appointment.pendingReschedule.decision = 'rejected';
      appointment.pendingReschedule.decidedBy = req.user.userType;
      appointment.pendingReschedule.decisionAt = new Date();
      appointment.pendingReschedule.decisionReason = reason || 'Reschedule rejected';
      appointment.lastModifiedBy = req.user.userType;
      
      await appointment.save();
      
      const updatedAppointment = await Appointment.findById(appointment._id)
        .populate('doctorId', 'primarySpecialty consultationFee')
        .populate('patientId', 'firstName lastName phone email')
        .populate('slotId');
      
      return res.json({ 
        success: true, 
        message: 'Reschedule proposal has been rejected. The original appointment remains unchanged.', 
        data: { appointment: updatedAppointment }
      });
    }

    // APPROVAL PATH - UPDATE existing slot and appointment
    console.log(`✅ ${req.user.userType} approved reschedule for appointment ${appointment._id.toString().substr(-8)}`);
    
    let targetDate = pr.proposedDateTime;
    let targetSlotDetails = {};
    
    // If proposing a specific slot, get its details and then delete it
    if (pr.proposedSlotId) {
      const proposedSlot = await Slot.findById(pr.proposedSlotId);
      if (!proposedSlot || !proposedSlot.canBeBooked()) {
        return res.status(400).json({ success: false, message: 'Proposed slot is no longer available' });
      }
      targetDate = proposedSlot.dateTime;
      targetSlotDetails = {
        duration: proposedSlot.duration,
        consultationFee: proposedSlot.consultationFee,
        consultationType: proposedSlot.consultationType
      };
      
      // Delete the proposed slot since we'll update the existing slot
      try {
        await Slot.findByIdAndDelete(proposedSlot._id);
        console.log(`🗑️ Deleted proposed slot ${proposedSlot._id.toString().substr(-8)} after approval`);
      } catch (deleteError) {
        console.warn(`⚠️ Could not delete proposed slot: ${deleteError.message}`);
      }
    } else if (!targetDate) {
      return res.status(400).json({ success: false, message: 'No proposed date to approve' });
    }

    // Get the current slot
    const currentSlot = appointment.slotId;
    if (!currentSlot) {
      return res.status(404).json({ success: false, message: 'Current appointment slot not found' });
    }

    // Check for time conflicts with other appointments
    const conflictingAppointment = await Appointment.findOne({
      doctorId: appointment.doctorId._id,
      appointmentDate: targetDate,
      status: { $in: ['pending', 'confirmed'] },
      _id: { $ne: appointment._id }
    });
    if (conflictingAppointment) {
      return res.status(400).json({ 
        success: false, 
        message: 'Doctor already has another appointment at the approved time' 
      });
    }

    // Store original details for history
    const originalDate = currentSlot.dateTime;
    const originalAppointmentDate = appointment.appointmentDate;

    // UPDATE the existing slot with new timing
    currentSlot.dateTime = targetDate;
    if (targetSlotDetails.duration) currentSlot.duration = targetSlotDetails.duration;
    if (targetSlotDetails.consultationFee) currentSlot.consultationFee = targetSlotDetails.consultationFee;
    if (targetSlotDetails.consultationType) currentSlot.consultationType = targetSlotDetails.consultationType;
    
    await currentSlot.save();
    console.log(`✅ Updated existing slot ${currentSlot._id.toString().substr(-8)} with approved timing`);

    // UPDATE the appointment with new timing and status
    appointment.appointmentDate = targetDate;
    if (targetSlotDetails.duration) appointment.duration = targetSlotDetails.duration;
    if (targetSlotDetails.consultationFee) appointment.consultationFee = targetSlotDetails.consultationFee;
    appointment.status = 'confirmed'; // Approved reschedule is automatically confirmed
    appointment.lastModifiedBy = req.user.userType;
    
    // Clear pending reschedule state
    appointment.pendingReschedule.active = false;
    appointment.pendingReschedule.decision = 'approved';
    appointment.pendingReschedule.decidedBy = req.user.userType;
    appointment.pendingReschedule.decisionAt = new Date();
    appointment.pendingReschedule.decisionReason = reason || 'Reschedule approved';
    
    // Add reschedule history
    appointment.rescheduledFrom = {
      originalDate: originalAppointmentDate,
      rescheduledBy: pr.proposedBy, // Who originally proposed it
      rescheduledAt: new Date(),
      reason: pr.reason || reason || 'Reschedule approved'
    };
    
    await appointment.save();
    console.log(`✅ Updated appointment ${appointment._id.toString().substr(-8)} with approved timing`);

    // Comprehensive cleanup of any duplicate/orphaned appointments
    await cleanupDuplicateRescheduleAppointments(appointment);

    const updatedAppointment = await Appointment.findById(appointment._id)
      .populate('doctorId', 'primarySpecialty consultationFee')
      .populate('patientId', 'firstName lastName phone email')
      .populate('slotId');

    const approverType = req.user.userType === 'doctor' ? 'doctor' : 'patient';
    const proposerType = pr.proposedBy;
    
    res.json({ 
      success: true, 
      message: `Reschedule approved by ${approverType}. The appointment has been confirmed for the new time.`,
      data: { 
        appointment: updatedAppointment,
        rescheduledFrom: originalAppointmentDate,
        rescheduledTo: targetDate,
        proposedBy: proposerType,
        approvedBy: approverType
      }
    });
  } catch (error) {
    console.error('Reschedule decision error:', error);
    res.status(500).json({ success: false, message: 'Server error processing reschedule decision' });
  }
});

// @route   GET /api/appointments/doctor/patients
// @desc    Get patients who have appointments with current doctor
// @access  Private (Doctor only)
router.get('/doctor/patients', authenticate, authorize('doctor'), async (req, res) => {
  try {
    let doctor = await Doctor.findOne({ userId: req.user._id });
    
    // Development mode: Create mock doctor if needed
    if (!doctor && process.env.NODE_ENV === 'development' && req.user._id === 'doctor_123456') {
      console.log('🔧 Development mode: Creating mock doctor profile for patients');
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

    // Find all unique patients who have appointments with this doctor
    const appointments = await Appointment.find({ doctorId: doctor._id })
      .populate({
        path: 'patientId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email phone profilePicture'
        }
      })
      .sort({ createdAt: -1 });

    // Create a unique patients map with their appointment statistics
    const patientsMap = new Map();
    
    appointments.forEach(appointment => {
      const patient = appointment.patientId;
      const patientKey = patient._id.toString();
      
      if (!patientsMap.has(patientKey)) {
        patientsMap.set(patientKey, {
          _id: patient._id,
          userId: patient.userId,
          dateOfBirth: patient.dateOfBirth,
          gender: patient.gender,
          address: patient.address,
          emergencyContact: patient.emergencyContact,
          medicalHistory: patient.medicalHistory,
          currentMedications: patient.currentMedications,
          allergies: patient.allergies,
          createdAt: patient.createdAt,
          stats: {
            totalAppointments: 0,
            completedAppointments: 0,
            pendingAppointments: 0,
            cancelledAppointments: 0,
            lastAppointment: null,
            nextAppointment: null
          }
        });
      }
      
      const patientData = patientsMap.get(patientKey);
      patientData.stats.totalAppointments++;
      
      // Count by status
      switch (appointment.status) {
        case 'completed':
          patientData.stats.completedAppointments++;
          break;
        case 'pending':
          patientData.stats.pendingAppointments++;
          break;
        case 'cancelled':
        case 'rejected':
          patientData.stats.cancelledAppointments++;
          break;
      }
      
      // Track last and next appointments
      const appointmentDate = new Date(appointment.appointmentDate);
      const now = new Date();
      
      if (appointmentDate < now) {
        // Past appointment - check if it's more recent than current lastAppointment
        if (!patientData.stats.lastAppointment || appointmentDate > new Date(patientData.stats.lastAppointment.appointmentDate)) {
          patientData.stats.lastAppointment = {
            _id: appointment._id,
            appointmentDate: appointment.appointmentDate,
            status: appointment.status,
            reasonForVisit: appointment.reasonForVisit
          };
        }
      } else {
        // Future appointment - check if it's sooner than current nextAppointment
        if (!patientData.stats.nextAppointment || appointmentDate < new Date(patientData.stats.nextAppointment.appointmentDate)) {
          patientData.stats.nextAppointment = {
            _id: appointment._id,
            appointmentDate: appointment.appointmentDate,
            status: appointment.status,
            reasonForVisit: appointment.reasonForVisit
          };
        }
      }
    });

    const patients = Array.from(patientsMap.values());

    res.json({
      success: true,
      data: {
        patients,
        totalPatients: patients.length
      }
    });

  } catch (error) {
    console.error('Get doctor patients error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching patients'
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

// @route   PUT /api/appointments/:appointmentId/review
// @desc    Patient adds/updates a review for a completed appointment; recompute doctor rating
// @access  Private (Patient only)
router.put('/:appointmentId/review', authenticate, authorize('patient'), async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found' });
    }

    const appointment = await Appointment.findOne({ _id: req.params.appointmentId, patientId: patient._id }).populate('doctorId');
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (appointment.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'You can only review completed appointments' });
    }

    // Save review on appointment
    appointment.appointmentRating = rating;
    appointment.patientFeedback = feedback || appointment.patientFeedback;
    await appointment.save();

    // Recompute doctor averages
    const agg = await Appointment.aggregate([
      { $match: { doctorId: appointment.doctorId._id, appointmentRating: { $gte: 1 } } },
      { $group: { _id: '$doctorId', avg: { $avg: '$appointmentRating' }, total: { $sum: 1 } } }
    ]);

    if (agg.length > 0) {
      const [{ avg, total }] = agg;
      await Doctor.findByIdAndUpdate(appointment.doctorId._id, { averageRating: avg, totalReviews: total }, { new: true });
    }

    res.json({ success: true, message: 'Review submitted successfully' });
  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({ success: false, message: 'Server error submitting review' });
  }
});

// @route   POST /api/appointments/cleanup/reschedule-duplicates
// @desc    Manually cleanup reschedule-related duplicate appointments
// @access  Private (Admin/Developer)
router.post('/cleanup/reschedule-duplicates', authenticate, async (req, res) => {
  try {
    // Only allow admin/developer access
    if (req.user.userType !== 'admin' && process.env.NODE_ENV !== 'development') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    console.log('🧹 Manual cleanup requested by:', req.user.email || req.user._id);
    
    const result = await performGlobalRescheduleCleanup();
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Global reschedule cleanup completed successfully',
        data: result
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Cleanup completed with errors',
        data: result
      });
    }

  } catch (error) {
    console.error('Manual cleanup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during cleanup'
    });
  }
});

export default router;
