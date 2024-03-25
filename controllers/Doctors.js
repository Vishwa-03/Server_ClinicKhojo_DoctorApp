const express = require("express");
const router = express.Router();
const Doctor = require("../models/Doctor");
const Clinic = require("../models/Clinics");
const bcrypt = require("bcrypt");
const saltRounds = 10;

// **Doctor Registration Handler:**
exports.registerDoctor = async (req, res) => {
  const { name, email, password, role, uniqueDoctorId, ...doctorDetails } =
    req.body; // Destructure doctor details

  try {
    // Password hashing (if not done in the model):
    const hashedPassword = await bcrypt.hash(password, 10); // Adjust salt rounds as needed
    const randomNum = Math.floor(Math.random() * 1000000);
    const existingDoctor = await Doctor.findOne({ email });
    const isRandomNumberPresent = await Doctor.findOne({
      uniqueDoctorId: randomNum,
    });
    while (isRandomNumberPresent) {
      randomNum = Math.floor(Math.random() * 1000000);
    }
    if (existingDoctor) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const newDoctor = new Doctor({
      name,
      email,
      password: hashedPassword, // Use hashed password here
      role: "doctor",
      uniqueDoctorId: randomNum,
      ...doctorDetails,
    });

    await newDoctor.save();
    res.status(201).json({ message: "Doctor created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// **Get All Doctors Handler (Optional):**
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().populate("clinic"); // Populate associated clinic details
    res.json(doctors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// **Get Single Doctor by ID Handler:**
exports.getDoctorById = async (req, res) => {
  const { doctorEmail } = req.query;
  // const { populateFields = "" } = req.query; // Optional query parameter for selective population

  try {
    // let doctor = await Doctor.findById(id).populate(populateFields); // Populate based on query parameter
    const doctor = await Doctor.findOne({ email: doctorEmail });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    return res.status(200).json(doctor);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// **Update Doctor Profile Handler (Protected):**
// exports.updateDoctorProfile = async (req, res) => {
//   const { doctorId } = req.query;
//   const updates = req.body;

//   // Implement authorization checks to ensure only authorized users can update profiles

//   try {
//     const updatedDoctor = await Doctor.findOneAndUpdate({uniqueDoctorId:doctorId} , updates, {
//       new: true,
//     }); // Return updated doc
//     if (!updatedDoctor) {
//       return res.status(404).json({ message: "Doctor not found" });
//     }
//     return res.status(200).json(updatedDoctor);
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

exports.updateDoctorProfile = async (req, res) => {
  const { doctorEmail } = req.query;
  const updates = req.body;

  try {
    const updatedDoctor = await Doctor.findOneAndUpdate(
      { doctorEmail: doctorEmail },
      updates,
      {
        new: true,
      }
    );
    if (!updatedDoctor) {
      return res.status(404).json({ message: "Clinic not found" });
    }
    res.json(updatedDoctor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.editEducationalDetails=async(req,res)=>{
  
};
// details of slots section
// exports.detailsOfSlotSection = async (req, res) => {
//   try {
//     const { doctorEmail } = req.query;
//     const updates = req.body;
//     if (
//       !updates.availableSlots &&
//       !updates.doctorAvailableSlots &&
//       !updates.emergencyBeds &&
//       !updates.acceptEmergencyAppointments &&
//       !updates.Patient_In_Take_Per_Slot
//     ) {
//       return res.status(401).json({ message: "Fill all the fields" });
//     }
//     const doctor = await Doctor.findOne({ email: doctorEmail });
//     if (!doctor) {
//       return res.status(404).json({ message: "Not Found Doctor" });
//     }
//     if(doctor.role!=="doctor") {
//       return res.status(405).json({ message: "Unauthorized access" });
//     }
//     if(doctor.isApproved!==true){
//       return res.status(405).json({message:"The Doctor is Not approved by the admin"})
//     }
//     const updatedDoctor = await Doctor.findOneAndUpdate(
//       { doctorEmail: doctorEmail },
//       {availableSlots:updates.availableSlots},updates.doctorAvailableSlots,!updates.emergencyBeds
//       {
//         new: true,
//       }
//     );
//     if (!updatedDoctor) {
//       console.log(updatedDoctor)
//       return res.status(404).json({ message: "Doctor not found" });
//     }
//     res.json(updatedDoctor);
//   } catch (error) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };
exports.detailsOfSlotSection = async (req, res) => {
  try {
    // Validate required fields in the request body
    const requiredFields = ['availableSlots', 'doctorAvailableSlots', 'emergencyBeds', 'acceptEmergencyAppointments', 'Patient_In_Take_Per_Slot'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({ message: `Missing required fields: ${missingFields.join(', ')}` });
    }

    // Extract doctor email from query parameter and validate
    const { doctorEmail } = req.query;
    if (!doctorEmail || !doctorEmail.trim()) {
      return res.status(400).json({ message: 'Invalid doctor email provided' });
    }

    // Fetch doctor document with required fields
    const doctor = await Doctor.findOne({ email: doctorEmail }, {
      role: 1,
      isApproved: 1,
      availableSlots: 1, // Include these fields for efficiency
      emergencyBeds: 1,
      acceptEmergencyAppointments: 1,
    });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Authorization check (ensure requesting user is the doctor)
    if (doctor.role !== 'doctor') {
      return res.status(401).json({ message: 'Unauthorized access' });
    }

    // Approval check (ensure doctor is approved by the admin)
    if (!doctor.isApproved) {
      return res.status(403).json({ message: 'Doctor is not approved by the admin' });
    }

    // Update doctor details (use $set operator for clarity)
    const updatedDoctor = await Doctor.findOneAndUpdate(
      { email: doctorEmail },
      { $set: {
        availableSlots: req.body.availableSlots,
        emergencyBeds: req.body.emergencyBeds,
        acceptEmergencyAppointments: req.body.acceptEmergencyAppointments,
        Patient_In_Take_Per_Slot: req.body.Patient_In_Take_Per_Slot, // Assuming a field for patient intake per slot
      } },
      { new: true } // Return the updated document
    );

    if (!updatedDoctor) {
      return res.status(500).json({ message: 'Error updating doctor details' });
    }

    res.json(updatedDoctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// **Delete Doctor Handler (Protected):**
exports.deleteDoctor = async (req, res) => {
  const { id } = req.query;

  // Implement authorization checks to ensure only authorized users can delete doctors

  try {
    const deletedDoctor = await Doctor.findOneAndDelete({ uniqueDoctorId: id });
    if (!deletedDoctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.json({ message: "Doctor deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// **Search Doctors Handler:**
exports.searchDoctors = async (req, res) => {
  const { specialization, location, ...query } = req.query; // Destructure search parameters

  try {
    let searchCriteria = {};
    if (specialization) {
      searchCriteria.specialization = specialization;
    }
    if (location) {
      // Refine location search based on your address schema (e.g., city, zip code)
      searchCriteria.address = { $regex: new RegExp(location, "i") }; // Case-insensitive search
    }
    searchCriteria = { ...searchCriteria, ...query }; // Include additional filters (if applicable)

    const doctors = await Doctor.find(searchCriteria);
    res.json(doctors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// **Doctor Availability and Scheduling:**

// **Get Doctor Availability Handler:**
exports.getDoctorAvailability = async (req, res) => {
  const { doctorId } = req.query;

  try {
    const doctor = await Doctor.findOne({ uniqueDoctorId: doctorId });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    return res.status(200).json(doctor.availableSlots); // Return the doctor's schedule
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// **Book Appointment Handler (Placeholder):**
exports.bookAppointment = async (req, res) => {
  // ... existing implementation (consider doctor ID, clinic details, patient information, chosen slot)
};

// **Handle Doctor Leave Requests:**

// **Create Leave Request Handler:**
exports.createLeaveRequest = async (req, res) => {
  const { doctorId, startDate, endDate, reason } = req.body;

  try {
    const doctor = await Doctor.findOne({ uniqueDoctorId: doctorId });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    doctor.leaveRequests.push({ startDate, endDate, reason });
    await doctor.save();
    return res
      .status(200)
      .json({ message: "Leave request created successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// **Approve/Reject Leave Request Handler (Protected):**
exports.approveRejectLeaveRequest = async (req, res) => {
  const { doctorId } = req.query;
  const { status } = req.body; // Approved or Rejected

  // Implement authorization checks to restrict access to authorized users (e.g., admins)

  try {
    const doctor = await Doctor.findOne({ uniqueDoctorId: doctorId });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    if (doctor.leaveRequests.length === 0) {
      return res.status(404).json({ message: "Leave request not found" });
    }
    const recentLeaveRequest =
      doctor.leaveRequests[doctor.leaveRequests.length - 1];
    recentLeaveRequest.status = status;
    await doctor.save();
    return res
      .status(200)
      .json({ message: `Leave request ${status} successfully` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// **Doctor Analytics (Optional):**
// Add routes for managing doctor analytics data with appropriate authorization checks.

// **Clinic Routes (New):**
