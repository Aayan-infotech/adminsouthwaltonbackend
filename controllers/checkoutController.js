const express = require('express');
const mongoose = require('mongoose');
const Bookform = require('../models/checkoutModel'); 
const Driver  = require('../models/driverModel');
const Payment = require('../models/PaymentModel');
const Reserve = require('../models/reserveModel');

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
      const payments = await Payment.find();
      console.log('Payments:', payments);
  
      if (!payments || payments.length === 0) {
        return res.status(404).json({ message: 'No payments found' });
      }
  
      const allBookforms = await Promise.all(
        payments.map(async (payment) => {
          try {
            console.log('Processing Payment ID:', payment._id);
            console.log('Reservation ID:', payment.reservation);
            console.log('Booking ID:', payment.bookingId);
  
            // Fetch reservation and booking data
            const reservation = await Reserve.findById(payment.reservation);
            if (!reservation) {
              console.log(`Reservation not found for Payment ID: ${payment._id}`);
              return null;  // Skip to the next payment
            }
  
            const booking = await Bookform.findById(payment.bookingId);
            if (!booking) {
              console.log(`Booking not found for Payment ID: ${payment._id}`);
              return null;  // Skip to the next payment
            }
  
            // Return the details if both reservation and booking are found
            return {
              paymentId: payment._id,
              userId: payment.userId,
              transactionId: payment.transactionId,
              email: payment.email,
              amount: payment.amount,
              reservationDetails: {
                pickup: reservation.pickup,
                drop: reservation.drop,
                pickdate: reservation.pickdate,
                dropdate: reservation.dropdate,
              },
              bookingDetails: {
                bname: booking.bname,
                bphone: booking.bphone,
                bemail: booking.bemail,
                baddress: booking.baddress,
                baddressh: booking.baddressh,
              },
            };
          } catch (err) {
            console.log(`Error fetching data for Payment ID: ${payment._id} - ${err.message}`);
            return null;  // Skip to the next payment
          }
        })
      );
  
      const successfulBookforms = allBookforms.filter((form) => form !== null);  // Filter out errors
      return res.status(200).json(successfulBookforms);
    } catch (error) {
      return res.status(500).json({ message: 'Server Error', error: error.message });
    }
  };
  
  
  
  // Get a specific booking form by ID
  const getBookformById = async (req, res) => {
    try {
        const bookform = await Bookform.findById(req.params.id).populate('reservationId');
        if (!bookform) {
            return res.status(404).json({ message: 'Booking form not found' });
        }
        return res.status(200).json({
            success: true,
            message: "Booking found",
            booking: bookform
        });
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
    deleteBookform,
  
};

