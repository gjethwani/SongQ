const UserModel = require('../models/user')
const RequestModel = require('../models/request')
const WSConnectionModel = require('../models/ws-connection')
const { expressWs } = require('../setup')
const { log, addToQueue } = require('../util')
const nodemailer = require("nodemailer")

const sendEmailNotification = async recipient => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_ADDRESS,
            pass: process.env.EMAIL_PASSWORD,
        }
    })

    await transporter.sendMail({
        from: '"SongQ Team" <info@songq.io>',
        to: recipient,
        subject: "You have unread requests",
        text: "Go to songq.io to attend to your requests",
        html: "Go to songq.io to attend to your requests",
    })
}

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
    UserModel.findOne({ userId }, async (err, user) => {
        if (err) {
            log('/make-request', userId, `[mongoose-find-err] ${JSON.stringify(err)}`)
            return res.status(500).json({ err: JSON.stringify(err) })
        }
        if (!user) {
            log('/make-request', userId, `no user`)
            return res.status(404).send()
        }
        const requestData = {
            userId,
            songId,
            songName,
            artists,
            album,
            albumArt,
            serviced: false,
            recommended: false
        }
        if (user.autoAccept) {
            const db = RequestModel.db.db
            try {
                const result = await db.collection('sessions').find({"session.userId": userId }).toArray()
                let correctAccessToken = ''
                let biggestTimeDiff = 0
                result.forEach(r => {
                    const { expiresAt, accessToken } = r.session
                    const timeDiff = (expiresAt * 1000) - new Date().getTime()
                    if (timeDiff > biggestTimeDiff) {
                        correctAccessToken = accessToken
                        biggestTimeDiff = timeDiff
                    }
                })
                if (correctAccessToken !== '') {
                    await addToQueue(songId, correctAccessToken, async () => {
                        requestData.serviced = true
                        requestData.accepted = true
                    })
                } else {
                    user.autoAccept = false
                    try {
                        await user.save()
                    } catch(err) {
                        log('/make-request', userId, `[change-auto-accept-err] ${JSON.stringify(err)}`)
                    }
                }
            } catch (err) {
                log('/make-request', userId, `[auto-accept-err] ${JSON.stringify(err)}`)
            }
        }
        const request = new RequestModel(requestData)
        request.save()
            .then(doc => {

                // send message on websocket
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

                // send email
                if(!user.autoAccept && user.shouldSendEmail && user.emailPreference !== "none") {
                    sendEmailNotification(user.email)
                    if (user.emailPreference === "unreadRequests") {
                        user.shouldSendEmail = false
                        user.save()
                            .catch(err => {
                                log('/make-request',  userId, `[mongoose-user-save-err] ${JSON.stringify(err)}`)
                            })
                    }
                }

                return res.status(200).send()
                
            })
            .catch(err => {
                log('/make-request', userId, `[mongoose-request-save-err] ${JSON.stringify(err)}`)
                return res.status(500).json({ err: JSON.stringify(err) })
            })
    })
}

module.exports = {
    makeRequestHandler,
    sendEmailNotification
}