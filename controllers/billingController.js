// controllers/BillingController.js
const Billing = require('../models/billingModel');
const PDFDocument = require('pdfkit');

// Fetch all billing records
exports.getAllBillings = async (req, res) => {
  try {
    const billings = await Billing.find();
    res.status(200).json(billings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching billings', error });
  }
};

// Add a new billing record
exports.addBilling = async (req, res) => {
  try {
    const { userID, paymentStatus } = req.body;
    const newBilling = new Billing({ userID, paymentStatus });
    await newBilling.save();
    res.status(201).json(newBilling);
  } catch (error) {
    res.status(500).json({ message: 'Error adding billing', error });
  }
};

// Update a billing record
exports.updateBilling = async (req, res) => {
  try {
    const { userID, paymentStatus } = req.body;
    const updatedBilling = await Billing.findByIdAndUpdate(
      req.params.id,
      { userID, paymentStatus },
      { new: true }
    );
    res.status(200).json(updatedBilling);
  } catch (error) {
    res.status(500).json({ message: 'Error updating billing', error });
  }
};

// Delete a billing record
exports.deleteBilling = async (req, res) => {
  try {
    await Billing.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Billing deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting billing', error });
  }
};

exports.downloadBillingPDF = async (req, res) => {
  try {
      const billing = await Billing.findById(req.params.id);
      if (!billing) {
          return res.status(404).json({ message: 'Billing record not found' });
      }

      const doc = new PDFDocument();
      let buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
          let pdfData = Buffer.concat(buffers);
          res
              .writeHead(200, {
                  'Content-Length': Buffer.byteLength(pdfData),
                  'Content-Type': 'application/pdf',
                  'Content-Disposition': 'attachment;filename=billing.pdf',
              })
              .end(pdfData);
      });

      // Add content to the PDF
      doc.fontSize(20).text('Billing Details', { align: 'center' });
      doc.fontSize(14).text(`User ID: ${billing.userID}`);
      doc.fontSize(14).text(`Payment Status: ${billing.paymentStatus}`);
      doc.end();
  } catch (error) {
      res.status(500).json({ message: 'Error generating PDF', error });
  }
};
