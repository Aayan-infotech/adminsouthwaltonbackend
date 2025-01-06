const express = require('express');
const router = express.Router();
const { handleRentalAgreement } = require('../controllers/agreementPdfController');

// POST route to handle the rental agreement
router.post('/send-rental-agreement', handleRentalAgreement);

module.exports = router;
