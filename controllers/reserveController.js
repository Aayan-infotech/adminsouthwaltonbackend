const express = require('express');
const mongoose = require('mongoose');
const Reserve = require('../models/reserveModel');
const router = express.Router();
const nodemailer = require('nodemailer');
const User = require('../models/userModel');

// Create a new reservation
const createReservation = async (req, res) => {
    try {
        const reserveform = new Reserve(req.body);
        const savedForm = await reserveform.save();
        res.status(201).json({ id: savedForm._id });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all reservations
const getAllReservations = async (req, res) => {
    try {
        const reservations = await Reserve.find();
       
        res.json({
            success: true,
            message: 'All Reservations',
            data: reservations,
          });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//accept
const acceptReservation = async (req, res) => {
    try {
        const { id } = req.params; // Get reservation ID from request parameters
        const reservation = await Reserve.findById(id);

        if (!reservation) {
            return res.status(404).json({ message: "Reservation not found" });
        }

        // Update reservation status to accepted
        reservation.booking = true; // Set booking status as accepted
        await reservation.save();

        // Fetch user email from the userId
        const user = await User.findById(reservation.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Send email notification
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email, // User email from the database
            subject: 'Reservation Accepted',
            text: `Your reservation with ID ${id} has been accepted. Kindly continue with your booking. Thank you!`
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: "Reservation accepted and email sent." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single reservation by ID
const getReservationById = async (req, res) => {
    try {
        const reservation = await Reserve.findById(req.params.id);
        if (!reservation) {
            return res.status(404).json({ message: "Reservation not found" });
        }
        res.status(200).json(reservation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a reservation
const updateReservation = async (req, res) => {
    try {
        const updatedReservation = await Reserve.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true } // This option returns the updated document
        );
        if (!updatedReservation) {
            return res.status(404).json({ message: "Reservation not found" });
        }
        res.status(200).json(updatedReservation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    createReservation,
    getAllReservations,
    acceptReservation,
    getReservationById,
    updateReservation
};
