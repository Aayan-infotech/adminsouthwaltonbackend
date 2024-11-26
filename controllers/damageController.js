const mongoose = require("mongoose"); 
const { Types: { ObjectId } } = mongoose;
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require("../models/PaymentModel");
const Bookform = require('../models/checkoutModel');
const Vehicle = require('../models/vehicleModel');
const Damage = require("../models/damageModel");
const Reserve = require('../models/reserveModel');
const multer = require('multer');
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

    const {amount,  reservation } = payment;
    if (!reservation) {
      return res.status(400).json({
        success: false,
        message: `Reservation is undefined in payment record: ${paymentId}`,
      });
    }

    // Fetch the Reservation details to get vehicleId
    const reservationDetails = await Reserve.findById(reservation);
    if (!reservationDetails) {
      return res.status(404).json({
        success: false,
        message: `No reservation record found for the provided Reservation ID: ${reservation}`,
      });
    }

    const vehicleId = reservationDetails.vehicleId;
    if (!vehicleId) {
      return res.status(404).json({
        success: false,
        message: `Vehicle ID not found in Reservation: ${reservation}`,
      });
    }

    // Fetch vehicle details using vehicleId
    const vehicleDetails = await Vehicle.findById(vehicleId);
    if (!vehicleDetails) {
      return res.status(404).json({
        success: false,
        message: `No vehicle record found for the provided vehicleId: ${vehicleId}`,
      });
    }

    
    const newDamage = new Damage({
      paymentId,
      transactionId,
      bookingId,
      damage,
      images,
    });

    const savedDamage = await newDamage.save();

    res.status(201).json({
      success: true,
      message: 'Damage record created successfully',
      data: {
        damageId: savedDamage._id,
        bookingId: savedDamage.bookingId,
        paymentId: savedDamage.paymentId,
        amount,
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
        reservationDetails: {
          vehicleId: reservationDetails.vehicleId,
          reserveDate: reservationDetails.reserveDate,
        },
        vehicleDetails: {
          vname: vehicleDetails.vname,
          vseats: vehicleDetails.vseats,
          // vprice: vehicleDetails.vprice,
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

// exports.sendDamageReport = async (req, res) => {
//   try {
//     const { damageId } = req.body;

//     // Find the damage record in the database
//     const damage = await Damage.findById(damageId).lean(); // Use lean to get a plain JS object
//     if (!damage) {
//       return res.status(404).json({ success: false, message: 'Damage record not found' });
//     }

//     // Fetch related booking details
//     const bookingDetails = await Bookform.findById(damage.bookingId);
//     if (!bookingDetails) {
//       return res.status(404).json({ success: false, message: 'Booking details not found' });
//     }

//     // Fetch the reservation to get vehicle details
//     const paymentDetails = await Payment.findById(damage.paymentId);
//     if (!paymentDetails || !paymentDetails.reservation) {
//       return res.status(404).json({
//         success: false,
//         message: 'Reservation details not found for the associated payment',
//       });
//     }

//     const reservationDetails = await Reserve.findById(paymentDetails.reservation);
//     if (!reservationDetails || !reservationDetails.vehicleId) {
//       return res.status(404).json({
//         success: false,
//         message: 'Vehicle details not found for the associated reservation',
//       });
//     }

//     const vehicleDetails = await Vehicle.findById(reservationDetails.vehicleId);
//     if (!vehicleDetails) {
//       return res.status(404).json({ success: false, message: 'Vehicle record not found' });
//     }

//     // Create the PDF document
//     const doc = new PDFDocument();

//     // Temporary path to store the generated PDF
//     const pdfPath = path.join(__dirname, 'damage-report.pdf');
//     const writeStream = fs.createWriteStream(pdfPath);

//     doc.pipe(writeStream);

//     // Add content to the PDF (customize as per your needs)
//     doc.fontSize(16).text('Damage Report', { align: 'center' });
//     doc.moveDown();

//     // Add Damage Record Details
//     doc.fontSize(12).text(`Damage ID: ${damage._id}`);
//     doc.text(`Description: ${damage.damage}`);
//     doc.text(`Transaction ID: ${damage.transactionId}`);
//     doc.moveDown();

//     // Add Payment Details
//     doc.fontSize(14).text('Payment Details', { underline: true });
//     doc.fontSize(12).text(`Payment ID: ${damage.paymentId}`);
//     doc.text(`Transaction ID: ${paymentDetails.transactionId}`);
//     doc.text(`Amount Paid: ${paymentDetails.amount}`);
//     doc.moveDown();

//     // Add Booking Details
//     doc.fontSize(14).text('Booking Details', { underline: true });
//     doc.fontSize(12).text(`Customer Name: ${bookingDetails.bname}`);
//     doc.text(`Phone: ${bookingDetails.bphone}`);
//     doc.text(`Email: ${bookingDetails.bemail}`);
//     doc.text(`Pickup Location: ${bookingDetails.bpickup}`);
//     doc.text(`Drop Location: ${bookingDetails.bdrop}`);
//     doc.text(`Pickup Date: ${bookingDetails.bpickDate}`);
//     doc.text(`Drop Date: ${bookingDetails.bdropDate}`);
//     doc.moveDown();

//     // Add Vehicle Details
//     doc.fontSize(14).text('Vehicle Details', { underline: true });
//     doc.fontSize(12).text(`Vehicle Name: ${vehicleDetails.vname}`);
//     doc.text(`Seats: ${vehicleDetails.passenger}`);
//     doc.text(`Vehicle ID: ${vehicleDetails._id}`);
//     doc.moveDown();
//     doc.end();

//     writeStream.on('finish', () => {
//       res.setHeader('Content-Type', 'application/pdf');
//       res.setHeader('Content-Disposition', 'attachment; filename=damage-report.pdf');
//       const pdfFileStream = fs.createReadStream(pdfPath);
//       pdfFileStream.pipe(res);

//       // Optionally, delete the PDF after sending to save space
//       pdfFileStream.on('end', () => {
//         fs.unlinkSync(pdfPath);
//       });
//     });

//   } catch (error) {
//     console.error('Error generating damage report:', error);
//     res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };


exports.sendDamageReport = async (req, res) => {
  try {
    if (req.method === 'GET') {
      // Handle GET request
      const { damageId } = req.query; // Assuming `damageId` is sent as a query parameter

      // Find the damage record in the database
      const damage = await Damage.findById(damageId).lean(); // Use lean to get a plain JS object
      if (!damage) {
        return res.status(404).json({ success: false, message: 'Damage record not found' });
      }

      return res.status(200).json({ success: true, data: damage });
    } else if (req.method === 'POST') {
      // Handle POST request
      const { damageId } = req.body;

      // Find the damage record in the database
      const damage = await Damage.findById(damageId).lean(); // Use lean to get a plain JS object
      if (!damage) {
        return res.status(404).json({ success: false, message: 'Damage record not found' });
      }

      // Fetch related booking details
      const bookingDetails = await Bookform.findById(damage.bookingId);
      if (!bookingDetails) {
        return res.status(404).json({ success: false, message: 'Booking details not found' });
      }

      // Fetch the reservation to get vehicle details
      const paymentDetails = await Payment.findById(damage.paymentId);
      if (!paymentDetails || !paymentDetails.reservation) {
        return res.status(404).json({
          success: false,
          message: 'Reservation details not found for the associated payment',
        });
      }

      const reservationDetails = await Reserve.findById(paymentDetails.reservation);
      if (!reservationDetails || !reservationDetails.vehicleId) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle details not found for the associated reservation',
        });
      }

      const vehicleDetails = await Vehicle.findById(reservationDetails.vehicleId);
      if (!vehicleDetails) {
        return res.status(404).json({ success: false, message: 'Vehicle record not found' });
      }

      // Create the PDF document
      const doc = new PDFDocument();

      // Temporary path to store the generated PDF
      const pdfPath = path.join(__dirname, 'damage-report.pdf');
      const writeStream = fs.createWriteStream(pdfPath);

      doc.pipe(writeStream);

      // Add content to the PDF (customize as per your needs)
      doc.fontSize(16).text('Damage Report', { align: 'center' });
      doc.moveDown();

      // Add Damage Record Details
      doc.fontSize(12).text(`Damage ID: ${damage._id}`);
      doc.text(`Description: ${damage.damage}`);
      doc.text(`Transaction ID: ${damage.transactionId}`);
      doc.moveDown();

      // Add Payment Details
      doc.fontSize(14).text('Payment Details', { underline: true });
      doc.fontSize(12).text(`Payment ID: ${damage.paymentId}`);
      doc.text(`Transaction ID: ${paymentDetails.transactionId}`);
      doc.text(`Amount Paid: ${paymentDetails.amount}`);
      doc.moveDown();

      // Add Booking Details
      doc.fontSize(14).text('Booking Details', { underline: true });
      doc.fontSize(12).text(`Customer Name: ${bookingDetails.bname}`);
      doc.text(`Phone: ${bookingDetails.bphone}`);
      doc.text(`Email: ${bookingDetails.bemail}`);
      doc.text(`Pickup Location: ${bookingDetails.bpickup}`);
      doc.text(`Drop Location: ${bookingDetails.bdrop}`);
      doc.text(`Pickup Date: ${bookingDetails.bpickDate}`);
      doc.text(`Drop Date: ${bookingDetails.bdropDate}`);
      doc.moveDown();

      // Add Vehicle Details
      doc.fontSize(14).text('Vehicle Details', { underline: true });
      doc.fontSize(12).text(`Vehicle Name: ${vehicleDetails.vname}`);
      doc.text(`Seats: ${vehicleDetails.passenger}`);
      doc.text(`Vehicle ID: ${vehicleDetails._id}`);
      doc.moveDown();
      doc.end();

      writeStream.on('finish', () => {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=damage-report.pdf');
        const pdfFileStream = fs.createReadStream(pdfPath);
        pdfFileStream.pipe(res);

        // Optionally, delete the PDF after sending to save space
        pdfFileStream.on('end', () => {
          fs.unlinkSync(pdfPath);
        });
      });
    } else {
      return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


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


