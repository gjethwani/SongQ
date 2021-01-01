const RequestModel = require('../models/request')
const PlaylistModel = require('../models/playlist')

const getRequestsHandler = function(req, res) {
    const { playlistId } = req.query
    PlaylistModel.findById(playlistId, (err, playlist) => {
        if (err) {
            return res.status(500).json({ err: JSON.stringify(err) })
        }
        if (!playlist) {
            return res.status(404).send()
        }
        if (playlist.owner !== req.session.userId) {
            return res.status(401).send()
        }
        RequestModel.find({ playlistId }, (err, requests) => {
            if (err) {
                return res.status(500).json({ err: JSON.stringify(err) })
            }
            return res.status(200).json({ requests })
        })
    })
}

module.exports = {
    getRequestsHandler
}