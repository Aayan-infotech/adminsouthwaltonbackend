const mongoose = require('mongoose');

const damageSchema = new mongoose.Schema({

  bookingId: {
    type: String,
      
    required: false,
  },
 
  vnumber: {
    type: String,
    required: true,
  },
  damage: {
    type: Boolean, default : false },
 
  reason: {
    type: String,
    required: true,
  },

  transactionId: {
    type: String,
    required: true,
  },
 
  images: [{ type: String }],

  refunded: { type: Boolean, default: false }, 
  stripePaymentId: { type: String },

});

module.exports = mongoose.model('Damage', damageSchema);
