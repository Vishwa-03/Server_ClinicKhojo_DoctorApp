const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['emergency', 'normal']
  },
  patient: {
    name: {
      type: String,
      required: true
    },
    age: {
      type: Number,
      required: true
    },
    gender: {
      type: String,
      required: true
    }
  },
  doctor: { // Doctor assigned to the appointment (optional)
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  },
  block: {
    type: String,
    required: true
  },
  timing: {
    type: Date,
    required: true
  },
  arrived: {
    type: Boolean,
    default: false
  },
  // Emergency specific fields
  isAccepted: {
    type: Boolean,
    default: false,
    required: function() { return this.type === 'emergency'; }
  },
  expiresAt: {
    type: Date,
    required: function() { return this.type === 'emergency'; },
    default: function() {
      if (this.type === 'emergency') {
        return Date.now() + (24 * 60 * 60 * 1000); // 1 day in milliseconds
      }
    }
  }
});
// appointmentSchema.pre('save', function(next) {
//   // Set expiresAt for emergency appointments before saving
//   if (this.type === 'emergency') {
//     this.expiresAt = Date.now() + (2 * 60 * 1000); // 2 minutes in milliseconds
//   }
//   next();
// });
module.exports = mongoose.model('Appointment', appointmentSchema);

  
  
  
 
  
  


