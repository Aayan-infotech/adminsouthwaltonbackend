// routes/BillingRoutes.js
const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');

router.get('/', billingController.getAllBillings);
router.post('/add', billingController.addBilling);
router.put('/:id', billingController.updateBilling);
router.delete('/:id', billingController.deleteBilling);
router.get('/download/:id', billingController.downloadBillingPDF);

module.exports = router;
