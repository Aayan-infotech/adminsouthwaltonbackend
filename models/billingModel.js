// models/BillingModel.js
const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema({
  userID: {
    type: String,
    required: true,
  },
  paymentStatus: { enum:['Success','Pending'],
    type: String,
    required: true 
 },
});

module.exports = mongoose.model('Billing', billingSchema);
