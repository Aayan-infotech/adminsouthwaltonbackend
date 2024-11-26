// routes/damageRoute.js
const express = require('express');
const router = express.Router();
const damageController = require('../controllers/damageController');
const multer = require('multer');
const path = require('path');

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory to save uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Filename with timestamp
  },
});

// Create the upload middleware
const upload = multer({ storage: storage });

// Define uploadMultiple for handling multiple files (up to 10 in this case)
const uploadMultiple = upload.array('images', 10); // Adjust the field name as needed

// Define routes
router.get('/', damageController.getDamages);
router.get('/:id', damageController.getDamageById); 
router.post('/add', uploadMultiple, damageController.createDamage); 
router.put('/:id', uploadMultiple, damageController.updateDamage); 
router.delete('/:id', damageController.deleteDamage);
router.post('/refund/:id', damageController.processRefund);
router.post('/send-damage-report', damageController.sendDamageReport);
router.get('/getpdf/send-damage-report', damageController.sendDamageReport);
module.exports = router;
