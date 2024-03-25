const express = require("express");
const router = express.Router();
const Doctor = require("../models/Doctor");
const Clinic = require("../models/Clinics");
const bcrypt = require("bcrypt");
const saltRounds = 10;

// **Create Clinic Handler:**
exports.createClinic = async (req, res) => {
  try {
    const {
      name,
      location,
      fees,
      ownershipProofs,
      createdByDoctorEmail,
      createdByDoctorUniqueId,
      clinicNumber,
      timingSlots,
      // ...clinicDetails
    } = req.body;

    const randomNum = Math.floor(Math.random() * 1000000); // Unique clinic number

    // Check for existing clinic with the same random number
    let isRandomNumberPresent = await Clinic.findOne({ clinicNumber });
    while (isRandomNumberPresent) {
      randomNum = Math.floor(Math.random() * 1000000);
      isRandomNumberPresent = await Clinic.findOne({ clinicNumber });
    }

    // Find doctor by email and create new clinic with doctor reference
    const doctor = await Doctor.findOne({ email: createdByDoctorEmail });
    if (!doctor) {
      return res.status(400).json({ message: "Doctor not found" });
    }

    const newClinic = new Clinic({
      name,
      location,
      fees,
      ownershipProofs,
      doctorEmail:createdByDoctorEmail,
      clinicUniqueId:randomNum,
    //   clinicNumber: randomNum,
      uniqueDoctorId:doctor.uniqueDoctorId,
      doctors: doctor._id, // Reference doctor ID in `doctors` array
      timingSlots,
      // ...clinicDetails (if applicable)
    });

    await newClinic.save();

    // Optional: Update doctor's associated clinic (if applicable)
    if (createdByDoctorEmail) {
      await Doctor.findOneAndUpdate(
        {email:createdByDoctorEmail},
        { $push: { clinic: newClinic._id } }, // Add clinic ID to doctor's clinics array
        { new: true } // Return the updated doctor object
      );
    }

    return res.status(201).json({ message: "Clinic created successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};


// **Get All Clinics Handler (Optional):**
exports.getAllClinics = async (req, res) => {
  try {
    const clinics = await Clinic.find().populate("doctors"); // Populate associated doctors
    return res.status(400).json(clinics);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// **Get Single Clinic by ID Handler:**
exports.getClinicById = async (req, res) => {
    const { doctorEmail, clinicNumber } = req.query;
  
    try {
      // Find clinic by clinic number and populate doctors (including email)
      const clinic = await Clinic.findOne({ clinicNumber })
        .populate('doctors', { email: 1 }); // Select only email from doctor object
  
      if (!clinic) {
        return res.status(404).json({ message: "Clinic not found" });
      }
  
      // Check if doctor email matches any doctor associated with the clinic
      const doctorMatches = clinic.doctors.some(doctor => doctor.email === doctorEmail);

      if (!doctorMatches) {
        return res.status(404).json({ message: "Clinic not found for the provided doctor email" });
      }

      res.json(clinic);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  };


// **Update Clinic Details Handler:**
exports.updateClinicDetails = async (req, res) => {
  const { doctorEmail } = req.query;
  const updates = req.body;

  try {
    const updatedClinic = await Clinic.findOneAndUpdate({doctorEmail:doctorEmail}, updates, {
      new: true,
    });
    if (!updatedClinic) {
      return res.status(404).json({ message: "Clinic not found" });
    }
    res.json(updatedClinic);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// **Delete Clinic Handler (Protected):**
exports.deleteClinic = async (req, res) => {
  const { doctorEmail } = req.query;

  // Implement authorization checks and handle associated doctors (e.g., reassign or deactivate)

  try {
    const doctor= await Doctor.findOne({email:doctorEmail});
    if(!doctor){
      return res.status(404).json("Doctor Not Found");
    }
    const uniqueClinicNumber= doctor.clinic._id;
    if(!uniqueClinicNumber){
      return res.status(404).json("No clinic Found");
    }
    const deletedClinic = await Clinic.findByIdAndDelete(uniqueClinicNumber);
    if (!deletedClinic) {
      return res.status(404).json({ message: "Clinic not found" });
    }

    // Update associated doctors' clinic reference (if applicable)

    await Doctor.updateMany({ clinic: id }, { clinic: null }); // Set doctor.clinic to null

    res.json({ message: "Clinic deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// **Clinic Analytics (Optional):**
// Add routes for managing clinic analytics data with appropriate authorization checks.

// **Associate Doctor with Clinic:**
exports.associateDoctorWithClinic = async (req, res) => {
  const { doctorId, clinicId } = req.body;

  try {
    const doctor = await Doctor.findById(doctorId);
    const clinic = await Clinic.findById(clinicId);
    if (!doctor || !clinic) {
      return res.status(404).json({ message: "Doctor or Clinic not found" });
    }

    // Check if doctor is already associated with a clinic (if applicable)

    if (doctor.clinic) {
      return res
        .status(409)
        .json({ message: "Doctor already associated with a clinic" });
    }

    doctor.clinic = clinicId;
    clinic.doctors.push(doctorId);

    await doctor.save();
    await clinic.save();

    res.json({ message: "Doctor associated with clinic successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// **Disassociate Doctor from Clinic:**
exports.disassociateDoctorFromClinic = async (req, res) => {
  const { doctorId, clinicId } = req.body;

  try {
    const doctor = await Doctor.findById(doctorId);
    const clinic = await Clinic.findById(clinicId);
    if (!doctor || !clinic) {
      return res.status(404).json({ message: "Doctor or Clinic not found" });
    }

    // Check if doctor is associated with the specified clinic

    if (doctor.clinic.toString() !== clinicId) {
      return res
        .status(400)
        .json({ message: "Doctor not associated with this clinic" });
    }

    doctor.clinic = undefined;
    clinic.doctors = clinic.doctors.filter((id) => id.toString() !== doctorId);

    await doctor.save();
    await clinic.save();

    res.json({ message: "Doctor disassociated from clinic successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
