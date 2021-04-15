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
    autoAccept: {
        type: Boolean,
        required: [true, "autoAccept required"]
    },
    profilePicture: {
        type: String
    },
    emailPreference: { // "none, unreadRequests, allRequests"
        type: String
    },
    shouldSendEmail: {
        type: Boolean
    },
    topTracks: {
        type: Array
    }
}, { 
    timestamps: { 
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
})

module.exports = mongoose.model('User', UserSchema)