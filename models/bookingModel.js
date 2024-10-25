const mongoose = require('mongoose');

const DriverSchema = new mongoose.Schema({
    dname: {
        type: String,
        required: false,
    },
    dphone: {
        type: Number,
        required: false,
    },
    demail: {
        type: String,
        required: false
    },
    dlicense: {
        type: String,
        required: false,
    },
    dpolicy: {
        type: String,
        required: false,
    },
    dexperience: {
        type: Number,
        required: false,
    }
});

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
        required:false,
    },
    
    bname: {
        type: String,
        required: false,
    },
    bphone: {
        type: Number,
        required: false,
    },
    bemail: {
        type: String,
        required: false,
    },
    bsize: {
        type: Number,
        required: false,
    },
    baddress: {
        type: String,
        required: false,
    },
    baddressh: {
        type: String,
        required: false,
    },
    paymentId:{
        type: String,
        default:false
    },
    drivers: [DriverSchema]
});

module.exports = mongoose.model('Bookform', BookformSchema);
