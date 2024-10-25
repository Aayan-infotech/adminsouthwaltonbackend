
const mongoose = require('mongoose');

const signSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    signatureData: { type: String, required: true }, // Stores the signature as a base64 encoded string
   
});

module.exports = mongoose.model('Sign', signSchema);
