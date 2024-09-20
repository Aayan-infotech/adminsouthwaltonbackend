const Payment = require("../models/PaymentModel")
const Damage = require("../models/damageModel");



const multer = require("multer");
const path = require("path");

const stripe = require('../stripe');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });


// Create
exports.createDamage = async (req, res) => {

  const images = req.files ? req.files.map(file => file.filename) : [];
  
    try {
      const { transactionId, vnumber, damage, reason, images } = req.body;
      
      // Create a new Damage instance
      const newDamage = new Damage({
        transactionId,
        vnumber,
        damage,
        reason,
        images
      });
  
      // Save to the database
      await newDamage.save();
      
      // Send response
      res.status(201).json({ message: 'Damage record created successfully', data: newDamage });
    } catch (error) {
      console.error('Error creating damage record:', error);
      res.status(500).json({ message: 'Failed to create damage record' });
    }
  };




// Get all
exports.getDamages = async (req, res) => {
  try {
    let damages = await Damage.find();
    res.json(damages);
  } catch (err) {
    console.log(err); // Add this line to see error details
    res.status(500).json({ message: err.message });
  }
};

// Get by ID
exports.getDamageById = async (req, res) => {
  try {
    const damage = await Damage.findById(req.params.id);
    if (!damage) {
      return res.status(404).json({ message: "Damage record not found" });
    }
    res.json(damage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update
exports.updateDamage = async (req, res) => {
  try {
    const updateData = {
      vname: req.body.vname,
      vnumber: req.body.vnumber,
      damage: req.body.damage,
      username: req.body.username,
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
      return res.status(404).json({ message: "Damage record not found" });
    }

    res.json(updatedDamage);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete
exports.deleteDamage = async (req, res) => {
  try {
    const damage = await Damage.findById(req.params.id);
    if (!damage) {
      return res.status(404).json({ message: "Damage record not found" });
    }
    await Damage.deleteOne({ _id: req.params.id });
    res.json({ message: "Damage record deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


//refund
exports.processRefund = async (req, res) => {
  try {
    const damageId = req.params.id; // Get damage ID from URL parameters
    const { transactionId } = req.body; // Get transaction ID from request body

    // Find the damage report by ID
    const damage = await Damage.findById(damageId);
    if (!damage) {
      return res.status(404).json({ message: 'Damage report not found' });
    }

    if (damage.refunded) {
      return res.status(400).json({ message: 'Refund has already been processed for this damage report' });
    }

    // Fetch the payment details from the Payment model using transactionId
    const payment = await Payment.findOne({ transactionId });
    if (!payment) {
      return res.status(404).json({ message: 'Payment details not found' });
    }

    // Retrieve the original payment details via Stripe using transactionId
    const paymentIntent = await stripe.paymentIntents.retrieve(transactionId);

    // Calculate 25% of the original amount (ensure amount is in smallest currency unit)
    const refundAmount = Math.floor(paymentIntent.amount * 0.25); // e.g., cents

    // Process the 25% refund via Stripe
    const refund = await stripe.refunds.create({
      payment_intent: transactionId,
      amount: refundAmount, // Refund 25%
    });

    // Update the damage report to mark it as refunded
    damage.refunded = true;
    await damage.save();

    res.status(200).json({ message: '25% refund processed successfully', refund, damage });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({ message: 'Error processing refund', error: error.message });
  }
};





