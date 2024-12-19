
const mongoose = require('mongoose');

const signSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    image: { type: String, required: false }, 
    pdf:{type :String,required: false}
});

module.exports = mongoose.model('Sign', signSchema);
