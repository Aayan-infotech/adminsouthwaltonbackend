const mongoose = require("mongoose"); 
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require("../models/PaymentModel");
const Damage = require("../models/damageModel");
const multer = require("multer");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const path = require('path');
const fs = require('fs');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });



// Create Damage Record
exports.createDamage = async (req, res) => {
  const images = req.files ? req.files.map(file => file.filename) : [];
  
  try {
    const { bookingId, damage, reason } = req.body;

    // Convert bookingId to ObjectId if it's not already one
    const objectIdBookingId = new mongoose.Types.ObjectId(bookingId);  // Use "new" keyword here

    // Fetch the payment record using the ObjectId of the bookingId
    const payment = await Payment.findOne({ _id: objectIdBookingId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: `No payment record found for the provided bookingId: ${bookingId}`,
      });
    }

    // Create a new Damage instance
    const newDamage = new Damage({
      bookingId,  // Store the bookingId as a reference to the Payment record
      transactionId: payment.transactionId, // Automatically fetch transactionId from Payment model
      damage,
      reason,
      images,
    });

    // Save the damage record to the database
    const savedDamage = await newDamage.save();
    
    res.status(201).json({
      success: true,
      message: 'Damage record created successfully',
      data: savedDamage,
    });
  } catch (error) {
    console.error('Error creating damage record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create damage record',
      error: error.message,
    });
  }
};

exports.sendDamageReport = async (damage) => {
  const doc = new PDFDocument();
  const pdfPath = `uploads/damage_report_${damage._id}.pdf`;
  
  try {
    doc.pipe(fs.createWriteStream(pdfPath));

    // Add content to the PDF
    doc.fontSize(20).text('Damage Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Damage ID: ${damage._id}`);
    doc.text(`Booking ID: ${damage.bookingId}`);
    doc.text(`Damage Description: ${damage.damage}`);
    doc.text(`Reason: ${damage.reason}`);

    if (damage.images && Array.isArray(damage.images) && damage.images.length > 0) {
      doc.text(`Images: ${damage.images.join(', ')}`);
    } else {
      doc.text('Images: No images attached');
    }

    doc.end();

    // Setup email transport
    const transporter = nodemailer.createTransport({
      service: 'Gmail', 
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'mahi.sahai@aayaninfotech.com', 
      subject: 'New Damage Report',
      text: `A new damage report has been created. Damage ID: ${damage._id}`,
      attachments: [
        {
          filename: path.basename(pdfPath),
          path: pdfPath,
        },
      ],
    });

    // Clean up: delete the PDF after sending the email
    fs.unlink(pdfPath, (err) => {
      if (err) console.error('Error deleting PDF file:', err);
    });

  } catch (error) {
    console.error('Error sending damage report:', error);
    throw new Error('Failed to send damage report email'); // Throw error for further handling
  }
};



// Get all Damage Records
exports.getDamages = async (req, res) => {
  try {
    const damages = await Damage.find();
    res.json({
      success: true,
      message: 'Damages retrieved successfully',
      data: damages,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get Damage by ID
exports.getDamageById = async (req, res) => {
  try {
    const damage = await Damage.findById(req.params.id);
    if (!damage) {
      return res.status(404).json({
        success: false,
        message: "Damage record not found",
      });
    }
    res.json({
      success: true,
      message: 'Damage record retrieved successfully',
      data: damage,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Update Damage Record
exports.updateDamage = async (req, res) => {
  try {
    const updateData = {
      damage: req.body.damage,
      reason: req.body.reason,
    };

    if (req.files) {
      updateData.images = req.files.map(file => file.filename);
    }

    const updatedDamage = await Damage.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedDamage) {
      return res.status(404).json({
        success: false,
        message: "Damage record not found",
      });
    }

    res.json({
      success: true,
      message: 'Damage record updated successfully',
      data: updatedDamage,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// Delete Damage Record
exports.deleteDamage = async (req, res) => {
  try {
    const damage = await Damage.findById(req.params.id);
    if (!damage) {
      return res.status(404).json({
        success: false,
        message: "Damage record not found",
      });
    }
    await Damage.deleteOne({ _id: req.params.id });
    res.json({
      success: true,
      message: "Damage record deleted",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Process Refund
exports.processRefund = async (req, res) => {
  const { transactionId } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(transactionId);
    
    const chargeId = paymentIntent.latest_charge; 

    const refund = await stripe.refunds.create({
      charge: chargeId,
      amount: Math.floor(0.25 * paymentIntent.amount_received), 
    });


    res.status(200).json({
      message: 'Refund processed successfully',
      refund: refund,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to process refund',
      error: error.message,
    });
  }
};

