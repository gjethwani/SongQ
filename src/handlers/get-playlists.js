const { knex } = require('../knex')
const { getUser } = require('../util')
const request = require('request')

function getPlaylists(owner) {
    return new Promise(function(resolve, reject) {
        knex("Playlists")
            .where({ owner })
            .then(function(rows) {
                resolve(rows)
            })
            .catch(function(err) {
                reject(err)
            })
    })
}

function getAlbumArt(playlists, token) {
    return new Promise(function(resolve, reject) {
        const noCalls = playlists.length
        let callsMade = 0
        let newPlaylists = playlists
        for (let i = 0; i < noCalls; i++) {
            var options = {
                url: `https://api.spotify.com/v1/playlists/${playlists[i].spotifyPlaylistId}/images`,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                json: true
            }
            request.get(options, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    if (body.length !== 0) {
                        newPlaylists[i].image = body
                    }
                } else {
                    console.log(response.statusCode)
                    console.log(error)
                }
                callsMade++
                if (callsMade === noCalls) {
                    resolve(newPlaylists)
                }
            })
        }
    })
    
}

const getPlaylistsHandler = function(req, res) {
    if (!req.user) {
        res.status(401).send()
    } else {
        var { user } = req
        getPlaylists(user)
            .then(function(rows) {
                getUser(user)
                    .then(function(userObj) {
                        getAlbumArt(rows, userObj.accessToken)
                            .then(function(playlists) {
                                res.status(200).json({
                                    playlists
                                })
                            })
                        
                    })
            })
            .catch(function(err) {
                console.log(err)
                res.status(500).json({ err: JSON.stringify(err) })
            })
    }
}

module.exports = {
    getPlaylistsHandler,
    getPlaylists
}