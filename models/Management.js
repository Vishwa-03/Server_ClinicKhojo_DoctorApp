const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt'); // For password hashing

const ManagementSchema = new Schema({
  title: {
    type: String,
    required: true,
    enum: ['Mr.', 'Ms.', 'Mrs.', 'Dr.']
  },
  fullName: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Other']
  },
  password: {
    type: String,
    required: true
  },
  identity: {
    type: {
      type: String,
      required: true,
      enum: ['Aadhaar Card', 'Passport', 'PAN Card', 'Driving License']
    },
    uniqueIDNumber: {
      type: String,
      required: true
    },
    documentPath: {
      type: String // Store document path relative to upload directory
    }
  },
  hospitals: [{
    type: Schema.Types.ObjectId,
    ref: 'Hospital'
    // type:String,
  }],
  hospitalNames: [{ type: String }],
  
  // Add optional fields for additional details (e.g., department, role)
});
// ManagementSchema.post(  'save', async function (next) {
//   if (this.isNew) { // Only run if a new management profile is created
//     const hospital = await Hospital.findById(this.createdByEmail); // Find the newly created hospital
//     hospital.hospitals.push(this._id); // Add management profile ID to hospital's hospitals array
//     await hospital.save(); // Save the updated hospital document
//   }
//   // next();
// });
// Hash password before saving
ManagementSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

module.exports = mongoose.model('Management', ManagementSchema);
