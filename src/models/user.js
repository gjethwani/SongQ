const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: [true, "userId required"]
    },
    name: {
        type: String
    },
    email: {
        type: String
    },
    queueActivated: {
        type: Boolean,
        required: [true, "queueActivated required"]
    },
    code: {
        type: String
    },
    autoAccept: {
        type: Boolean,
        required: [true, "autoAccept required"]
    },
    profilePicture: {
        type: String
    }
}, { 
    timestamps: { 
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
})

module.exports = mongoose.model('User', UserSchema)