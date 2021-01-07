const RequestModel = require('../models/request')
const { addToQueue } = require('../util')

const serviceRequestHandler = (req, res) => {
    let { requestId, accepted } = req.body 
    if (!requestId || accepted === undefined) {
        return res.status(400).send()
    }
    accepted = JSON.parse(accepted)
    RequestModel.findById(requestId, async (err, request) => {
        if (err) {
            return res.status(500).json({ err: JSON.stringify(err) })
        }
        if (!request) {
            return res.status(404).json({ err: 'no request found'})
        }
        if (!accepted) {
            try {
                request.serviced = true
                request.accepted = false
                await request.save()
                return res.status(200).send()
            } catch(err) {
                return res.status(500).json({ err: JSON.stringify(err) })
            }
        } else {
            addToQueue(request.songId, req.session.accessToken, async () => {
                try {
                    request.serviced = true
                    request.accepted = true
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
                    return res.status(err.status).json({ err: err.message })
                })
        }
    })
}

module.exports = {
    serviceRequestHandler
}