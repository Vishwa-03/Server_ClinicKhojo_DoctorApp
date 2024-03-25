const express = require("express");
const router = express.Router();
const Doctor = require("../models/Doctor");
const Clinic = require("../models/Clinics");
const bcrypt = require('bcrypt');
const { registerDoctor, getAllDoctors, getDoctorById, updateDoctorProfile, deleteDoctor, searchDoctors, getDoctorAvailability, bookAppointment, createLeaveRequest, approveRejectLeaveRequest, detailsOfSlotSection, editEducationalDetails } = require("../controllers/Doctors");
const { createClinic, getAllClinics, getClinicById, updateClinicDetails, deleteClinic, associateDoctorWithClinic, disassociateDoctorFromClinic } = require("../controllers/Clinics");
const saltRounds = 10;

// // **Doctor Registration Handler:**
// const registerDoctor = async (req, res) => {
//   const { name, email, password,role,uniqueDoctorId, ...doctorDetails } = req.body; // Destructure doctor details
  
//   try {
//     // Password hashing (if not done in the model):
//     const hashedPassword = await bcrypt.hash(password, 10); // Adjust salt rounds as needed
//     const randomNum = Math.floor(Math.random() * 1000000);
//     const existingDoctor = await Doctor.findOne({ email });
//     const isRandomNumberPresent = await Doctor.findOne({uniqueDoctorId:randomNum});
//     while(isRandomNumberPresent){
//       randomNum = Math.floor(Math.random() * 1000000);
//     }
//     if (existingDoctor) {
//       return res.status(400).json({ message: "Email already exists" });
//     }

//     const newDoctor = new Doctor({
//       name,
//       email,
//       password: hashedPassword, // Use hashed password here
//       role:"doctor",
//       uniqueDoctorId:randomNum,
//       ...doctorDetails,
//     });

//     await newDoctor.save();
//     res.status(201).json({ message: "Doctor created successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // **Get All Doctors Handler (Optional):**
// const getAllDoctors = async (req, res) => {
//   try {
//     const doctors = await Doctor.find().populate("clinic"); // Populate associated clinic details
//     res.json(doctors);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // **Get Single Doctor by ID Handler:**
// const getDoctorById = async (req, res) => {
//   const { id } = req.params;
//   // const { populateFields = "" } = req.query; // Optional query parameter for selective population
  
//   try {
//     // let doctor = await Doctor.findById(id).populate(populateFields); // Populate based on query parameter
//     const doctor = await Doctor.findOne({uniqueDoctorId:id});
//     if (!doctor) {
//       return res.status(404).json({ message: "Doctor not found" });
//     }

//     res.json(doctor);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // **Update Doctor Profile Handler (Protected):**
// const updateDoctorProfile = async (req, res) => {
//   const { id } = req.params;
//   const updates = req.body;

//   // Implement authorization checks to ensure only authorized users can update profiles

//   try {
//     const updatedDoctor = await Doctor.findByIdAndUpdate(id, updates, {
//       new: true,
//     }); // Return updated doc
//     if (!updatedDoctor) {
//       return res.status(404).json({ message: "Doctor not found" });
//     }
//     res.json(updatedDoctor);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // **Delete Doctor Handler (Protected):**
// const deleteDoctor = async (req, res) => {
//   const { id } = req.params;

//   // Implement authorization checks to ensure only authorized users can delete doctors

//   try {
//     const deletedDoctor = await Doctor.findOneAndDelete({uniqueDoctorId:id});
//     if (!deletedDoctor) {
//       return res.status(404).json({ message: "Doctor not found" });
//     }
//     res.json({ message: "Doctor deleted successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // **Search Doctors Handler:**
// const searchDoctors = async (req, res) => {
//   const { specialization, location, ...query } = req.query; // Destructure search parameters

//   try {
//     let searchCriteria = {};
//     if (specialization) {
//       searchCriteria.specialization = specialization;
//     }
//     if (location) {
//       // Refine location search based on your address schema (e.g., city, zip code)
//       searchCriteria.address = { $regex: new RegExp(location, "i") }; // Case-insensitive search
//     }
//     searchCriteria = { ...searchCriteria, ...query }; // Include additional filters (if applicable)

//     const doctors = await Doctor.find(searchCriteria);
//     res.json(doctors);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // **Doctor Availability and Scheduling:**

// // **Get Doctor Availability Handler:**
// const getDoctorAvailability = async (req, res) => {
//   const { doctorId } = req.params;

//   try {
//     const doctor = await Doctor.findById(doctorId);
//     if (!doctor) {
//       return res.status(404).json({ message: "Doctor not found" });
//     }
//     res.json(doctor.availableSlots); // Return the doctor's schedule
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // **Book Appointment Handler (Placeholder):**
// const bookAppointment = async (req, res) => {
//   // ... existing implementation (consider doctor ID, clinic details, patient information, chosen slot)
// };

// // **Handle Doctor Leave Requests:**

// // **Create Leave Request Handler:**
// const createLeaveRequest = async (req, res) => {
//   const { doctorId, startDate, endDate, reason } = req.body;

//   try {
//     const doctor = await Doctor.findById(doctorId);
//     if (!doctor) {
//       return res.status(404).json({ message: "Doctor not found" });
//     }

//     doctor.leaveRequests.push({ startDate, endDate, reason });
//     await doctor.save();
//     res.json({ message: "Leave request created successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // **Approve/Reject Leave Request Handler (Protected):**
// const approveRejectLeaveRequest = async (req, res) => {
//   const { doctorId, leaveId } = req.params;
//   const { status } = req.body; // Approved or Rejected

//   // Implement authorization checks to restrict access to authorized users (e.g., admins)

//   try {
//     const doctor = await Doctor.findById(doctorId);
//     if (!doctor) {
//       return res.status(404).json({ message: "Doctor not found" });
//     }

//     const leaveIndex = doctor.leaveRequests.findIndex(
//       (leave) => leave._id.toString() === leaveId
//     );
//     if (leaveIndex === -1) {
//       return res.status(404).json({ message: "Leave request not found" });
//     }

//     doctor.leaveRequests[leaveIndex].status = status;
//     await doctor.save();
//     res.json({ message: `Leave request ${status} successfully` });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // **Doctor Analytics (Optional):**
// // Add routes for managing doctor analytics data with appropriate authorization checks.

// // **Clinic Routes (New):**

// // **Create Clinic Handler:**
// const createClinic = async (req, res) => {
//   const { name, location, ...clinicDetails } = req.body;

//   try {
//     const newClinic = new Clinic({
//       name,
//       location,
//       ...clinicDetails,
//     });

//     await newClinic.save();
//     res.status(201).json({ message: "Clinic created successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // **Get All Clinics Handler (Optional):**
// const getAllClinics = async (req, res) => {
//   try {
//     const clinics = await Clinic.find().populate("doctors"); // Populate associated doctors
//     res.json(clinics);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // **Get Single Clinic by ID Handler:**
// const getClinicById = async (req, res) => {
//   const { id } = req.params;
//   const { populateFields = "" } = req.query; // Optional query parameter for selective population

//   try {
//     let clinic = await Clinic.findById(id).populate(populateFields); // Populate based on query parameter

//     if (!clinic) {
//       return res.status(404).json({ message: "Clinic not found" });
//     }

//     res.json(clinic);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // **Update Clinic Details Handler:**
// const updateClinicDetails = async (req, res) => {
//   const { id } = req.params;
//   const updates = req.body;

//   try {
//     const updatedClinic = await Clinic.findByIdAndUpdate(id, updates, {
//       new: true,
//     });
//     if (!updatedClinic) {
//       return res.status(404).json({ message: "Clinic not found" });
//     }
//     res.json(updatedClinic);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // **Delete Clinic Handler (Protected):**
// const deleteClinic = async (req, res) => {
//   const { id } = req.params;

//   // Implement authorization checks and handle associated doctors (e.g., reassign or deactivate)

//   try {
//     const deletedClinic = await Clinic.findByIdAndDelete(id);
//     if (!deletedClinic) {
//       return res.status(404).json({ message: "Clinic not found" });
//     }

//     // Update associated doctors' clinic reference (if applicable)

//     await Doctor.updateMany({ clinic: id }, { clinic: null }); // Set doctor.clinic to null

//     res.json({ message: "Clinic deleted successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // **Clinic Analytics (Optional):**
// // Add routes for managing clinic analytics data with appropriate authorization checks.

// // **Associate Doctor with Clinic:**
// const associateDoctorWithClinic = async (req, res) => {
//   const { doctorId, clinicId } = req.body;

//   try {
//     const doctor = await Doctor.findById(doctorId);
//     const clinic = await Clinic.findById(clinicId);
//     if (!doctor || !clinic) {
//       return res.status(404).json({ message: "Doctor or Clinic not found" });
//     }

//     // Check if doctor is already associated with a clinic (if applicable)

//     if (doctor.clinic) {
//       return res
//         .status(409)
//         .json({ message: "Doctor already associated with a clinic" });
//     }

//     doctor.clinic = clinicId;
//     clinic.doctors.push(doctorId);

//     await doctor.save();
//     await clinic.save();

//     res.json({ message: "Doctor associated with clinic successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // **Disassociate Doctor from Clinic:**
// const disassociateDoctorFromClinic = async (req, res) => {
//   const { doctorId, clinicId } = req.body;

//   try {
//     const doctor = await Doctor.findById(doctorId);
//     const clinic = await Clinic.findById(clinicId);
//     if (!doctor || !clinic) {
//       return res.status(404).json({ message: "Doctor or Clinic not found" });
//     }

//     // Check if doctor is associated with the specified clinic

//     if (doctor.clinic.toString() !== clinicId) {
//       return res
//         .status(400)
//         .json({ message: "Doctor not associated with this clinic" });
//     }

//     doctor.clinic = undefined;
//     clinic.doctors = clinic.doctors.filter((id) => id.toString() !== doctorId);

//     await doctor.save();
//     await clinic.save();

//     res.json({ message: "Doctor disassociated from clinic successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };
router.post("/register", registerDoctor);
router.get("/getAllDoctors", getAllDoctors); // Optional
router.get("/getDoctorByEmail", getDoctorById);
router.put("/updateDoctorProfile", updateDoctorProfile); // Protected 
router.delete("/deleteDoctor", deleteDoctor); // Protected
router.get("/search", searchDoctors);
router.get("/:doctorId/availability", getDoctorAvailability);
router.post("/:doctorId/availability", getDoctorAvailability); // Re-added (duplicate removed)
router.post("/:doctorId/appointments", bookAppointment); // Placeholder
router.post("/:doctorId/leave-requests", createLeaveRequest);
router.put("/:doctorId/leave-requests/:leaveId", approveRejectLeaveRequest); // Protected
router.put("/editEducationalDetails",editEducationalDetails);
router.put("/detailsUnderSlotsSection",detailsOfSlotSection);
// Get All Clinics (Optional)
router.post("/createClinics", createClinic);
router.get("/getAllClinics", getAllClinics);

// Get Single Clinic by ID
router.get("/clinics/particularClinic", getClinicById);

// Update Clinic Details
router.put("/clinics/updateClinicDetalis", updateClinicDetails);

// Delete Clinic (Protected)
router.delete("/clinics/:id", deleteClinic);

// Associate Doctor with Clinic
router.post("/clinics/:clinicId/doctors", associateDoctorWithClinic);

// Disassociate Doctor from Clinic
router.delete("/clinics/:clinicId/doctors", disassociateDoctorFromClinic);

module.exports = router;
