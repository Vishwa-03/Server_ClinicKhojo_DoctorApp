const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const doctorAnalyticsSchema = new Schema({
  // Doctor availability and scheduling (new section)
  doctors: 
  {
    // Array of doctor IDs (references to Doctor model)
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  availableSlots: {
    type: [
      {
        day: {
          type: String,
          required: true,
          enum: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
        },
        slots: [
          {
            startTime: { type: Date, required: true }, // Use Date object with time
            endTime: { type: Date, required: true }, // Use Date object with time
            patientsPerSlot: { type: Number, required: true, min: 1 }, // Maximum patients allowed per slot
            isEmergency: { type: Boolean, default: false }, // Flag for emergency slots
          },
        ],
      },
    ],
    required: true,
  },
  seatsPerDay: { type: Number, required: true, min: 1 }, // Total bookable appointments per day
  emergencyBeds: { type: Number, required: true, min: 0 }, // Number of emergency beds available
  leaveRequests: [
    {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      status: { // Added status field for approval tracking (Approved, Rejected)
        type: String,
        enum: ["Approved", "Rejected"]
      }
    },
  ],
  acceptEmergencyAppointments: { type: Boolean, default: true }, // Flag to indicate accepting emergency appointments
  // Emergency Appointments (new section)
  emergencyAppointmentsPerDay: {
    type: Number,
    required: true,
    min: 0, // Allow setting 0 to disable emergency appointments completely
    default: 10, // Set a default daily limit (adjust as needed)
  },
  emergencyAppointmentsBookedToday : {
    type: Number,
    required: true,
    default: 0,
  },
  // Analytics (new section)
  analytics: {
    totalAppointmentsBooked: { type: Number, default: 0 },
    patientVisits: {
      male: { type: Number, default: 0 },
      female: { type: Number, default: 0 },
      kid: { type: Number, default: 0 },
    },
    totalEmergencyPatients: { type: Number, default: 0 },
    totalBedsUsed: { type: Number, default: 0 },
  },
});


module.exports = mongoose.model("doctorAnalytics", doctorAnalyticsSchema);
