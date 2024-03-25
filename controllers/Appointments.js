const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");

// Get all appointments
exports.getAllAppointments = async (req, res) => {
  try {
    const { doctorEmail } = req.body;
    const doctor = await Doctor.findOne({ email: doctorEmail });
    if (!doctor) {
      return res.status(404).json("Doctor Not Found");
    }
    console.log(doctor);

    const appointments = await Appointment.find({ doctor: doctor._id });
    // .populate('patient', 'name profilePicture'); // Populate user data

    return res.json(appointments);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching appointments" });
  }
};

// Get appointments by type (emergency or normal)
exports.getAppointmentsByType = async (req, res) => {
  const { type, doctorEmail } = req.body;
  // Get type from URL parameter
  if (!type || !["emergency", "normal"].includes(type)) {
    return res.status(400).json({ message: "Invalid appointment type" });
  }
  const doctor = await Doctor.findOne({ email: doctorEmail });
  if (!doctor) {
    return res.status(404).json("Doctor Not found");
  }

  try {
    const appointments = await Appointment.find({
      type: type,
      doctor: doctor._id,
    });
    // .populate('patient', 'name profilePicture'); // Populate user data

    return res.json(appointments);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching appointments" });
  }
};

// ... other functions (optional)

// Create a new appointment with validation and doctor information handling
exports.createAppointment = async (req, res) => {
  try {
    // Validate appointment data (optional but recommended)
    const { type, patient, block, timing, doctorName, doctorEmail } = req.body; // Destructure relevant fields

    if (!type || !patient || !block || !timing) {
      return res
        .status(400)
        .json({ message: "Missing required fields for appointment" });
    }

    // Handle doctor information based on your chosen approach:

    // A. Doctor Reference with Doctor Model
    let doctor;
    if (doctorEmail) {
      doctor = await Doctor.findOne({ email: doctorEmail }); // Find doctor by unique ID
      if (!doctor) {
        return res.status(400).json({ message: "Invalid doctor unique ID" });
      }
    }
    if (type === "emergency") {
      if (
        doctor.emergencyAppointmentsBookedToday >=
        doctor.emergencyAppointmentsPerDay
      ) {
        return res
          .status(400)
          .json({
            message: "Maximum emergency appointments reached for the day",
          });
      }
    }
    if (type === "normal") {
      doctor.analytics.totalNormalPatients++;
    } else if (type === "emergency") {
      doctor.analytics.totalEmergencyPatients++;
      doctor.emergencyAppointmentsBookedToday++;
    }
    doctor.analytics.totalAppointmentsBooked++;
    if (patient.gender === "male") {
      doctor.analytics.patientVisits.male++;
    } else if (patient.gender === "female") {
      doctor.analytics.patientVisits.female++;
    } else if (patient.gender === "kid") {
      doctor.analytics.patientVisits.kid++;
    }
    const newAppointment = new Appointment({
      type,
      patient,
      block,
      timing,
      doctor: doctor ? doctor._id : null, // Assign doctor if found
    });

    // Save the appointment to the database
    const savedAppointment = await newAppointment.save();
    await doctor.save();
    // Respond with the created appointment (status code 201)
    // Include doctor information based on the chosen approach
    let responseAppointment = savedAppointment.toObject();
    if (doctor) {
      responseAppointment.doctor = doctor.toObject();
    }
    // Or, if using embedded doctor information:
    // let responseAppointment = savedAppointment.toObject();

    return res.status(201).json(responseAppointment);
  } catch (err) {
    // Handle validation errors or other errors
    console.error(err.message); // Log the error message for debugging
    return res
      .status(400)
      .json({ message: "Error creating appointment", error: err.message }); // Provide an informative error message
  }
};
