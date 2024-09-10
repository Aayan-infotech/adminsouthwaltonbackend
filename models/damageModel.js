const mongoose = require('mongoose');

const damgeSchema = new mongoose.Schema({

  vname: {
    type: String,
    required: true,
  },
 
  vnumber: {
    type: String,
    required: true,
  },
  damage: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
 
  image: {
    type: String,
  },
});

module.exports = mongoose.model('Damage', damgeSchema);
