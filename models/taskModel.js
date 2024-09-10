const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({

  driverName: {
    type: String,
    required: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  pickupAddress: {
    type: String,
    required: true,
  },
  deliveryAddress: {
    type: String,
    required: true,
  },
  pickupDate: {
    type: String,
    required: true,
  },
 
  deliveryDate: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Task', taskSchema);
