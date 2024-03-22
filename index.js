const express = require("express");
const mongoose = require("mongoose");
const doctorRoutes = require("./routes/doctors");
const hospitalRoutes = require("./routes/hospitals");
const appointmentRoutes = require("./routes/appointments")
const { MongoClient } = require("mongodb");

const database= require("./config/Database");
const dotenv = require("dotenv");

dotenv.config();
// const managementRoutes = require('./routes/')
const app = express();
const PORT = process.env.PORT || 5000;// Use environment variable for port or default to 5000

// Connect to MongoDB database (replace with your connection URI)
database.dbConnect();

// Parse incoming JSON requests
app.use(express.json());

// Mount doctor routes
app.use("/api/doctors", doctorRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use('/api/appointments', appointmentRoutes);
// app.use('/api/hospitals', managementRoutes);

// Start the server
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
