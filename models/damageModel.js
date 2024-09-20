const mongoose = require('mongoose');

const damageSchema = new mongoose.Schema({

  bookingId: { type: String,required: false, },
  transactionId: { type: String, required: true, },
  damage: { type: String, default : false },
   images: [{ type: String }],
 });

module.exports = mongoose.model('Damage', damageSchema);
