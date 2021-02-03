const mongoose = require('mongoose')

const SubscriberSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "email is required"],

    }
}, { 
    timestamps: { 
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
})

module.exports = mongoose.model('Subscriber', SubscriberSchema)