const mongoose = require('mongoose');

const painSchema = new mongoose.Schema(
    {
        deniesProblem: { type: Boolean, required: true },
        intensity: { 
            type: String, 
            enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 
            validate: {
                validator: function(value) {
                    return !this.deniesProblem || value == null;
                },
                message: 'Intensity should be empty if deniesProblem is true'
            } 
        },
        location: { 
            type: String, 
            validate: {
                validator: function(value) {
                    return !this.deniesProblem || value == null;
                },
                message: 'Location should be empty if deniesProblem is true'
            } 
        },
        duration: { 
            type: String, 
            validate: {
                validator: function(value) {
                    return !this.deniesProblem || value == null;
                },
                message: 'Duration should be empty if deniesProblem is true'
            } 
        },
        controlled: { 
            type: Boolean, 
            validate: {
                validator: function(value) {
                    return !this.deniesProblem || value == null;
                },
                message: 'Controlled should be empty if deniesProblem is true'
            } 
        },
        controlledBy: { 
            type: String, 
            validate: {
                validator: function(value) {
                    return !this.deniesProblem || value == null;
                },
                message: 'ControlledBy should be empty if deniesProblem is true'
            } 
        },
        comments: { 
            type: String, 
            validate: {
                validator: function(value) {
                    return !this.deniesProblem || value == null;
                },
                message: 'Comments should be empty if deniesProblem is true'
            } 
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Pain', painSchema);
