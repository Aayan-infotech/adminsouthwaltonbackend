const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({

  vname: { type: String, required: true,},
  damagePrice: { type: String,required: false,},
  passenger: { type: String, enum: ['fourPassenger', 'sixPassenger', 'eightPassenger'], required: true, },
  vprice: [{
   
      offseason: {
        oneDay: { type: Number },
        twoDay: { type: Number },
        threeDay: { type: Number },
        fourDay: { type: Number },
        fiveDay: { type: Number },
        sixDay: { type: Number },
        weeklyRental: { type: Number }
      },
      secondaryseason: {
        oneDay: { type: Number },
        twoDay: { type: Number },
        threeDay: { type: Number },
        fourDay: { type: Number },
        fiveDay: { type: Number },
        sixDay: { type: Number },
        weeklyRental: { type: Number }
      },
      peakseason: {
        oneDay: { type: Number },
        twoDay: { type: Number },
        threeDay: { type: Number },
        fourDay: { type: Number },
        fiveDay: { type: Number },
        sixDay: { type: Number },
        weeklyRental: { type: Number }
      
    }
  }],
   image: { type: [String] },
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
