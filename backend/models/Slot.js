import mongoose from 'mongoose';

const slotSchema = new mongoose.Schema({
  // Doctor who owns this slot
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  
  // Date and time information
  dateTime: {
    type: Date,
    required: [true, 'Date and time is required']
  },
  
  // Duration in minutes (no endTime needed - calculated from dateTime + duration)
  
  // Duration in minutes
  duration: {
    type: Number,
    default: 30,
    min: [15, 'Duration must be at least 15 minutes'],
    max: [240, 'Duration cannot exceed 4 hours']
  },
  
  // Availability status
  isAvailable: {
    type: Boolean,
    default: true
  },
  
  // Booking status
  isBooked: {
    type: Boolean,
    default: false
  },
  
  // Patient information if booked
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    default: null
  },
  
  // Appointment details if booked
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    default: null
  },
  
  // Consultation fee for this slot
  consultationFee: {
    type: Number,
    min: [0, 'Consultation fee cannot be negative'],
    default: 0
  },
  
  // Notes for the doctor about this slot
  notes: {
    type: String,
    maxLength: [500, 'Notes cannot exceed 500 characters']
  },
  
  // Special requirements or instructions
  requirements: {
    type: String,
    maxLength: [300, 'Requirements cannot exceed 300 characters']
  },
  
  // Location/mode of consultation
  consultationType: {
    type: String,
    enum: ['in-person', 'telemedicine', 'phone'],
    default: 'in-person'
  },
  
  // Telemedicine platform if applicable
  telemedicineLink: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Telemedicine link must be a valid URL'
    }
  },
  
  // Status of the slot
  status: {
    type: String,
    enum: ['active', 'cancelled', 'completed', 'no-show'],
    default: 'active'
  },
  
  // Cancellation information
  cancellationReason: String,
  cancelledBy: {
    type: String,
    enum: ['doctor', 'patient', 'admin'],
    default: null
  },
  cancelledAt: Date,
  
  // Recurring slot information
  isRecurring: {
    type: Boolean,
    default: false
  },
  
  recurringPattern: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'biweekly', 'monthly']
    },
    daysOfWeek: [Number], // 0-6 (Sunday-Saturday)
    endDate: Date
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
slotSchema.index({ doctorId: 1, dateTime: 1 });
slotSchema.index({ isAvailable: 1, isBooked: 1 });
slotSchema.index({ dateTime: 1, status: 1 });
slotSchema.index({ patientId: 1 });

// Virtual to check if slot is in the past
slotSchema.virtual('isPast').get(function() {
  return this.dateTime < new Date();
});

// Virtual to check if slot is today
slotSchema.virtual('isToday').get(function() {
  const today = new Date();
  const slotDate = new Date(this.dateTime);
  return slotDate.toDateString() === today.toDateString();
});

// Virtual to get formatted date and time
slotSchema.virtual('formattedDateTime').get(function() {
  return this.dateTime.toLocaleString();
});

// Method to check if slot can be booked
slotSchema.methods.canBeBooked = function() {
  return this.isAvailable && 
         !this.isBooked && 
         this.status === 'active' && 
         !this.isPast;
};

// Method to book the slot
slotSchema.methods.book = async function(patientId, appointmentId) {
  if (!this.canBeBooked()) {
    throw new Error('This slot cannot be booked');
  }
  
  this.isBooked = true;
  this.isAvailable = false;
  this.patientId = patientId;
  this.appointmentId = appointmentId;
  
  return await this.save();
};

// Method to cancel booking
slotSchema.methods.cancelBooking = async function(cancelledBy, reason) {
  if (!this.isBooked) {
    throw new Error('This slot is not booked');
  }
  
  this.isBooked = false;
  this.isAvailable = true;
  this.patientId = null;
  this.appointmentId = null;
  this.cancellationReason = reason;
  this.cancelledBy = cancelledBy;
  this.cancelledAt = new Date();
  
  return await this.save();
};

// Static method to find available slots for a doctor
slotSchema.statics.findAvailableForDoctor = function(doctorId, fromDate, toDate) {
  const query = {
    doctorId,
    isAvailable: true,
    isBooked: false,
    status: 'active',
    dateTime: { $gte: fromDate || new Date() }
  };
  
  if (toDate) {
    query.dateTime.$lte = toDate;
  }
  
  return this.find(query).sort({ dateTime: 1 });
};

// Static method to find slots by doctor within date range
slotSchema.statics.findByDoctorAndDateRange = function(doctorId, startDate, endDate) {
  return this.find({
    doctorId,
    dateTime: {
      $gte: startDate,
      $lte: endDate
    }
  })
  .populate('patientId', 'firstName lastName phone email')
  .populate('appointmentId')
  .sort({ dateTime: 1 });
};

const Slot = mongoose.model('Slot', slotSchema);

export default Slot;