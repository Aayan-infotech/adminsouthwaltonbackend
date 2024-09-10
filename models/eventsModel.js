const mongoose = require('mongoose');

const calSchema = new mongoose.Schema(
    {
        title: { type: String, required: false },
        deliveryDate: { type: Date, required: false },
        pickupDate: { type: Date, required: false },
        deliveryTime: { type: String, required: false },
        pickupTime: { type: String, required: false },
        userName: { type: String, required: false },
        email: { type: String, required: false },
        mobileNumber: { type: String, required: false },
        address: { type: String, required: false },
        driverName: { type: String, required: false },
        driverContact: { type: String, required: false }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Event', calSchema);
