const Sign = require('../models/signModel');
const user=require('../models/userModel')
const fs = require('fs');
const path = require('path');

// Save signature
exports.saveSignature = async (req, res) => {
    try {
        const { userId, signatureData } = req.body;

        // Create a new signature document
        const newSignature = new Sign({
            userId,
            signatureData,
        });

        // Save the signature to the database
        const savedSignature = await newSignature.save();
        res.status(201).json(savedSignature);
    } catch (error) {
        res.status(500).json({ message: 'Failed to save signature', error });
    }
};

// Get signature by ID
exports.getSignature = async (req, res) => {
    try {
        const { userId } = req.params;
        const signature = await Sign.findOne({ userId });
      
        if (!signature) {
            return res.status(404).json({ message: 'Signature not found' });
        }

        res.status(200).json(signature);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve signature', error });
    }
};

// Get all signatures
exports.getAllSignatures = async (req, res) => {
    try {
        const signatures = await Sign.find(); // Retrieve all signature documents from the database
        const userIds = [...new Set(signatures.map(e => e.userId))];
        const [users] = await Promise.all([
          user.find({ _id: { $in: userIds } }).select('fullName').lean(),
      ]);

      const userMap = users.reduce((acc, user) => {
        acc[user._id] = user.fullName;
        return acc;
    }, {});  

    const detailedOrders = signatures.map(e => ({
      signatureData: e.signatureData,
      name: userMap[e.userId] || 'Unknown User', // Add a fallback for missing userId
    }));

        res.status(200).json(detailedOrders);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve signatures', error });
    }
};

//delete
exports.deleteSignature = async (req, res) => {
  try {
      const { userId } = req.params;
      const deletedSignature = await Sign.findOneAndDelete({ userId });

      if (!deletedSignature) {
          return res.status(404).json({ message: 'Signature not found' });
      }

      res.status(200).json({ message: 'Signature deleted successfully' });
  } catch (error) {
      res.status(500).json({ message: 'Failed to delete signature', error });
  }
};


exports.getSignatureImage = async (req, res) => {
  try {
      const { userId } = req.params;
      const signature = await Sign.findOne({ userId });

      if (!signature) {
          return res.status(404).json({ message: 'Signature not found' });
      }

      // Extract the Base64 string (removing the prefix if it exists)
      const base64Data = signature.signatureData.replace(/^data:image\/png;base64,/, '');

      // Convert Base64 string to buffer
      const imgBuffer = Buffer.from(base64Data, 'base64');

      // Set the content type and send the image as a response
      res.setHeader('Content-Type', 'image/png');
      res.send(imgBuffer);
  } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve signature image', error });
  }
};