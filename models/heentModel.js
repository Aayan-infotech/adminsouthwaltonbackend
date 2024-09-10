const mongoose = require('mongoose');

const heentSchema = new mongoose.Schema(
    {
        deniesProblems: { type: Boolean, required: false },
        eyes: {
            impairedVision: { type: Boolean, default: false },
            retinopathy: { type: Boolean, default: false },
            cataracts: { type: Boolean, default: false },
            blind: { type: [String], enum: ['None', 'R', 'L'], default: [] } 
        },
        nose: {
            discharge: { type: Boolean, default: false },
            bleeding: { type: Boolean, default: false },
            congested: { type: Boolean, default: false }
        },
        oral: {
            sores: { type: Boolean, default: false },
            gingivitis: { type: Boolean, default: false },
            stomatitis: { type: Boolean, default: false }
        },
        throat: {
            hoarse: { type: Boolean, default: false },
            dysphasia: { type: Boolean, default: false }
        },
        ears: {
            tinnitus: { type: Boolean, default: false },
            pain: { type: Boolean, default: false },
            hoh: { type: Boolean, default: false } // HOH: Hard of Hearing
        },
        comments: { type: String, default: '' }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Heent', heentSchema);