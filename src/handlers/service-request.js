const RequestModel = require('../models/request')
const { addToQueue, log } = require('../util')

const serviceRequestHandler = (req, res) => {
    let { requestId, accepted } = req.body 
    if (!requestId || accepted === undefined) {
        if (!requestId) {
            log('/service-request', req.session.userId, `no requestId`)
        }
        if (accepted === undefined) {
            log('/service-request', req.session.userId, `no accepted`)
        }
        return res.status(400).send()
    }
    accepted = JSON.parse(accepted)
    RequestModel.findById(requestId, async (err, request) => {
        if (err) {
            log('/service-request', req.session.userId, `[mongoose-find-err] [${requestId}] ${JSON.stringify(err)}`)
            return res.status(500).json({ err: JSON.stringify(err) })
        }
        if (!request) {
            log('/service-request', req.session.userId, `[mongoose-find-err] [${requestId}] no request`)
            return res.status(404).json({ err: 'no request found'})
        }
        if (!accepted) {
            try {
                request.serviced = true
                request.accepted = false
                await request.save()
                await RequestModel.updateMany({ songId: request.songId }, { $set: { serviced: true, accepted }})
                return res.status(200).send()
            } catch(err) {
                console.log(err)
                log('/service-request', req.session.userId, `[mongoose-save-err] [${requestId}] ${JSON.stringify(err)}`)
                return res.status(500).json({ err: JSON.stringify(err) })
            }
        } else {
            addToQueue(request.songId, req.session.accessToken, async () => {
                try {
                    request.serviced = true
                    request.accepted = true
                    await RequestModel.updateMany({ songId: request.songId }, { $set: { serviced: true, accepted }})
                    await request.save()
                    return {
                        status: 200
                    }
                } catch (err) {
                    return {
                        status: 500,
                        message: JSON.stringify(err)
                    }
                }
            })
                .then(() => {
                    return res.status(200).send()
                })
                .catch(err => {
                    log('/service-request', req.session.userId, `[add-to-queue-err] [${requestId}] ${JSON.stringify(err)}`)
                    return res.status(err.status).json({ err: err.message })
                })
        }
    })
}

module.exports = {
    serviceRequestHandler
}