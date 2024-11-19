const mongoose = require("mongoose"); 
const { Types: { ObjectId } } = mongoose;
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require("../models/PaymentModel");
const Bookform = require('../models/checkoutModel');
const Vehicle = require('../models/vehicleModel');
const Damage = require("../models/damageModel");
const Reserve = require('../models/reserveModel');

// const upload = require("../middleware/upload")
const multer = require('multer');

// const nodemailer = require("nodemailer");
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
  const baseURL = `${req.protocol}://${req.get("host")}/uploads/`;

  // Map file names to an array of objects with a `url` key
  const images = req.files ? req.files.map(file => ({ url: baseURL + file.filename })) : [];

  try {
    const { paymentId, damage } = req.body;
    const objectIdPaymentId = new ObjectId(paymentId);

    // Fetch the payment record using paymentId
    const payment = await Payment.findById(objectIdPaymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: `No payment record found for the provided paymentId: ${paymentId}`,
      });
    }

    const { bookingId, transactionId } = payment;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: `Booking ID is undefined in payment record: ${paymentId}`,
      });
    }

    const bookingDetails = await Bookform.findById(bookingId);
    if (!bookingDetails) {
      return res.status(404).json({
        success: false,
        message: `No booking record found for the provided bookingId: ${bookingId}`,
      });
    }

    const vehicleId = bookingDetails.vehiclesId;
    const vehicleDetails = await Vehicle.findById(vehicleId);
    if (!vehicleDetails) {
      return res.status(404).json({
        success: false,
        message: `No vehicle record found for the provided vehiclesId: ${vehicleId}`,
      });
    }

    // Create a new Damage record with `images` as an array of objects
    const newDamage = new Damage({
      paymentId,
      transactionId,
      bookingId,
      damage,
      images,
    });

    const savedDamage = await newDamage.save();

    res.status(200).json({
      success: true,
      message: 'Damage record created successfully',
      data: {
        bookingId: savedDamage.bookingId,
        paymentId: savedDamage.paymentId,
        transactionId: savedDamage.transactionId,
        damage: savedDamage.damage,
        images: savedDamage.images,  // Now this should display each image URL under `url`
        bookingDetails: {
          bname: bookingDetails.bname,
          bphone: bookingDetails.bphone,
          bemail: bookingDetails.bemail,
          baddress: bookingDetails.baddress,
          baddressh: bookingDetails.baddressh,
        },
        vehicleDetails: {
          vname: vehicleDetails.vname,
          vseats: vehicleDetails.vseats,
          vprice: vehicleDetails.vprice,
        },
      },
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




exports.sendDamageReport = async (req, res) => {
  try {
    const { damageId } = req.body;

    // Find the damage record in the database
    const damage = await Damage.findById(damageId).lean();

    if (!damage) {
      return res.status(404).json({ success: false, message: 'Damage record not found' });
    }

    // Fetch related booking and vehicle details for the report
    const bookingDetails = await Bookform.findById(damage.bookingId);
    const vehicleDetails = bookingDetails ? await Vehicle.findById(bookingDetails.vehiclesId) : null;
    const paymentDetails = await Payment.findById(damage.paymentId);

    // Retrieve reservation details if it exists in the payment record
    const reservationDetails = paymentDetails && paymentDetails.reservation
      ? await Reserve.findById(paymentDetails.reservation)
      : null;

    // Create the PDF document
    const doc = new PDFDocument();
    const pdfPath = path.join(__dirname, 'damage-report.pdf');
    const writeStream = fs.createWriteStream(pdfPath);

    doc.pipe(writeStream);

    // Add content to the PDF
    doc.fontSize(16).text('Damage Report', { align: 'center' });
    doc.moveDown();

    // Damage Details
    doc.fontSize(12).text(`Damage ID: ${damage._id}`);
    doc.moveDown();

    // Payment Details
    doc.fontSize(14).text('Payment Details', { underline: true });
    doc.fontSize(12).text(`Payment ID: ${damage.paymentId || 'N/A'}`);
    doc.text(`Transaction ID: ${damage.transactionId || 'N/A'}`);
    doc.moveDown();

    // Booking Details
    doc.fontSize(14).text('Booking Details', { underline: true });
    doc.fontSize(12).text(`Customer Name: ${bookingDetails?.bname || 'N/A'}`);
    doc.text(`Phone: ${bookingDetails?.bphone || 'N/A'}`);
    doc.text(`Email: ${bookingDetails?.bemail || 'N/A'}`);
    doc.text(`Address: ${bookingDetails?.baddress || 'N/A'}, ${bookingDetails?.baddressh || 'N/A'}`);
    doc.moveDown();

    // Reservation Details
    doc.fontSize(14).text('Reservation Details', { underline: true });
    doc.fontSize(12).text(`Pickup Location: ${reservationDetails?.pickup || 'N/A'}`);
    doc.text(`Drop Location: ${reservationDetails?.drop || 'N/A'}`);
    doc.text(`Pickup Date: ${reservationDetails?.pickdate || 'N/A'}`);
    doc.text(`Drop Date: ${reservationDetails?.dropdate || 'N/A'}`);
    doc.moveDown();

    // Vehicle Details
    doc.fontSize(14).text('Vehicle Details', { underline: true });
    doc.fontSize(12).text(`Vehicle Name: ${vehicleDetails?.vname || 'N/A'}`);
    doc.text(`Seats: ${vehicleDetails?.vseats || 'N/A'}`);
    doc.text(`Price: ${vehicleDetails?.vprice || 'N/A'}`);
    doc.moveDown();

    doc.end();

    // Send the PDF
    writeStream.on('finish', () => {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=damage-report.pdf');
      const pdfFileStream = fs.createReadStream(pdfPath);
      pdfFileStream.pipe(res);

      pdfFileStream.on('end', () => {
        fs.unlinkSync(pdfPath);
      });
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


// Get all 
exports.getDamages = async (req, res) => {
  try {
    
    const damages = await Damage.find();

    // Populate booking, vehicle, and reservation details for each damage record
    const damageDetails = await Promise.all(
      damages.map(async (damage) => {
        const bookingDetails = await Bookform.findById(damage.bookingId);
        const vehicleDetails = bookingDetails ? await Vehicle.findById(bookingDetails.vehiclesId) : null;

        // Fetch payment details
        const paymentDetails = await Payment.findById(damage.paymentId);

        // Retrieve reservation details based on the string in `reservation` field of `Payment`
        const reservationDetails = paymentDetails && paymentDetails.reservation
          ? await Reserve.findOne({ _id: paymentDetails.reservation })
          : null;

        return {
          ...damage.toObject(),
          bookingDetails: bookingDetails
            ? {
                bname: bookingDetails.bname,
                bphone: bookingDetails.bphone,
                bemail: bookingDetails.bemail,
                baddress: bookingDetails.baddress,
                baddressh: bookingDetails.baddressh,
              }
            : null,
          vehicleDetails: vehicleDetails
            ? {
                vname: vehicleDetails.vname,
                vseats: vehicleDetails.vseats,
                vprice: vehicleDetails.vprice,
              }
            : null,
          reservationDetails: reservationDetails
            ? {
                pickup: reservationDetails.pickup,
                drop: reservationDetails.drop,
                pickdate: reservationDetails.pickdate,
                dropdate: reservationDetails.dropdate,
                days: reservationDetails.days,
                vehicleid: reservationDetails.vehicleid,
                transactionid: reservationDetails.transactionid,
                booking: reservationDetails.booking,
                reservation: reservationDetails.reservation,
                userId: reservationDetails.userId,
                accepted: reservationDetails.accepted,
              }
            : null,
        };
      })
    );

    res.json({
      success: true,
      message: 'Damages retrieved successfully',
      data: damageDetails,
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
    // Fetch the damage record by ID
    const damage = await Damage.findById(req.params.id);

    if (!damage) {
      return res.status(404).json({
        success: false,
        message: "Damage record not found",
      });
    }

    
    const bookingDetails = await Bookform.findById(damage.bookingId);
    const vehicleDetails = bookingDetails ? await Vehicle.findById(bookingDetails.vehiclesId) : null;

    // Fetch payment details to retrieve reservation string
    const paymentDetails = await Payment.findById(damage.paymentId);

    const reservationDetails = paymentDetails && paymentDetails.reservation
      ? await Reserve.findOne({ _id: paymentDetails.reservation })
      : null;

    res.json({
      success: true,
      message: 'Damage record retrieved successfully',
      data: {
        ...damage.toObject(),
        bookingDetails: bookingDetails ? {
          bname: bookingDetails.bname,
          bphone: bookingDetails.bphone,
          bemail: bookingDetails.bemail,
          baddress: bookingDetails.baddress,
          baddressh: bookingDetails.baddressh,
        } : null,
        vehicleDetails: vehicleDetails ? {
          vname: vehicleDetails.vname,
          vseats: vehicleDetails.vseats,
          vprice: vehicleDetails.vprice,
        } : null,
        reservationDetails: reservationDetails ? {
          pickup: reservationDetails.pickup,
          drop: reservationDetails.drop,
          pickdate: reservationDetails.pickdate,
          dropdate: reservationDetails.dropdate,
          days: reservationDetails.days,
          vehicleid: reservationDetails.vehicleid,
          transactionid: reservationDetails.transactionid,
          booking: reservationDetails.booking,
          reservation: reservationDetails.reservation,
          userId: reservationDetails.userId,
          accepted: reservationDetails.accepted,
        } : null,
      },
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
  const { paymentId } = req.body;  // Expecting paymentId in the request body

  try {
    // Step 1: Retrieve the payment record from the database using paymentId
    const payment = await Payment.findOne({ _id: new mongoose.Types.ObjectId(paymentId) });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: `No payment record found for the provided paymentId: ${paymentId}`,
      });
    }

    // Step 2: Retrieve the transactionId from the payment record
    const transactionId = payment.transactionId;

    // Step 3: Fetch the paymentIntent details from Stripe using the transactionId
    const paymentIntent = await stripe.paymentIntents.retrieve(transactionId);

    if (!paymentIntent || !paymentIntent.latest_charge) {
      return res.status(404).json({
        success: false,
        message: 'No charge found for the paymentIntent',
      });
    }

    const chargeId = paymentIntent.latest_charge;  // Fetch chargeId from paymentIntent

    // Step 4: Process a partial refund (25% in this case)
    const refund = await stripe.refunds.create({
      charge: chargeId,
      amount: Math.floor(0.25 * paymentIntent.amount_received),  // 25% refund
    });

    // Step 5: Respond with success message
    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      refund: refund,
    });
  } catch (error) {
    // Handle errors
    res.status(500).json({
      success: false,
      message: 'Failed to process refund',
      error: error.message,
    });
  }
};


