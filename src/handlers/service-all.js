const { addToQueue, log } = require('../util')
const RequestModel = require('../models/request')

const wait = (ms) => {
    const start = Date.now()
    let now = start
    while (now - start < ms) {
      now = Date.now()
    }
}

const serviceAllHandler = (req, res) => {
    const { userId } = req.session
    let { accepted } = req.body
    if (accepted === undefined) {
        if (accepted === undefined) {
            log('/service-all', userId, `no accepted`)
        }
        return res.status(400).send()
    }
    accepted = JSON.parse(accepted)
    if (!accepted) {
        RequestModel.updateMany({ userId, serviced: false }, { $set: { serviced: true, accepted }}, err => {
            if (err) {
                log('/service-all', userId, `[mongoose-update-err] ${JSON.stringify(err)}`)
                return res.status(500).json({ err: JSON.stringify(err) })
            }
            return res.status(200).send()
        })
    } else {
        let errFound = false
        RequestModel.find({ userId, serviced: false}, async (err, requests) => {
            if (err) {
                log('/service-all', userId, `[mongoose-find-err] ${JSON.stringify(err)}`)
                return res.status(500).json({ err: JSON.stringify(err) })
            }
            requests.sort((r1, r2) => {
                return new Date(r1.createdAt) - new Date(r2.createdAt)
            })
            for (let i = 0; i < requests.length; i++) {
                const r = requests[i]
                try {
                    const response = await addToQueue(r.songId, req.session.accessToken, async () => {
                        try {
                            await RequestModel.findByIdAndUpdate(r._id, { $set: { serviced: true, accepted }})
                            return {
                                status: 200
                            }
                        } catch(err) {
                            return {
                                status: 500,
                                message: JSON.stringify(err)
                            }
                        }
                    })
                    if (response.status === 500) {
                        log('/service-all', userId, `[spotify-err] ${response.status} ${response.message}`)
                        errFound = true
                        return res.status(500).json({ err: response.message })
                    }
                    wait(50)
                } catch(err) {
                    log('/service-all', userId, `[add-to-queue-err] ${err.message}`)
                    errFound = true
                    return res.status(err.status).json({ err: err.message })
                }
            }
            console.log(errFound)
            if (!errFound) {
                return res.status(200).send()
            }
        })
    }
}

module.exports = {
    serviceAllHandler
}