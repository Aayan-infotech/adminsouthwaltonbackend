const express = require('express');
const router = express.Router();

const { PaymentInfo,getAllPayments , getPaymentIntent,  deletePayment } = require('../controllers/PaymentController');

router.post('/register',PaymentInfo);
// router.get('/pay', getAllPayments); 
router.get('/stripe/payments', getAllPayments);

router.get('/:transactionId', getPaymentIntent);

router.delete('/:id', deletePayment);

module.exports = router;