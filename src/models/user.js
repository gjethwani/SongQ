const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    userId: {
        type: String
    },
    email: {
        type: String,
    },
}, { 
    timestamps: { 
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
})

module.exports = mongoose.model('User', UserSchema)