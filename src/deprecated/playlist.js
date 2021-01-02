const mongoose = require('mongoose')

const PlaylistSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, "code is required"],

    },
    owner: {
        type: String,
        required: [true, "owner is required"],
    },
    activated: {
        type: Boolean,
        required: [true, "activated is required"]
    },
    playlistName: {
        type: String,
        require: [true, "playlistName is required"]
    }
}, { 
    timestamps: { 
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
})

module.exports = mongoose.model('Playlist', PlaylistSchema)