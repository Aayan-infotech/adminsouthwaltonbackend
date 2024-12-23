const express = require('express');
const mongoose = require('mongoose');
const Bookform = require('../models/checkoutModel');
const Driver = require('../models/driverModel');
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

// Get all 
const getAllBookforms = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;

    const payments = await Payment.find().sort({ createdAt: -1 });

    if (!payments || payments.length === 0) {
      return res.status(404).json({ message: 'No payments found' });
    }

    const allBookforms = await Promise.all(
      payments.map(async (payment) => {
        try {
          const reservation = await Reserve.findById(payment.reservation);
          if (!reservation) {
            console.log(`Reservation not found for Payment ID: ${payment._id}`);
            return null;
          }

          const booking = await Bookform.findById(payment.bookingId)
            .populate('driver')
            .populate('customerDrivers');
          if (!booking) {
            console.log(`Booking not found for Payment ID: ${payment._id}`);
            return null;
          }

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
              bookingId: booking._id,
              bname: booking.bname,
              bphone: booking.bphone,
              bemail: booking.bemail,
              baddress: booking.baddress,
              baddressh: booking.baddressh,
              driver: booking.driver,
              customerDrivers: booking.customerDrivers,
            },
          };
        } catch (err) {
          console.log(`Error fetching data for Payment ID: ${payment._id} - ${err.message}`);
          return null;
        }
      })
    );

    const successfulBookforms = allBookforms.filter((form) => form !== null);

    // Filter by bemail if search is provided
    const filteredBookforms = search
      ? successfulBookforms.filter((form) =>
          form.bookingDetails.bemail.toLowerCase().includes(search.toLowerCase())
        )
      : successfulBookforms;

    // Pagination
    const total = filteredBookforms.length;
    const paginatedBookforms = filteredBookforms.slice(
      (page - 1) * limit,
      page * limit
    );

    return res.status(200).json({
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      data: paginatedBookforms,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server Error', error: error.message });
  }
};



// Get a specific booking form by ID
const getBookformById = async (req, res) => {
  try {
    // Fetch the Bookform
    const bookform = await Bookform.findById(req.params.id)
      .populate('driver')
      .populate('customerDrivers')
      .populate({
        path: 'paymentId',
        populate: {
          path: 'reservation', // Populate reservation details
          model: 'Reservation', // Referencing the Reservation model
        },
      });
    if (!bookform) {
      return res.status(404).json({ message: 'Booking form not found' });
    }

    const reservationDetails =
    bookform.paymentId && bookform.paymentId.reservation
      ? bookform.paymentId.reservation
      : null;

  return res.status(200).json({
    success: true,
    message: 'Booking found',
    booking: {
      ...bookform.toObject(),
      reservationDetails, // Attach only reservation details
    },
  });
} catch (error) {
    console.error('Error fetching booking:', error.message);
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


