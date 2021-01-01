const RequestModel = require('../models/request')
const PlaylistModel = require('../models/playlist')

const makeRequestHandler = function(req, res) {
    const { playlistId, songId, songName, artists, album, albumArt } = req.body
    if (!playlistId || !songId) {
        return res.status(400).send()
    }
    PlaylistModel.findById(playlistId, (err, playlist) => {
        if (err) {
            return res.status(500).json({ err: JSON.stringify(err) })
        }
        if (!playlist) {
            return res.status(404).send()
        }
        if (!playlist.activated) {
            return res.status(403).json({ err: 'playlist not activated'})
        }
        const requestData = {
            playlistId,
            songId,
            songName,
            artists,
            album,
            albumArt,
            serviced: false
        }
        const request = new RequestModel(requestData)
        request.save()
            .then(() => {
                return res.status(200).send()
            })
            .catch(err => {
                return res.status(500).json({ err: JSON.stringify(err) })
            })
    })
}

module.exports = {
    makeRequestHandler
}