const express = require('express');
const mongoose = require('mongoose');
const Bookform = require('../models/checkoutModel'); 
const Driver  = require('../models/driverModel');

// Create a new booking form
const createBookform = async (req, res) => {
    try {
        const bookform = new Bookform(req.body);
        const savedForm = await bookform.save();
        res.status(201).json(savedForm);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all booking forms
const getAllBookforms = async (req, res) => {
    try {
        let bookforms = await Bookform.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            message: 'Bookings retrieved successfully.',
            data: bookforms,
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};



// Get a specific booking form by ID
const getBookformById = async (req, res) => {
    try {
        const bookform = await Bookform.findById(req.params.id);
        if (!bookform) return res.status(404).json({ message: 'Booking form not found' });
        res.json(bookform);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a booking form by ID
const updateBookform = async (req, res) => {
    try {
        const updatedForm = await Bookform.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedForm) return res.status(404).json({ message: 'Booking form not found' });
        res.json(updatedForm);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a booking form by ID
const deleteBookform = async (req, res) => {
    try {
        const deletedForm = await Bookform.findByIdAndDelete(req.params.id);
        if (!deletedForm) return res.status(404).json({ message: 'Booking form not found' });
        res.json({ message: 'Booking form deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Available Drivers by Drop Date
const getAvailableDriversByDropDate = async (req, res, next) => {
    try {
        const { dropDate } = req.body; // Ensure you are getting dropDate from the request body
        
        // Find all bookings that conflict with the given dropDate
        const bookedDrivers = await Bookform.find({
            bdropDate: {
                $eq: new Date(dropDate)  // Check for exact matches (consider using range if needed)
            }
        }).select('driver'); // Only get the driver IDs

        const bookedDriverIds = bookedDrivers.map(booking => booking.driver); // Extract driver IDs

        // Fetch available drivers excluding the booked ones
        const availableDrivers = await Driver.find({
            _id: { $nin: bookedDriverIds } // Exclude booked drivers
        });

        // Construct the image URLs for available drivers
        const availableDriversWithImages = availableDrivers.map(driver => {
            if (driver.image) {
                const imageURL = `${req.protocol}://${req.get('host')}/api/driver/image/${driver.image.filename}`;
                return {
                    ...driver._doc,
                    image: { ...driver.image._doc, url: imageURL }
                };
            } else {
                return { ...driver._doc, image: null };
            }
        });

        return next(createSuccess(200, "Available Drivers", availableDriversWithImages));
    } catch (error) {
        console.error(error);
        return next(createError(500, "Internal Server Error!"));
    }
};

  
module.exports = {
    createBookform,
    getAllBookforms,
    getBookformById,
    updateBookform,
    deleteBookform,
    getAvailableDriversByDropDate,
};

