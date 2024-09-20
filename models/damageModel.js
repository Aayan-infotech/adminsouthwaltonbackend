const mongoose = require('mongoose');

const damageSchema = new mongoose.Schema({

  bookingId: { type: String,required: false, },
  vnumber: { type: String, required: true, },
  damage: { type: String, default : false },
  transactionId: { type: String, required: true, },
   images: [{ type: String }],
 });

module.exports = mongoose.model('Damage', damageSchema);
