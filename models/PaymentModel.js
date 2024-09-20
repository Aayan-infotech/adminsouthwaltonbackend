const mongoose = require ('mongoose');
const paymentSchema=mongoose.Schema(
    {
        userId: { type: Number, required: false },
         amount: { type: Number, required: true },
        phone:{type:String,require:false },
        transactionId:{type:String,require:false },
        email:{type:String,require:false},
        vnumber: {type: String,required: false, },
          damage: {type: String, default : false },
          reason: {type: String,required: false, },
          images: [{ type: String }],
    }

)
module.exports = mongoose.model('Payment', paymentSchema);