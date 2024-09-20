const express = require('express');
const router = express.Router();

const { PaymentInfo,getAllPayments , getAllPays, getPaymentIntent,  deletePayment } = require('../controllers/PaymentController');

router.post('/register',PaymentInfo);
 
router.get('/stripe/payments', getAllPayments);
router.get('/pays', getAllPays);

router.get('/:transactionId', getPaymentIntent);

router.delete('/:id', deletePayment);

module.exports = router;