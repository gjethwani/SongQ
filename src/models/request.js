const mongoose = require('mongoose')

const RequestSchema = new mongoose.Schema({
    playlistId: {
        type: String,
        required: [true, "playlist is required"],

    },
    songId: {
        type: String
    },
    songName: {
        type: String
    },
    artists: {
        type: String
    },
    album: {
        type: String
    },
    albumArt: {
        type: String
    },
    serviced: {
        type: Boolean,
        required: [true, "serviced is required"]
    },
    accepted: {
        type: Boolean
    }
}, { 
    timestamps: { 
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
})

module.exports = mongoose.model('Request', RequestSchema)