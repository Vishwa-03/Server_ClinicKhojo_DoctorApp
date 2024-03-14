const express = require('express');
const mongoose = require('mongoose');
const doctorRoutes = require('./routes/doctors');

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

// Start the server
app.listen(port, () => console.log(`Server listening on port ${port}`));
