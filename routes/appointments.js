const express = require('express');
const appointmentController = require('../controllers/Appointments'); // Import controller

const router = express.Router();

router.get('/getAllAppointments', appointmentController.getAllAppointments);
router.get('/filterAppointments', appointmentController.getAppointmentsByType);
router.post('/createAppointment',appointmentController.createAppointment);


module.exports = router;
