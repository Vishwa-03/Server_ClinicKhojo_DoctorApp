const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const doctorSchema = new Schema({
  // Basic user information (inherited from User model)
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hashed using bcrypt
  role: { type: String, required: true, enum: ["doctor"] },
  uniqueDoctorId: { type: String },
  isApproved: { type: Boolean, default: false },
  approvedAt: { type: Date },
  // Doctor profile details
  profileImage: {
    type: String, // Store image path relative to upload directory
  },
  title: { type: String, required: true, enum: ["Dr.", "Mr.", "Ms.", "Mrs."] },
  fullName: { type: String, required: true },
  contactNumber: { type: String, required: true },
  gender: { type: String, required: true, enum: ["Male", "Female", "Other"] },
  dateOfBirth: { type: Date, required: true },
  yearsOfExperience: { type: Number, required: true, min: 1 },
  specialization: { type: String, required: true },
  address: { type: String, required: true },
  bio: { type: String },

  // Educational details (array for multiple qualifications)
  education: [
    {
      degreeName: { type: String, required: true },
      passingYear: { type: Number, required: true },
      collegeName: { type: String, required: true },
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      certificates: {
        type: [{ type: String }], // Array of certificate paths (relative)
      },
    },
  ],

  // Registration details
  registrationNumber: { type: String, required: true, unique: true },
  yearOfRegistration: { type: Number, required: true },
  registrationAuthority: { type: String, required: true },
  registrationProof: { type: String }, // Store certificate path (relative)

  // Identify proof
  identityType: {
    type: String,
    required: true,
    enum: ["Aadhaar Card", "Passport", "PAN Card", "Driving License"],
  },
  uniqueIdNumber: { type: String, required: true },
  identityProof: { type: String }, // Store proof path (relative)

  // Clinic profile (optional, linked if doctor)
  clinic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Clinic", // Reference to a separate Clinic model (if needed)
  },

  // Doctor availability and scheduling (new section)
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
  },
  doctorAvailableSlots: { type: Number, min: 0 },
  Patient_In_Take_Per_Slot:{ type: Number, min: 0 },
   // Total bookable appointments per day
  emergencyBeds: { type: Number, min: 0 }, // Number of emergency beds available
  leaveRequests: [
    {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      reason: { type: String, required: true },
      status: {
        // Added status field for approval tracking (Approved, Rejected)
        type: String,
        enum: ["Approved", "Rejected"],
      },
    },
  ],
  acceptEmergencyAppointments: { type: Boolean, default: true }, // Flag to indicate accepting emergency appointments
  // Emergency Appointments (new section)
  emergencyAppointmentsPerDay: {
    type: Number,
    min: 0, // Allow setting 0 to disable emergency appointments completely
    default: 10, // Set a default daily limit (adjust as needed)
  },
  emergencyAppointmentsBookedToday: {
    type: Number,
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
    totalNormalPatients: { type: Number, default: 0 },
    totalBedsUsed: { type: Number, default: 0 },
  },
});

// Function to update emergencyAppointmentsPerDay
doctorSchema.methods.updateEmergencyAppointmentsPerDay = async function (
  newLimit
) {
  if (newLimit < 0) {
    throw new Error("Emergency appointments limit cannot be negative");
  }
  this.emergencyAppointmentsPerDay = newLimit;
  return await this.save();
};
// doctorSchema.methods.updateEmergencyAppointmentsPerDay = async function (newLimit) {
//   if (newLimit < 0) {
//     throw new Error("Emergency appointments limit cannot be negative");
//   }
//   this.emergencyAppointmentsPerDay = newLimit;
//   return await this.save();
// };
module.exports = mongoose.model("Doctor", doctorSchema);
