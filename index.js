const express = require('express');
const mongoose = require('mongoose');
const doctorRoutes = require('./routes/doctors');
const hospitalRoutes = require('./routes/hospitals');
const { MongoClient } = require('mongodb');
const DoctorModel = require('./models/Doctor')
// const managementRoutes = require('./routes/')
const app = express();
const port =  5000; // Use environment variable for port or default to 5000


// Connect to MongoDB database (replace with your connection URI)
mongoose.connect('mongodb+srv://vsp3032003:I5h19jPy6OLGKt7u@clinickhojotestdata.80dlch7.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error(err));



// const uri = "mongodb+srv://vsp3032003:I5h19jPy6OLGKt7u@clinickhojotestdata.80dlch7.mongodb.net/?retryWrites=true&w=majority";  // Replace placeholders

// const client = new MongoClient(uri, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });  

// async function connectToDatabase() {
//   try {
//     await client.connect();
//     console.log("Connected to MongoDB Atlas!"); 

//     // Perform your database operations here (e.g., CRUD)

//     await client.close();
//   } catch (error) {
//     console.error("Error connecting to MongoDB Atlas:", error);
//   }
// }

// connectToDatabase();





// Parse incoming JSON requests
app.use(express.json());

// Mount doctor routes
app.use('/api/doctors', doctorRoutes);
app.use('/api/hospitals', hospitalRoutes);
// app.use('/api/hospitals', managementRoutes);


// Start the server
app.listen(port, () => console.log(`Server listening on port ${port}`));
