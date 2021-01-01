const PlaylistModel = require('../models/playlist')

const getPlaylistsHandler = function(req, res) {
    PlaylistModel.find({ owner: req.session.userId }, (err, playlists) => {
        if (err) {
            return res.status(500).json({ err: JSON.stringify(err) })
        }
        return res.status(200).json({ playlists })
    })
}

module.exports = {
    getPlaylistsHandler
}