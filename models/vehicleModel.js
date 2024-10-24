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
    offSeason: {
      fourPassenger: {
        oneDay: { type: Number, required: false },
        twoDays: { type: Number, required: false },
        threeDays: { type: Number, required: false },
        fourDays: { type: Number, required: false },
        fiveDays: { type: Number, required: false },
        sixDays: { type: Number, required: false },
        weeklyRental: { type: Number, required: false }
      },
      sixPassenger: {
        oneDay: { type: Number, required: false },
        twoDays: { type: Number, required: false },
        threeDays: { type: Number, required: false },
        fourDays: { type: Number, required: false },
        fiveDays: { type: Number, required: false },
        sixDays: { type: Number, required: false },
        weeklyRental: { type: Number, required: false }
      },
      eightPassenger: {
        oneDay: { type: Number, required: false },
        twoDays: { type: Number, required: false },
        threeDays: { type: Number, required: false },
        fourDays: { type: Number, required: false },
        fiveDays: { type: Number, required: false },
        sixDays: { type: Number, required: false },
        weeklyRental: { type: Number, required: false }
      },
    },
    secondarySeason: {
      fourPassenger: {
        oneDay: { type: Number, required: false },
        twoDays: { type: Number, required: false },
        threeDays: { type: Number, required: false },
        fourDays: { type: Number, required: false },
        fiveDays: { type: Number, required: false },
        sixDays: { type: Number, required: false },
        weeklyRental: { type: Number, required: false }
      },
      sixPassenger: {
        oneDay: { type: Number, required: false },
        twoDays: { type: Number, required: false },
        threeDays: { type: Number, required: false },
        fourDays: { type: Number, required: false },
        fiveDays: { type: Number, required: false },
        sixDays: { type: Number, required: false },
        weeklyRental: { type: Number, required: false }
      },
      eightPassenger: {
        oneDay: { type: Number, required: false },
        twoDays: { type: Number, required: false },
        threeDays: { type: Number, required: false },
        fourDays: { type: Number, required: false },
        fiveDays: { type: Number, required: false },
        sixDays: { type: Number, required: false },
        weeklyRental: { type: Number, required: false }
      },
    },
    peakSeason: {
      fourPassenger: {
        minimumRentalDays: { type: Number, required: false },
        threeDays: { type: Number, required: false },
        fourDays: { type: Number, required: false },
        fiveDays: { type: Number, required: false },
        sixDays: { type: Number, required: false },
        weeklyRental: { type: Number, required: false }
      },
      sixPassenger: {
        minimumRentalDays: { type: Number, required: false },
        threeDays: { type: Number, required: false },
        fourDays: { type: Number, required: false },
        fiveDays: { type: Number, required: false },
        sixDays: { type: Number, required: false },
        weeklyRental: { type: Number, required: false }
      },
      eightPassenger: {
        minimumRentalDays: { type: Number, required: false },
        threeDays: { type: Number, required: false },
        fourDays: { type: Number, required: false },
        fiveDays: { type: Number, required: false },
        sixDays: { type: Number, required: false },
        weeklyRental: { type: Number, required: false }
      },
    }
  },
  
 
  image: {
    type: String,
  },
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
