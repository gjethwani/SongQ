const mongoose = require('mongoose')

const FeedbackSchema = new mongoose.Schema({
    userId: {
        type: String
    },
    rating: {
        type: Number
    },
    feedback: {
        type: String
    }
}, { 
    timestamps: { 
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
})

module.exports = mongoose.model('Feedback', FeedbackSchema)