const express = require('express');
const { createEvent, getAllEvents, getEventById, updateEvent, deleteEvent } = require('../controllers/eventsController');
const router = express.Router();

//  create a new event
router.post('/add', createEvent);

// get all events
router.get('/', getAllEvents);

// get event by ID
router.get('/:id', getEventById);

//  update  by ID
router.put('/:id', updateEvent);

// delete by ID
router.delete('/:id', deleteEvent);

module.exports = router;
