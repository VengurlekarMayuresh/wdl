import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  // References to other models
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  
  slotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Slot',
    required: true
  },
  
  // Appointment details
  appointmentDate: {
    type: Date,
    required: true
  },
  
  appointmentTime: {
    type: String,
    required: true
  },
  
  endTime: {
    type: String,
    required: true
  },
  
  // Duration in minutes
  duration: {
    type: Number,
    default: 30,
    min: [15, 'Duration must be at least 15 minutes'],
    max: [240, 'Duration cannot exceed 4 hours']
  },
  
  // Type of appointment
  appointmentType: {
    type: String,
    enum: ['consultation', 'follow-up', 'check-up', 'procedure', 'telemedicine'],
    default: 'consultation'
  },
  
  // Status of the appointment
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show', 'rescheduled'],
    default: 'pending'
  },
  
  // Consultation mode
  consultationType: {
    type: String,
    enum: ['in-person', 'telemedicine', 'phone'],
    default: 'in-person'
  },
  
  // Patient's reason for visit
  reasonForVisit: {
    type: String,
    required: [true, 'Reason for visit is required'],
    maxLength: [500, 'Reason for visit cannot exceed 500 characters']
  },
  
  // Patient's symptoms or concerns
  symptoms: {
    type: String,
    maxLength: [1000, 'Symptoms description cannot exceed 1000 characters']
  },
  
  // Patient's medical history relevant to this appointment
  relevantMedicalHistory: {
    type: String,
    maxLength: [1000, 'Medical history cannot exceed 1000 characters']
  },
  
  // Current medications
  currentMedications: [{
    name: String,
    dosage: String,
    frequency: String,
    notes: String
  }],
  
  // Allergies
  allergies: [String],
  
  // Patient's contact preferences
  contactPreferences: {
    preferredPhone: String,
    preferredEmail: String,
    reminderPreferences: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      call: { type: Boolean, default: false }
    }
  },
  
  // Doctor's notes and observations
  doctorNotes: {
    type: String,
    maxLength: [2000, 'Doctor notes cannot exceed 2000 characters']
  },
  
  // Diagnosis
  diagnosis: {
    primary: String,
    secondary: [String],
    icd10Codes: [String]
  },
  
  // Treatment plan
  treatmentPlan: {
    type: String,
    maxLength: [1500, 'Treatment plan cannot exceed 1500 characters']
  },
  
  // Prescriptions
  prescriptions: [{
    medication: {
      type: String,
      required: true
    },
    dosage: {
      type: String,
      required: true
    },
    frequency: String,
    duration: String,
    instructions: String,
    refills: {
      type: Number,
      default: 0
    }
  }],
  
  // Follow-up instructions
  followUpInstructions: {
    type: String,
    maxLength: [1000, 'Follow-up instructions cannot exceed 1000 characters']
  },
  
  // Next appointment recommendations
  nextAppointmentRecommended: {
    type: Boolean,
    default: false
  },
  
  nextAppointmentTimeframe: {
    type: String,
    enum: ['1 week', '2 weeks', '1 month', '3 months', '6 months', '1 year', 'as needed']
  },
  
  // Payment and billing
  consultationFee: {
    type: Number,
    min: [0, 'Consultation fee cannot be negative'],
    default: 0
  },
  
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'partially_paid', 'refunded', 'waived'],
    default: 'pending'
  },
  
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'insurance', 'online', 'bank_transfer']
  },
  
  insuranceInformation: {
    provider: String,
    policyNumber: String,
    groupNumber: String,
    copay: Number,
    deductible: Number
  },
  
  // Telemedicine details
  telemedicineDetails: {
    platform: {
      type: String,
      enum: ['zoom', 'teams', 'webex', 'custom', 'other']
    },
    meetingLink: String,
    meetingId: String,
    meetingPassword: String,
    backupPhone: String
  },
  
  // Appointment confirmations and reminders
  confirmationSent: {
    type: Boolean,
    default: false
  },
  
  confirmationSentAt: Date,
  
  remindersSent: [{
    type: { type: String, enum: ['email', 'sms', 'call'] },
    sentAt: Date,
    status: { type: String, enum: ['sent', 'delivered', 'failed'] }
  }],
  
  // Patient confirmation
  patientConfirmed: {
    type: Boolean,
    default: false
  },
  
  patientConfirmedAt: Date,
  
  // Cancellation details
  cancellationReason: String,
  
  cancelledBy: {
    type: String,
    enum: ['patient', 'doctor', 'admin']
  },
  
  cancelledAt: Date,
  
  cancellationFee: {
    type: Number,
    default: 0
  },
  
  // Rescheduling details
  rescheduledFrom: {
    originalDate: Date,
    originalTime: String,
    rescheduledBy: { type: String, enum: ['patient', 'doctor', 'admin'] },
    rescheduledAt: Date,
    reason: String
  },
  
  // Quality and feedback
  appointmentRating: {
    type: Number,
    min: 1,
    max: 5
  },
  
  patientFeedback: {
    type: String,
    maxLength: [1000, 'Patient feedback cannot exceed 1000 characters']
  },
  
  // Internal tracking
  createdBy: {
    type: String,
    enum: ['patient', 'doctor', 'admin', 'system'],
    default: 'patient'
  },
  
  lastModifiedBy: {
    type: String,
    enum: ['patient', 'doctor', 'admin', 'system']
  },
  
  // Privacy and consent
  consentGiven: {
    type: Boolean,
    default: false
  },
  
  consentDate: Date,
  
  privacyAgreement: {
    type: Boolean,
    default: false
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
appointmentSchema.index({ doctorId: 1, appointmentDate: 1 });
appointmentSchema.index({ patientId: 1, appointmentDate: 1 });
appointmentSchema.index({ slotId: 1 });
appointmentSchema.index({ status: 1, appointmentDate: 1 });
appointmentSchema.index({ appointmentDate: 1, appointmentTime: 1 });

// Virtual to check if appointment is in the past
appointmentSchema.virtual('isPast').get(function() {
  const appointmentDateTime = new Date(this.appointmentDate);
  const [hours, minutes] = this.appointmentTime.split(':');
  appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));
  return appointmentDateTime < new Date();
});

// Virtual to check if appointment is today
appointmentSchema.virtual('isToday').get(function() {
  const today = new Date();
  const appointmentDate = new Date(this.appointmentDate);
  return appointmentDate.toDateString() === today.toDateString();
});

// Virtual to check if appointment is upcoming (within next 7 days)
appointmentSchema.virtual('isUpcoming').get(function() {
  const appointmentDateTime = new Date(this.appointmentDate);
  const [hours, minutes] = this.appointmentTime.split(':');
  appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  return appointmentDateTime > new Date() && appointmentDateTime <= sevenDaysFromNow;
});

// Virtual for formatted appointment date and time
appointmentSchema.virtual('formattedDateTime').get(function() {
  const date = new Date(this.appointmentDate);
  return `${date.toLocaleDateString()} at ${this.appointmentTime}`;
});

// Method to confirm appointment
appointmentSchema.methods.confirm = async function() {
  this.status = 'confirmed';
  this.patientConfirmed = true;
  this.patientConfirmedAt = new Date();
  return await this.save();
};

// Method to cancel appointment
appointmentSchema.methods.cancel = async function(cancelledBy, reason, fee = 0) {
  this.status = 'cancelled';
  this.cancelledBy = cancelledBy;
  this.cancellationReason = reason;
  this.cancelledAt = new Date();
  this.cancellationFee = fee;
  return await this.save();
};

// Method to complete appointment
appointmentSchema.methods.complete = async function(doctorNotes, diagnosis, treatmentPlan) {
  this.status = 'completed';
  if (doctorNotes) this.doctorNotes = doctorNotes;
  if (diagnosis) this.diagnosis.primary = diagnosis;
  if (treatmentPlan) this.treatmentPlan = treatmentPlan;
  return await this.save();
};

// Method to reschedule appointment
appointmentSchema.methods.reschedule = async function(newSlotId, newDate, newTime, rescheduledBy, reason) {
  // Store original appointment details
  this.rescheduledFrom = {
    originalDate: this.appointmentDate,
    originalTime: this.appointmentTime,
    rescheduledBy: rescheduledBy,
    rescheduledAt: new Date(),
    reason: reason
  };
  
  // Update with new details
  this.slotId = newSlotId;
  this.appointmentDate = newDate;
  this.appointmentTime = newTime;
  this.status = 'rescheduled';
  
  return await this.save();
};

// Static method to find appointments for a doctor within date range
appointmentSchema.statics.findForDoctorInRange = function(doctorId, startDate, endDate) {
  return this.find({
    doctorId,
    appointmentDate: {
      $gte: startDate,
      $lte: endDate
    }
  })
  .populate('patientId', 'firstName lastName phone email')
  .populate('slotId')
  .sort({ appointmentDate: 1, appointmentTime: 1 });
};

// Static method to find appointments for a patient
appointmentSchema.statics.findForPatient = function(patientId, limit = 10) {
  return this.find({ patientId })
    .populate('doctorId', 'primarySpecialty consultationFee')
    .populate('slotId')
    .sort({ appointmentDate: -1 })
    .limit(limit);
};

// Static method to find upcoming appointments for reminders
appointmentSchema.statics.findUpcomingForReminders = function(hoursAhead = 24) {
  const reminderTime = new Date();
  reminderTime.setHours(reminderTime.getHours() + hoursAhead);
  
  return this.find({
    status: { $in: ['pending', 'confirmed'] },
    appointmentDate: {
      $gte: new Date(),
      $lte: reminderTime
    }
  })
  .populate('patientId', 'firstName lastName phone email')
  .populate('doctorId', 'primarySpecialty');
};

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;