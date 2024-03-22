const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser"); // for parsing request body
const cors = require("cors"); // for enabling CORS (if needed)
const bcrypt = require("bcrypt"); // for password hashing
const router = express.Router();
// const auth = require("./utils/auth"); // Import authentication logic
const Hospital = require("../models/Hospital"); // Import Hospital model
const Doctor = require("../models/Doctor"); // Import Doctor model
const Management = require("../models/Management"); // Import Management model (for storing management profiles)

// 1. Register a new management profile
exports.signup = async (req, res) => {
  try {
    // 1. Extract user data from request body
    const {
      title,
      fullName,
      contactNumber,
      email,
      gender,
      password,
      identity,
    } = req.body;

    // 2. Data Validation (implement robust validation)
    if (
      !title ||
      !fullName ||
      !contactNumber ||
      !email ||
      !gender ||
      !password ||
      !identity
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 3. Check for existing email
    const existingManagement = await Management.findOne({ email });
    if (existingManagement) {
      return res.status(409).json({ message: "Email address already exists" });
    }

    // 4. Hash password

    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Create new Management document
    const newManagement = new Management({
      title,
      fullName,
      contactNumber,
      email,
      gender,
      password: hashedPassword,
      identity: {
        type: identity.type,
        uniqueIDNumber: identity.uniqueIDNumber,
        documentPath: identity.documentPath, // (implement document upload logic)
      },
    });

    // 6. Save the new management profile
    await newManagement.save();

    // 7. Send success response (consider including generated token for login)
    res
      .status(201)
      .json({ message: "Management profile created successfully" });
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({ message: "Internal server error" });
  }
};
// 2. Get management personnel profile
exports.getManagementProfile = async (req, res) => {
  const { email } = req.query;
  console.log(email);
  try {
    // 1. Authentication check (if applicable)
    // Implement authentication middleware if needed to restrict access

    // 2. Find management profile by email with selective fields projection
    const projection = { _id: 0, password: 0 }; // Exclude _id and password
    const management = await Management.findOne({ email }, projection);
    console.log(management);
    if (!management) {
      return res
        .status(404)
        .json({ message: "Management personnel not found" });
    }

    // 3. Populate additional data (optional)
    // Here, you can populate related data from other models if needed
    // Example: populate clinic details if Management has a clinic reference
    // const populatedManagement = await management.populate('clinic').execPopulate();

    // 4. Send success response
    res.status(200).json(management);
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({ message: "Internal server error" });
  }
};
// **Hospital Management Routes (with role-based authorization):**

// 1. Create a new hospital profile (requires management role)
exports.createHospitals = async (req, res) => {
  try {
    // 1. Verify user authorization (implement with auth middleware)
    // const { userId } = req.user; // Assuming user ID is retrieved from token
    // const email = req.createdByEmail;
    // 2. Extract hospital data from request body
    const {
      name,
      profilePhoto,
      contactNumber,
      alternateContactNumber,
      address,
      timings,
      specializations,
      description,
      photos,
      yearOfEstablishment,
      registration,
      createdByEmail,
      ...otherdetails
    } = req.body;

    // 3. Data Validation (implement robust validation)
    if (
      !name ||
      !contactNumber ||
      !address ||
      !timings ||
      !specializations ||
      !yearOfEstablishment ||
      !registration
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 4. Create new Hospital document
    const newHospital = new Hospital({
      name,
      profilePhoto, // (implement logic to store uploaded photo path)
      contactNumber,
      alternateContactNumber,
      address,
      timings,
      specializations,
      description,
      photos: {
        // (implement logic to store uploaded photos)
        infrastructure: photos?.infrastructure || [],
        equipment: photos?.equipment || [],
        team: photos?.team || [],
        other: photos?.other || [],
      },
      yearOfEstablishment,
      registration: {
        registrationNumber: registration.registrationNumber,
        yearOfRegistration: registration.yearOfRegistration,
        certificatePath: registration.certificatePath, // (implement logic to store uploaded certificate path)
      },
      createdByEmail, // Reference the currently logged-in management profile
      ...otherdetails,
    });

    // 5. Save the new hospital
    await newHospital.save();
    // Associate hopsital with clinic
    const management = await Management.findOneAndUpdate(
      { email: createdByEmail }, // Find by createdByEmail
      { $push: { hospitals: newHospital._id } },

      { new: true } // Push hospital ID to hospitals array
    );
    const management2 = await Management.findOneAndUpdate(
      { email: createdByEmail }, // Find by createdByEmail
      //   // { "$push": { hospitals: newHospital._id , } },
      { $push: { hospitalNames: newHospital.name } },
      { new: true } // Push hospital ID to hospitals array
    );
    console.log(management);
    console.log(createdByEmail);
    if (!management) {
      return res.status(400).json({
        message: "Failed to associate hospital with management profile",
      });
    }
    console.log(management);
    // 6. Send success response
    res.status(201).json({ message: "Hospital created successfully" });
  } catch (err) {
    console.error(err.stack);
    res
      .status(500)
      .json({ message: "Internal server error Hospital not created" });
  }
};

// 2. Get all hospitals (optional: with filtering/sorting)
exports.getAllHospitals = async (req, res) => {
  try {
    const { email } = req.query; // Assuming email is retrieved from query parameter
    // http://localhost:5000/api/hospitals/getAllHospitals?email=john.doe@hospital.com
    // Check if email is provided
    if (!email) {
      return res
        .status(400)
        .json({ message: "Missing required parameter: email" });
    }

    const hospitals = await Hospital.find({ createdByEmail: email });

    res.status(200).json({ hospitals });
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 3. Get a specific hospital by ID
// router.get("/hospitals/:hospitalId", async (req, res) => {
//   try {
//     const hospital = await Hospital.findById(req.params.hospitalId);
//     if (!hospital) {
//       return res.status(404).json({ message: "Hospital not found" });
//     }

//     res.status(200).json({ hospital });
//   } catch (err) {
//     console.error(err.stack);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// // 4. Update a hospital profile (requires management role for the hospital)
// router.put("/hospitals/:hospitalId", async (req, res) => {
//   try {
//     const { userId, role } = req.user; // Assuming user ID and role retrieved from token
//     const { hospitalId } = req.params;

//     // Check if management profile owns the hospital
//     const hospital = await Hospital.findById(hospitalId);
//     if (!hospital || hospital.createdBy.toString() !== userId.toString()) {
//       return res.status(403).json({ message: "Unauthorized access" });
//     }

//     // ... existing logic for updating hospital details with validation
//   } catch (err) {
//     console.error(err.stack);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// // 5. Delete a hospital profile (requires management role for the hospital)
// router.delete("/hospitals/:hospitalId", async (req, res) => {
//   try {
//     const { userId, role } = req.user; // Assuming user ID and role retrieved from token
//     const { hospitalId } = req.params;

//     // Check if management profile owns the hospital
//     const hospital = await Hospital.findById(hospitalId);
//     if (!hospital || hospital.createdBy.toString() !== userId.toString()) {
//       return res.status(403).json({ message: "Unauthorized access" });
//     }

//     // ... existing
//     // ... existing logic for deleting the hospital document and associated data (if routerlicable)
//   } catch (err) {
//     console.error(err.stack);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// **Doctor Management Routes (with role-based authorization):**

// 1. Add a doctor to a specific hospital (requires management role for the hospital)
exports.addDoctors = async (req, res) => {
  // ... existing logic with checks for doctor existence and association (refer to previous examples)
  try {
    // 1. Verify user authorization (enhanced with role check)
    // const { userId, role } = req.user; // Assuming user ID and role retrieved from token
    const { doctorName, doctorRegistrationNumber, managementPersonnelEmail } =
      req.body; // Hospital ID from URL path

    // if (role !== "management") {
    //   return res
    //     .status(403)
    //     .json({ message: "Unauthorized access (requires management role)" });
    // }

    // 2. Check if management profile owns the hospital
    const hospital = await Hospital.find({
      createdByEmail: managementPersonnelEmail,
    });
    if (!hospital) {
      return res.status(403).json({ message: "Unauthorized access" });
    }
    // 3. Find the doctor by ID and check existence
    const doctor = await Doctor.find({ fullName: doctorName });
    const doctor2 = await Doctor.find({
      uniqueDoctorId: doctorRegistrationNumber,
    });
    if (!doctor || !doctor2) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // 4. Check if doctor is already associated with the hospital
    if (
      hospital &&
      hospital.doctorsName?.some((doctor) => doctor.name === doctorName)
    ) {
      return res
        .status(409)
        .json({ message: "Doctor already associated with this hospital" });
    }

    // 5. Update the hospital document to include the doctor's ID

    const hospitalObj = await Hospital.findOneAndUpdate(
      { createdByEmail: managementPersonnelEmail }, // Find by name of doctor
      { $push: { doctorsName: doctorName } },
      { $push: { doctors: doctor._id } },
      { new: true } // Push hospital ID to hospitals array
    );
    // const hospitalObj2 = await Hospital.findOneAndUpdate(
    //   {  createdByEmail: managementPersonnelEmail }, // Find by name of doctor
    //   { $push: { doctors:doctor._id } },

    //   { new: true } // Push hospital ID to hospitals array
    // );
    console.log(hospitalObj);
    console.log(managementPersonnelEmail);
    if (!hospitalObj) {
      return res.status(400).json({
        message: "Failed to associate doctor with hospital ",
      });
    }

    // 6. Send success response
    res
      .status(200)
      .json({ message: "Doctor added to the hospital successfully" });
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 2. Get all doctors associated with a specific hospital
// router.get("/hospitals/:hospitalId/doctors", async (req, res) => {
//   try {
//     const hospital = await Hospital.findById(req.params.hospitalId);
//     if (!hospital) {
//       return res.status(404).json({ message: "Hospital not found" });
//     }

//     const doctors = await Doctor.find({ _id: { $in: hospital.doctors } }); // Find doctors by IDs in hospital.doctors array

//     res.status(200).json({ doctors });
//   } catch (err) {
//     console.error(err.stack);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// // 3. (Optional) Update a doctor profile (implement if needed)
// router.put("/doctors/:doctorId", async (req, res) => {
//   const doctorId = req.params.doctorId;

//   try {
//     // Authentication check
//     // await authMiddleware(req, res); // Assuming middleware handles authorization

//     // Validate request body
//     // const { error } = validateDoctorUpdate(req.body);
//     // if (error) return res.status(400).send(error.details[0].message);

//     const doctor = await Doctor.findById(doctorId);
//     if (!doctor) {
//       return res.status(404).send("Doctor not found.");
//     }

//     // Update doctor details using Lodash _.pick for selective updates
//     const updates = _.pick(req.body, [
//       // Updatable fields based on your Doctor model definition
//       "title",
//       "fullName",
//       "contactNumber",
//       "gender",
//       "dateOfBirth",
//       "yearsOfExperience",
//       "specialization",
//       "address",
//       "bio",
//       // ... Add more fields if needed
//     ]);

//     // Update specific fields based on requirements (adapt and extend)
//     if (req.body.education) {
//       doctor.education = req.body.education; // Replace entire education array (validate if needed)
//     }

//     if (req.body.registrationDetails) {
//       // Implement logic to update registration details (handle uniqueness)
//       const registrationUpdates = _.pick(req.body.registrationDetails, [
//         "registrationNumber",
//         "yearOfRegistration",
//         "registrationAuthority",
//       ]);

//       // Validation for registration details (replace with your specific logic)
//       const existingDoctor = await Doctor.findOne({
//         registrationNumber: registrationUpdates.registrationNumber,
//       });
//       if (
//         existingDoctor &&
//         existingDoctor._id.toString() !== doctorId.toString()
//       ) {
//         return res.status(400).send("Registration number already exists.");
//       }

//       doctor.set(registrationUpdates); // Update multiple fields at once
//     }

//     if (req.body.identityProof) {
//       // Implement logic to update identity proof details
//       const identityUpdates = _.pick(req.body.identityProof, [
//         "identityType",
//         "uniqueIdNumber",
//       ]);

//       // Validation for identity proof details (replace with your logic)
//       doctor.set(identityUpdates); // Update multiple fields at once
//     }

//     if (req.body.clinic) {
//       const clinicId = mongoose.Types.ObjectId(req.body.clinic); // Convert to ObjectId
//       if (!mongoose.isValidObjectId(clinicId)) {
//         return res.status(400).send("Invalid clinic ID");
//       }
//       doctor.clinic = clinicId; // Assuming a Clinic model exists and is linked
//     }

//     if (req.body.availableSlots) {
//       // Implement logic to update availability slots based on your requirements
//       // ... (This section requires complex updates and depends on your data model)
//       // Here's a basic example (replace with your specific logic):
//       const availableSlots = req.body.availableSlots;
//       // Validate availableSlots format and data (e.g., date, time slots)
//       // ...
//       doctor.availableSlots = availableSlots; // Update doctor's available slots
//     }

//     // Update other doctor profile details as needed

//     await doctor.updateOne(updates);
//     res.status(200).send(doctor);
//   } catch (error) {
//     console.error(error); // Log errors for debugging
//     res.status(500).send("Internal server error"); // Customize error message if needed
//   }
// });

// // 4. (Optional) Delete a doctor profile (implement if needed)
exports.deleteDoctorFromHospital = async (req, res) => {
  const { Id } = req.query;
  const { email } = req.body;
  try {
    const managementPersonnel = await Management.find({ email: email });
    if (!managementPersonnel) {
      return res.status(404).json("Management personnel not found");
    }
    const hospital = await Hospital.find({ createdByEmail: email });
    console.log(hospital);
    let doctorFound = false;
    let tempDoctors = [];
    hospital.forEach((hospitals) => {
      console.log("----- Hospital Details -----");
      console.log(`Name: ${hospitals.name}`);
      console.log(`Contact Number: ${hospitals.contactNumber}`);
      console.log(`Doctors Id: ${hospitals.doctorsId}`);
      tempDoctors = hospitals.doctorsId;
      // Flag to track if doctor is found

      //   for (let i = 0; i < hospitals.doctorsId.length; i++) {
      //     if (hospital.doctorsId[i] === Id) {
      //       hospital.doctorsId.splice(i, 1);
      //       hospital.doctorsName.splice(i, 1); // Assuming doctorsName has corresponding names (optional)
      //       doctorFound = true;
      //       break; // Exit the loop after finding and removing the doctor
      //     }
      //   }
      // ... (display other properties)
    });
    console.log(tempDoctors);
    for (let i = 0; i < tempDoctors.length; i++) {
      if (tempDoctors[i] === Id) {
        tempDoctors.splice(i, 1);
        tempDoctors.splice(i, 1); // Assuming doctorsName has corresponding names (optional)
        doctorFound = true;
        break; // Exit the loop after finding and removing the doctor
      }
    }
    console.log(tempDoctors)
    if (!hospital) {
      return res.status(404).json("Hospital not found");
    }

    // let doctorFound = false; // Flag to track if doctor is found

    // for (let i = 0; i < hospital.doctorsId?.length; i++) {
    //   if (hospital.doctorsId[i] === Id) {
    //     hospital.doctorsId.splice(i, 1);
    //     hospital.doctorsName.splice(i, 1); // Assuming doctorsName has corresponding names (optional)
    //     doctorFound = true;
    //     break; // Exit the loop after finding and removing the doctor
    //   }
    // }

    // const matchingDoctor = await hospital.doctorsId?.find((id) => id === Id);
    // if (!matchingDoctor) {
    //   return res.status(404).json("Doctor not found in the hospital");
    // }
    // console.log(hospital.createdByEmail)
    // Remove the doctor from the doctorsId array
    // const doctorIndex = await hospital.doctorsId.indexOf(Id);
    // await hospital.doctorsId.splice(doctorIndex, 1);
    // await hospital.doctorsName.splice(doctorIndex, 1); // Assuming doctorsName has corresponding names (optional)
    if (!doctorFound) {
      return res.status(404).json("Doctor not found in the hospital");
    }
    // Save the updated hospital document
    await hospital.save();
    res.status(204).send("Doctor deleted successfully");
  } catch (error) {
    console.error(error); // Log errors for debugging
    res.status(500).send("Internal server error"); // Customize error message if needed
  }
};

// ... other routes for managing routerointments, patients, etc. (implement as needed)
