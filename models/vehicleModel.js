const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({

  vname: {
    type: String,
    required: true,
  },
  
  // vnumber: {
  //   type: String,
  //   required: true,
  // },
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
