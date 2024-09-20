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
        const bookforms = await Bookform.find();
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

const getAvailableDriversByDropDate = async (req, res) => {
    const { bdropDate } = req.body;

    if (!bdropDate) {
        return res.status(400).json({ success: false, message: "bdropDate query parameter is required" });
    }

    try {
        // Parse the date from 'YYYY-MM-DD' format
        const parsedDropDate = new Date(bdropDate);

        // Validate the date format
        if (isNaN(parsedDropDate.getTime())) {
            return res.status(400).json({ success: false, message: "Invalid date format" });
        }

        // Convert the date to the start of the day (midnight) for consistency
        parsedDropDate.setHours(0, 0, 0, 0);

        // Find bookings by bdropDate
        const bookingsOnDate = await Bookform.find({
            bdropDate: {
                $gte: parsedDropDate,
                $lt: new Date(parsedDropDate).setDate(parsedDropDate.getDate() + 1) // Next day
            }
        });

        // Extract the list of drivers who are already assigned to bookings on this date
        const assignedDriverIds = bookingsOnDate
            .filter(booking => booking.driver) // Ensure the booking has a driver assigned
            .map(booking => booking.driver);   // Extract the driver ID

        // Find available drivers who are not assigned to any booking on this date
        const availableDrivers = await Driver.find({
            _id: { $in: assignedDriverIds } // Exclude drivers who are already assigned
        });

        res.json({
            success: true,
            message: "Available Drivers for the specified drop date",
            drivers: availableDrivers
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
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

