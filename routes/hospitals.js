const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser"); // for parsing request body
const cors = require("cors"); // for enabling CORS (if needed)
const bcrypt = require("bcrypt"); // for password hashing
const router = express.Router();
const { signup, getManagementProfile, createHospitals, getAllHospitals, addDoctors, deleteDoctorFromHospital, updateManagementProfile } = require("../controllers/Management");

// Routes
// 1. Register a new management profile
router.post("/auth/register/management",signup);
// 2 Get or login management personnel 
router.get("/management/getProfile/email", getManagementProfile); 
// **Hospital Management Routes (with role-based authorization):**
// 1. Create a new hospital profile (requires management role)
router.post("/createHospitals",createHospitals);
// 2. Get all hospitals
router.get("/getAllHospitals", getAllHospitals);
router.get("/ManagementPersonnel/getHospitalAssocaited",);
// **Doctor Management Routes (with role-based authorization):**
// 1. Add a doctor to a specific hospital (requires management role for the hospital)
router.post("/management/addDoctors",addDoctors );
router.put("/management/updateManagementProfile",updateManagementProfile);
// 2 delete a doctor form a hospital
router.delete("/management/deleteDoctor",deleteDoctorFromHospital);



module.exports = router;
