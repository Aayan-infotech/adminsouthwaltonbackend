const mongoose = require('mongoose');

const BookformSchema = new mongoose.Schema({
    bpickup: {
        type: String,
        required: false,
    },
    bdrop: {
        type: String,
        required: false,
    },
    bpickDate: {
        type: Date,
        required: false,
    },
    bdropDate: {
        type: Date,
        required: true,
    },

    bname: {
        type: String,
        required: true,
    },
    bphone: {
        type: Number,
        required: true,
    },
    bemail: {
        type: String,
        required: true,
    },
    bsize: {
        type: Number,
        required: true,
    },
    baddress: {
        type: String,
        required: false,
    },
    baddressh: {
        type: String,
        required: false,
    },

    paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment',  // Assuming your Payment model is named 'Payment'
        required: false,
      },
      
      vehiclesId:{
        type:String,
        require:false
    },
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        default: null
    },
    status: {
        type: String,
        enum: ['PENDING', 'ACCEPTED', 'DELIVERED', 'COMPLETED'],
        default: 'PENDING'
    }



},{ timestamps: true });

module.exports = mongoose.model('Bookform', BookformSchema);
