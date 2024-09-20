const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({

  vname: {
    type: String,
    required: true,
  },
  
  damagePrice: {
    type: String,
    required: false,
  },
  vseats: {
    type: String,
    required: true,
  },
  vprice: {
    type: String,
    required: true,
  },
 
  image: {
    type: String,
  },
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
