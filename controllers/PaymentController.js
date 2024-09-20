const express = require('express');
const mongoose = require('mongoose');
const Payment = require('../models/PaymentModel'); // Ensure this path is correct
const stripe = require('stripe')('sk_test_51PsifGP6k3IQ77YBE98XROIJtJc4wGDoTfrKcTpmLBR73FBj7yP2KXGSZeDDC8zXIp5rRHnkqQnp2aibECXsRHTR00hoZqKAe2');
const router = express.Router();

// Handler function to create and save payment info
const PaymentInfo = async (req, res) => {
    try {
        // Create a new Payment instance with data from req.body
        const createPayment = new Payment(req.body);

        // Save the new Payment document to the database
        const savedPayment = await createPayment.save();

        // Send a success response with the saved document
        res.status(201).json(savedPayment);
    } catch (error) {
        // Send an error response if something goes wrong
        res.status(400).json({ message: error.message });
    }
};

// Handler function to fetch all payment records
const getAllPayments = async (req, res) => {
  try {
    const charges = await stripe.charges.list({
      limit: 100, // You can adjust the limit as per your needs
    });
    res.status(200).json(charges.data);
  } catch (error) {
    console.error('Error fetching payments from Stripe:', error);
    res.status(500).json({ error: 'Error fetching payments' });
  }
};

const deletePayment = async (req, res) => {
    const { id } = req.params;

    try {
        // Find the payment by ID and delete it
        const deletedPayment = await Payment.findByIdAndDelete(id);

        if (!deletedPayment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        // You might also want to delete the charge from Stripe (optional)
        // await stripe.charges.refund(id); // Uncomment if you want to handle stripe refunds

        res.status(200).json({ message: 'Payment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting payment', error: error.message });
    }
};

const getPaymentIntent = async (transactionId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(transactionId);
    return paymentIntent;
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    throw error;
  }
};


// Export the handler functions
module.exports = {
    PaymentInfo,
    getAllPayments,
    deletePayment,
    getPaymentIntent
};
