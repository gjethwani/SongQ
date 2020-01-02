const { knex } = require('../knex')
const { getUser, getPlaylists } = require('../util')
const request = require('request')


function getAlbumArt(playlists, token) {
    return new Promise(function(resolve, reject) {
        const noCalls = playlists.length
        if (noCalls === 0) {
            resolve(playlists)
        }
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
                    if (error) {
                        console.log(error)
                        reject(error)
                    } else {
                        console.log(response.statusCode)
                        reject(response.statusCode)
                    }
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
                                return res.status(200).json({
                                    playlists
                                })
                            })
                            .catch(function(err) {
                                console.log(err)
                                return res.status(500).json(err)
                            })
                        
                    })
            })
            .catch(function(err) {
                console.log(err)
                return res.status(500).json({ err: JSON.stringify(err) })
            })
    }
}

module.exports = {
    getPlaylistsHandler,
    getPlaylists
}