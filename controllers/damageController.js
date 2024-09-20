const Payment = require("../models/PaymentModel");
const Damage = require("../models/damageModel");
const multer = require("multer");
const path = require("path");

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

    // Fetch the payment record for the provided bookingId
    const payment = await Payment.findOne({ bookingId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'No payment record found for the provided bookingId',
      });
    }

    // Create a new Damage instance
    const newDamage = new Damage({
      bookingId,
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
  try {
    const damageId = req.params.id;
    const damage = await Damage.findById(damageId);
    if (!damage) {
      return res.status(404).json({
        success: false,
        message: 'Damage report not found',
      });
    }

    if (damage.refunded) {
      return res.status(400).json({
        success: false,
        message: 'Refund has already been processed for this damage report',
      });
    }

    // Fetch the payment details using the transactionId from the damage record
    const payment = await Payment.findOne({ transactionId: damage.transactionId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment details not found',
      });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(damage.transactionId);
    const refundAmount = Math.floor(paymentIntent.amount * 0.25);

    const refund = await stripe.refunds.create({
      payment_intent: damage.transactionId,
      amount: refundAmount,
    });

    damage.refunded = true;
    await damage.save();

    res.status(200).json({
      success: true,
      message: '25% refund processed successfully',
      refund,
      damage,
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing refund',
      error: error.message,
    });
  }
};
