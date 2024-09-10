const Event = require('../models/eventsModel');
const createError = require('../middleware/error');
const createSuccess = require('../middleware/success');
const { format } = require('date-fns');
// Create a new event
const createEvent = async (req, res, next) => {
  console.log(req.body);
  const { title, deliveryDate, pickupDate, deliveryTime, pickupTime, userName, email, mobileNumber, address, driverName, driverContact } = req.body;

  try {
    const eventEntry = new Event({
      title,
      deliveryDate,
      pickupDate,
      deliveryTime,
      pickupTime,
      userName,
      email,
      mobileNumber,
      address,
      driverName,
      driverContact
    });

    const newEvent = await eventEntry.save();
    res.status(201).json(newEvent);
  } catch (err) {
    console.error("Error in createEvent:", err);
    res.status(400).json({ message: err.message });
  }
};

const formatDate = (isoDate) => {
  if (!isoDate) return null;
  return format(new Date(isoDate), 'yyyy-MM-dd');
};
// Get all events
const getAllEvents = async (req, res, next) => {
  try {
    const allEvents = await Event.find();
    const formattedEvents = allEvents.map(event => ({
      _id: event._id,
      title: event.title,
      deliveryDate: formatDate(event.deliveryDate),
      pickupDate: formatDate(event.pickupDate),
      deliveryTime: event.deliveryTime,
      pickupTime: event.pickupTime,
      userName: event.userName,
      email: event.email,
      mobileNumber: event.mobileNumber,
      address: event.address,
      driverName: event.driverName,
      driverContact: event.driverContact,
      createdAt: formatDate(event.createdAt),
      updatedAt: formatDate(event.updatedAt),
      __v: event.__v
    }));

    return res.status(200).json(createSuccess(200, "All Events", formattedEvents));
  }
  catch (error) {
    return next(createError(500, "Failed to fetch events"));
  }
};

// Get event by ID
const getEventById = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json(createError(404, "Event not found"));
    }
    return res.status(200).json(createSuccess(200, "Single Event", event));
  } catch (error) {
    return next(createError(500, "Failed to fetch event details"));
  }
};

// Update event by ID
const updateEvent = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const { title, deliveryDate, pickupDate, deliveryTime, pickupTime, userName, email, mobileNumber, address, driverName, driverContact } = req.body;
    const updatedEvent = await Event.findByIdAndUpdate(eventId,
      { title, deliveryDate, pickupDate, deliveryTime, pickupTime, userName, email, mobileNumber, address, driverName, driverContact },
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(404).json(createError(404, "Event not found"));
    }

    return res.status(200).json(createSuccess(200, "Event updated successfully", updatedEvent));
  } catch (error) {
    return next(createError(500, "Failed to update event"));
  }
};

// Delete event by ID
const deleteEvent = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const deletedEvent = await Event.findByIdAndDelete(eventId);

    if (!deletedEvent) {
      return res.status(404).json(createError(404, "Event not found"));
    }
    return res.status(200).json(createSuccess(200, "Event deleted successfully", deletedEvent));
  } catch (error) {
    return next(createError(500, "Failed to delete event"));
  }
};

module.exports = { createEvent, getAllEvents, getEventById, updateEvent, deleteEvent };
