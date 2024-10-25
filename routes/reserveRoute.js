const express = require('express');
const { createReservation, getAllReservations, acceptReservation, getReservationById, updateReservation } = require('../controllers/reserveController');

const router = express.Router();

router.post('/reservation', createReservation);       
router.get('/reservations', getAllReservations);           
router.get('/reservation/:id', getReservationById);     
router.put('/reservation/:id', updateReservation);     
router.put('/reservation/:id/accept', acceptReservation);

module.exports = router;
