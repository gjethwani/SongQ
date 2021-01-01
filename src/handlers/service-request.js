const requestModule = require('request')
const RequestModel = require('../models/request')

const serviceRequestHandler = (req, res) => {
    let { requestId, accepted } = req.body 
    if (!requestId || !accepted) {
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
            const options = {
                url: `https://api.spotify.com/v1/me/player/queue?uri=spotify:track:${request.songId}`,
                headers: {
                    'Authorization': `Bearer ${req.session.accessToken}` 
                },
                json: true
            }
            requestModule.post(options, async (error, response, body) => {
                if (!error && response.statusCode >= 200 && response.statusCode < 300) {
                    try {
                        request.serviced = true
                        request.accepted = true
                        await request.save()
                        return res.status(200).send()
                    } catch (err) {
                        return res.status(500).json({ err: JSON.stringify(err) })
                    }
                } else {
                    if (error) {
                        return res.status(500).json({ err: JSON.stringify(error) })
                    } else {
                        return res.status(response.statusCode).send()
                    }
                }
            })
        }
    })
}

module.exports = {
    serviceRequestHandler
}