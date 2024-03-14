const mongoose = require("mongoose");
const path = require("path"); // For file path validation

const clinicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true }, // Address or description

  // Additional details (optional)
  description: { type: String },
  contactNumber: { type: String },
  website: { type: String },
  images: {
    // Array of image paths (relative)
    type: [{ type: String }],
    // get: function (paths) {
    //   // Construct full image URLs
    //   if (!paths) return [];
    //   return paths.map((path) => process.env.CLINIC_IMAGE_UPLOAD_URL + path);
    // },
  },

  // Appointment details
  appointmentTypes: {
    // Array of appointment types offered (e.g., Video Call, In-Clinic)
    type: [{ type: String, enum: ["Video Call", "In-Clinic"] }],
    required: true,
  },

  // Doctor associations (optional)
  doctors: [
    {
      // Array of doctor IDs (references to Doctor model)
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
    },
  ],

  // Ratings and reviews (optional)
  ratings: {
    averageRating: { type: Number, default: 0 }, // Average rating (calculated)
    totalReviews: { type: Number, default: 0 }, // Total number of reviews
    reviews: [
      {
        // Array of review objects
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // User who wrote the review
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },

  // Timings (choose one approach based on complexity)

  // Option 1: Timings as Strings (Simple)
  timingsSimple: {
    type: {
      monday: { type: String }, // Store timings as strings (e.g., "09:00-13:00")
      tuesday: { type: String },
      // ... timings for all weekdays
    },
    closedOn: { type: String }, // Days of the week clinic is closed (e.g., "SUNDAY")
  },

  // Option 2: Timings as Time Slots (Flexible)
  timingsSlots: {
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
            // Array of time slots
            startTime: { type: Date, required: true }, // Use Date object with time
            endTime: { type: Date, required: true }, // Use Date object with time
          },
        ],
      },
    ],
  },

  // Choose only one option for timings
  // timingsSimple: {},  // uncomment for Option 1 (timings as strings)
  timingsSlots: {}, // uncomment for Option 2 (timings as time slots)

  // Additional considerations
  // - Consider using a separate schema for clinic timings if managing complex schedules.
  // - You can add fields for amenities offered, insurance accepted, etc.
});

module.exports = mongoose.model("Clinic", clinicSchema);
