const express = require('express');
const mongoose = require('mongoose');
const doctorRoutes = require('./routes/doctors');
const hospitalRoutes = require('./routes/hospitals');
// const managementRoutes = require('./routes/')
const app = express();
const port =  5000; // Use environment variable for port or default to 5000

// Connect to MongoDB database (replace with your connection URI)
mongoose.connect('mongodb://0.0.0.0:27017/DoctorAppointmet', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error(err));

// Parse incoming JSON requests
app.use(express.json());

// Mount doctor routes
app.use('/api/doctors', doctorRoutes);
app.use('/api/hospitals', hospitalRoutes);
// app.use('/api/hospitals', managementRoutes);


// Start the server
app.listen(port, () => console.log(`Server listening on port ${port}`));
