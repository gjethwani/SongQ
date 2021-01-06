const mongoose = require('mongoose')

const WSConnectionSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: [true, "userId required"]
    }
}, {
    timestamps: { 
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
})

module.exports = mongoose.model('WS-Connection', WSConnectionSchema)