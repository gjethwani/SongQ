const request = require('request')
const { getUser } = require('../util')
const { knex } = require('../knex')

function serviceRequest(requestId, accepted) {
    return new Promise(function(resolve, reject) {
        knex('Requests')
            .where({ id: requestId})
            .update({ accepted, serviced: true})
            .then(function() {
                resolve()
            })
            .catch(function(err) {
                reject(err)
            })
    })
}

const serviceRequestHandler = function(req, res) {
    if (!req.user) {
        res.status(401).send()
    } else {
        var { requestId, songId, playlistId, accepted } = req.body 
        if (!requestId || !songId || !playlistId || accepted === undefined) {
            res.status(400).send()
        }
        getUser(req.user)
            .then(function(user) {
                var options = {
                    url: `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
                    headers: {
                        'Authorization': `Bearer ${user.accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: {
                        uris: [`spotify:track:${songId}`]
                    },
                    json: true
                }
                if (accepted) {
                    request.post(options, function(error, response, body) {
                        if (!error && response.statusCode === 201) {
                            serviceRequest(requestId, accepted)
                                .then(function() {
                                    res.status(200).send()
                                })
                                .catch(function(err) {
                                    res.status(500).json({ err: JSON.stringify(err) })
                                })
                        } else {
                            res.status(response.statusCode).json({
                                body: response.body,
                                err: error
                            })
                        }
                    })
                } else {
                    serviceRequest(requestId, accepted)
                        .then(function() {
                            res.status(200).send()
                        })
                        .catch(function(err) {
                            res.status(500).json({ err: JSON.stringify(err) })
                        })
                }
                
            })
            .catch(function(err) {
                res.status(500).json({ err: JSON.stringify(err) })
            })
    }
}

module.exports = {
    serviceRequestHandler
}