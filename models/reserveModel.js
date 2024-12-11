const mongoose = require('mongoose');
const reserveSchema = mongoose.Schema(
    {
        pickup: {
            type: String,
            required: false
        },
        drop: {
            type: String,
            required: false
        },
        pickdate: {
            type: Date, 
            required: false
        },
        dropdate: {
            type: Date,  
            required: false
        },
        days: {
            type: String,
            required: false
        },
        vehicleId:{
            type:String,
            require:false
        },
        transactionid: {
            type: String,
            required: false
        },
        booking: {
            type: Boolean,
            required: false 
        },
        reservation: {
            type: Boolean,
            required: false  
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId, // Reference to User model
            ref: 'User',  // This will reference the User model
            required: false
        },
        accepted: {  
            type: Boolean,
            default: false
        }
    }
);

module.exports = mongoose.model('Reservation', reserveSchema);
