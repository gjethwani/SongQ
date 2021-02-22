const mongoose = require('mongoose')

const FeedbackSchema = new mongoose.Schema({
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