const mongoose = require('mongoose');

const BookformSchema = new mongoose.Schema({
    bpickup:{
        type:String,
        required:false,
    },
    bdrop:{
        type:String,
        required:false,
    },
    bpickDate:{
        type:Date,
        required:false,
    },
    bdropDate:{
        type:Date,
        required:true,
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

    payementID: {
        type: String,
        required: false,
    },

    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', default: null },
    
    
   
});

module.exports = mongoose.model('Bookform', BookformSchema);
