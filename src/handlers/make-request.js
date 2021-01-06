const UserModel = require('../models/user')
const RequestModel = require('../models/request')
const WSConnectionModel = require('../models/ws-connection')
const { expressWs } = require('../setup')

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
            .then(doc => {
                WSConnectionModel.findOne({ userId }, (err, connection) => {
                    if (err) {
                        console.log('err finding connection')
                    } else if (connection) {
                        let { clients } = expressWs.getWss()
                        clients = Array.from(clients)
                        for (let i = 0; i < clients.length; i++) {
                            const client = clients[i]
                            const connectionId = JSON.stringify(connection._id)
                            if (client.id === connectionId.substring(1, connectionId.length - 1)) {
                                client.send('new-request:' + JSON.stringify(doc))
                                break
                            }
                        }
                    }
                })
                return res.status(200).send()
            })
            .catch(err => {
                console.log(err)
                return res.status(500).json({ err: JSON.stringify(err) })
            })
    })
}

module.exports = {
    makeRequestHandler
}