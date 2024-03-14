const mongoose = require("mongoose");
const path = require("path"); // For file path validation

const doctorSchema = new mongoose.Schema({
  // Basic user information (inherited from User model)
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hashed using bcrypt
  role: { type: String, required: true, enum: ["user", "doctor", "admin"] },

  // Doctor profile details
  profileImage: {
    type: String, // Store image path relative to upload directory
    // get: function (path) {
    //   // Construct full image URL based on upload directory configuration
    //   // return process.env.IMAGE_UPLOAD_URL + path;
    // },
  },
  title: { type: String, required: true, enum: ["Dr.", "Mr.", "Ms.", "Mrs."] },
  fullName: { type: String, required: true },
  contactNumber: { type: String, required: true },
  gender: { type: String, required: true, enum: ["Male", "Female", "Other"] },
  dateOfBirth: { type: Date, required: true },
  yearsOfExperience: { type: Number, required: true, min: 0 },
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
        // get: function (paths) {
        //   // Construct full certificate URLs
        //   if (!paths) return [];
        //   return paths.map((path) => process.env.CERTIFICATE_UPLOAD_URL + path);
        // },
      },
    },
  ],

  // Registration details
  registrationNumber: { type: String, required: true, unique: true },
  yearOfRegistration: { type: Number, required: true },
  registrationAuthority: { type: String, required: true },
  registrationProof: { type: String }, // Store certificate path (relative)
  // get: function (path) {
  //   // Construct full registration proof URL
  //   return process.env.CERTIFICATE_UPLOAD_URL + path;
  // },

  // Identify proof
  identityType: {
    type: String,
    required: true,
    enum: ["Aadhaar Card", "Passport", "PAN Card", "Driving License"],
  },
  uniqueIdNumber: { type: String, required: true },
  identityProof: { type: String }, // Store proof path (relative)
  // get: function (path) {
  //   // Construct full identity proof URL
  //   return process.env.CERTIFICATE_UPLOAD_URL + path;
  // },

  // Clinic profile (optional, linked if doctor)
  clinic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Clinic", // Reference to a separate Clinic model (if needed)
  },

  // Doctor availability and scheduling (new section)
  availableSlots: {
    // Array of objects defining available slots
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
            // Array of time slots for each day
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
      // Array of leave requests (optional)
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      reason: { type: String, required: true },
    },
  ],
  acceptEmergencyAppointments: { type: Boolean, default: true }, // Flag to indicate accepting emergency appointments

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

module.exports = mongoose.model("Doctor", doctorSchema);
