const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const HospitalSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  profilePhoto: {
    type: String, // Path to the uploaded profile photo
  },
  contactNumber: {
    type: String,
    required: true,
  },
  alternateContactNumber: {
    type: String,
  },
  address: {
    city: {
      type: String,
      required: true,
    },
    locality: {
      type: String,
      required: true,
    },
    streetAddress: {
      type: String,
      required: true,
    },
    clinicAddress: {
      type: String,
    },
  },
  timings: {
    days: [
      {
        type: String,
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
    ],
    opening: {
      type: String,
    },
    closing: {
      type: String,
    },
  },
  specializations: {
    primary: {
      type: String,
      required: true,
    },
    additional: [String],
  },
  description: {
    type: String,
  },
  photos: {
    infrastructure: [String], // Paths to uploaded infrastructure photos
    equipment: [String], // Paths to uploaded equipment photos
    team: [String], // Paths to uploaded team photos
    other: [String], // Paths to uploaded other photos
  },
  yearOfEstablishment: {
    type: Date,
  },
  registration: {
    registrationNumber: {
      type: String,
     
    },
    yearOfRegistration: {
      type: Date,
     
    },
    certificatePath: {
      type: String, // Path to the uploaded registration certificate
    },
  },
  managementEmail: {
    type: String,
    require: true,
    index: true,
    unique: true,
    sparse: true,
  },
  doctorsId: [
    {
      type: String,
    },
  ],
  doctorsName: [
    {
      type: String,
    },
  ],
});

module.exports = mongoose.model("Hospital", HospitalSchema);
