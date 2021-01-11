const UserModel = require('../models/user')
const RequestModel = require('../models/request')
const WSConnectionModel = require('../models/ws-connection')
const { expressWs } = require('../setup')
const { addToQueue, log } = require('../util')

const makeRequestHandler = (req, res) => {
    const { userId, songId, songName, artists, album, albumArt } = req.body
    if (!userId || !songId) {
        if (!userId) {
            log('/make-request', '', 'no userId')
        }
        if (!songId) {
            log('/make-request', '', 'no songId')
        }
        return res.status(400).send()
    }
    UserModel.findOne({ userId }, (err, user) => {
        if (err) {
            log('/make-request', userId, `[mongoose-find-err] ${JSON.stringify(err)}`)
            return res.status(500).json({ err: JSON.stringify(err) })
        }
        if (!user) {
            log('/make-request', userId, `no user`)
            return res.status(404).send()
        }
        if (!user.queueActivated) {
            log('/make-request', userId, `queue not active`)
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
        if (user.autoAccept) {
            requestData.serviced = true
            requestData.accepted = true
        }
        const request = new RequestModel(requestData)
        request.save()
            .then(doc => {
                if (user.autoAccept) {
                    addToQueue(songId, req.session.accessToken, () => {
                        return {
                            status: 200
                        }
                    })
                        .then(() => {
                            return res.status(200).send()
                        })
                        .catch(err => {
                            log('/make-request', userId, `[add-to-queue-err] ${err.message}`)
                            return res.status(err.status).json({ err: err.message })
                        })
                }
                WSConnectionModel.findOne({ userId }, (err, connection) => {
                    if (err) {
                        log('/make-request', userId, `[ws-find-err] ${JSON.stringify(err)}`)
                    } else if (connection) {
                        let { clients } = expressWs.getWss()
                        clients = Array.from(clients)
                        for (let i = 0; i < clients.length; i++) {
                            const client = clients[i]
                            const connectionId = JSON.stringify(connection._id)
                            if (client.id === connectionId.substring(1, connectionId.length - 1)) { // get rid of quotation marks around id
                                if (user.autoAccept) {
                                    client.send('aew-request:' + JSON.stringify(doc))
                                } else {
                                    client.send('new-request:' + JSON.stringify(doc))
                                }
                                break
                            }
                        }
                    }
                })
                return res.status(200).send()
                
            })
            .catch(err => {
                log('/make-request', userId, `[mongoose-save-err] ${JSON.stringify(err)}`)
                return res.status(500).json({ err: JSON.stringify(err) })
            })
    })
}

module.exports = {
    makeRequestHandler
}