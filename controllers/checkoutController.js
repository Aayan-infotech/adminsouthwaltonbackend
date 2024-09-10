const express = require('express');
const mongoose = require('mongoose');
const Bookform = require('../models/checkoutModel'); // Adjust the path according to your file structure

const router = express.Router();

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
        res.json(bookforms);
    } catch (error) {
        res.status(500).json({ message: error.message });
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

module.exports = {
    createBookform,
    getAllBookforms,
    getBookformById,
    updateBookform,
    deleteBookform
};

