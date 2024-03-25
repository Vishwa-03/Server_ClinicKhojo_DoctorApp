const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ["emergency", "normal"],
  },
  patient: {
    name: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
  },
  doctor: {
    // Doctor assigned to the appointment (optional)
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
  },
  block: {
    type: String,
    required: true,
  },
  timing: {
    type: Date,
    required: true,
  },
  arrived: {
    type: Boolean,
    default: false,
  },
  // Emergency specific fields
  isAccepted: {
    type: Boolean,
    default: false,
    required: function () {
      return this.type === "emergency";
    },
  },
  expiresAt: {
    type: Date,
    required: function () {
      return this.type === "emergency";
    },
    default: function () {
      if (this.type === "emergency") {
        return Date.now() + 24 * 60 * 60 * 1000; // 1 day in milliseconds
      }
    },
  },
});
// Pre-save hook to handle appointment types and updates
// appointmentSchema.pre("save", async function (next) {
//   const appointment = this;

//   // Update total appointments booked
//   try {
//     await Doctor.findByIdAndUpdate(appointment.doctor, {
//       $inc: { totalAppointmentsBooked: 1 },
//     });

//     // Update total appointments based on appointment type
//     if (appointment.type === "normal") {
//       await Doctor.findByIdAndUpdate(appointment.doctor, {
//         $inc: { totalNormalAppointmentsBooked: 1 },
//       });
//     } else {
//       try {
//         const doctor = await Doctor.findById(appointment.doctor).select({
//           emergencyAppointmentsPerDay: 1,
//           emergencyAppointmentsBookedToday: 1,
//         }); // Select only required fields

//         if (!doctor) {
//           const error = new Error("Doctor not found");
//           error.statusCode = 404;
//           return next(error);
//         }

//         if (
//           doctor.emergencyAppointmentsBookedToday.date !==
//           new Date().setHours(0, 0, 0, 0)
//         ) {
//           // Check if new day
//           doctor.emergencyAppointmentsBookedToday.date = new Date().setHours(
//             0,
//             0,
//             0,
//             0
//           ); // Reset for new day
//           doctor.emergencyAppointmentsBookedToday.count = 0; // Reset emergency appointments booked count for the day
//         }

//         if (
//           doctor.emergencyAppointmentsBookedToday.count >=
//           doctor.emergencyAppointmentsPerDay
//         ) {
//           const error = new Error(
//             "Maximum emergency appointments reached for the day"
//           );
//           error.statusCode = 400;
//           return next(error);
//         }

//         // Update emergency appointments booked counters (overall and today)
//         await Doctor.findByIdAndUpdate(doctor._id, {
//           $inc: {
//             emergencyAppointmentsBooked: 1,
//             "emergencyAppointmentsBookedToday.count": 1,
//           },
//           totalEmergencyAppointmentsBooked: 1, // Increment total emergency appointments booked
//         });
//       } catch (err) {
//         // Handle potential errors during database operations
//         console.error("Error updating doctor emergency appointments:", err);
//         next(err); // Pass error to be handled by express or other middleware
//       }
//     }
//   } catch (err) {
//     // Handle potential errors during database operations
//     console.error("Error updating doctor appointment counts:", err);
//     next(err); // Pass error to be handled by express or other middleware
//   }

//   next(); // Proceed with saving if no errors
// });

module.exports = mongoose.model("Appointment", appointmentSchema);
