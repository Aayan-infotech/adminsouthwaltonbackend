const mongoose = require('mongoose');

const damageSchema = new mongoose.Schema({

  bookingId: { type: String,required: false, },
  transactionId: { type: String, required: true, },
  damage: { type: String, default : false },
   images: [{ type: String }],
   approvedByAdmin: {
    type: String,
    default: false,
    required: false
   }
 });

module.exports = mongoose.model('Damage', damageSchema);
