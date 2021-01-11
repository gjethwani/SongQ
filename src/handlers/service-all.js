const { addToQueue, log } = require('../util')
const RequestModel = require('../models/request')

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
        RequestModel.find({ userId, serviced: false}, (err, requests) => {
            if (err) {
                log('/service-all', userId, `[mongoose-find-err] ${JSON.stringify(err)}`)
                return res.status(500).json({ err: JSON.stringify(err) })
            }
            let finishedRequests = 0
            requests.forEach(async r => {
                addToQueue(r.songId, req.session.accessToken, async () => {
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
                    .then(response => {
                        console.log("GAUTAM")
                        console.log(response)
                        if (response.status === 500) {
                            log('/service-all', userId, `[mongoose-update-one-err] ${response.message}`)
                            return res.status(500).json({ err: err.message })
                        }
                        // finishedRequests++
                        // console.log(finishedRequests, requests.length)
                        // if (finishedRequests === requests.length) {
                        //     return res.status(200).send()
                        // }
                    })
                    .catch(err => {
                        log('/service-all', userId, `[add-to-queue-err] ${err.message}`)
                        console.log("BREAK")
                        return res.status(err.status).json({ err: err.message})
                    })
            })
        })
    }
}

module.exports = {
    serviceAllHandler
}