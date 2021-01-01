const PlaylistModel = require('../models/playlist')

const changePlaylistActivationHandler = (req, res) => {
    let { playlistId, activated } = req.body
    activated = JSON.parse(activated)
    if (!playlistId || !activated) {
        return res.status(400).send()
    }
    PlaylistModel.findById(playlistId, (err, playlist) => {
        if (err) {
            return res.status(500).json({ err: JSON.stringify(err) })
        }
        if (!playlist) {
            return res.status(404).json()
        }
        playlist.activated = activated
        playlist.save()
            .then(() => {
                return res.status(200).send()
            })
            .catch(err => {
                return res.status(500).json({ err: JSON.stringify(err) })
            })
    })
}

module.exports = {
    changePlaylistActivationHandler
}