const PlaylistModel = require('../models/playlist')

const getPlaylistByCodeHandler = (req, res) => {
    let { code } = req.query
    if (!code) {
        return res.status(400).send()
    }
    code = decodeURIComponent(code)
    PlaylistModel.findOne({ code }, (err, playlist) => {
        if (err) {
            return res.status(500).json({ err: JSON.stringify(err) })
        }
        if (!playlist) {
            return res.status(404).send()
        }
        return res.status(200).json({ playlist })
    })
}

module.exports = {
    getPlaylistByCodeHandler
}