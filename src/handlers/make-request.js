const UserModel = require('../models/user')
const RequestModel = require('../models/request')

const makeRequestHandler = (req, res) => {
    const { userId, songId, songName, artists, album, albumArt } = req.body
    if (!userId || !songId) {
        return res.status(400).send()
    }
    UserModel.findOne({ userId }, (err, user) => {
        if (err) {
            return res.status(500).json({ err: JSON.stringify(err) })
        }
        if (!user) {
            return res.status(404).send()
        }
        if (!user.queueActivated) {
            return res.status(403).json({ err: `user's queue not activated`})
        }
        const requestData = {
            userId,
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