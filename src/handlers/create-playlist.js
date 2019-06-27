const request = require('request')
const { getUser } = require('../util')
const { knex } = require('../knex')

function insertPlaylistIntoDatabase(playlistData) {
    return new Promise(function(resolve, reject) {
        knex('Playlists')
            .insert(playlistData)
            .then(function() {
                resolve()
            })
            .catch(function(err) {
                console.log(err)
                reject(err)
            })
    })  
}

function isRoomCodeUnique(roomCode) {
    return new Promise(function(resolve, reject) {
        knex('Playlists')
            .where({ roomCode })
            .then(function(rows) {
                if (rows.length === 0) {
                    resolve(true)
                } else {
                    resolve(false)
                }
            })
            .catch(function(err) {
                reject(err)
            })
    })
}

function generateRoomCode(length) {
    var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    var result = '';
    for (var i = length; i > 0; --i) {
        result += chars[Math.floor(Math.random() * chars.length)]
    }
    return result
}

const createPlaylistHandler = async function(req, res) {
    if (!req.user) {
        res.status(401).send()
    } else {
        const { 
            playlistName, 
            playlistIsByLocation, 
            playlistIsPublic, 
            useExistingPlaylist,
            playlistId,
        } = req.body
        var playlistData = { playlistName }
        playlistData.owner = req.user
        if (!playlistName) {
            res.status(400).json({
                'err': 'no playlist name'
            })
        }
        if (playlistIsByLocation) {
            const { latitude, longitude } = req.body
            playlistData.latitude = latitude
            playlistData.longitude = longitude
        }
        var roomCode
        var unique = false
        while (!unique) {
            roomCode = generateRoomCode(4)
            unique = await isRoomCodeUnique(roomCode)
        }
        playlistData.roomCode = roomCode
        var user = await getUser(req.user)
            .catch(function(err) {
                res.status(500).json({ err: JSON.stringify(err) })
                return
            })
        var options = {
            url: `https://api.spotify.com/v1/users/${user.spotifyId}/playlists`,
            headers: {
                'Authorization': `Bearer ${user.accessToken}` 
            },
            body: {
                name: playlistName,
                public: playlistIsPublic
            },
            json: true
        }
        console.log(useExistingPlaylist)
        if (!useExistingPlaylist) {
            request.post(options, function(error, response, body) {
                if (!error && response.statusCode === 201) { 
                    playlistData.spotifyPlaylistId = response.body.id
                    insertPlaylistIntoDatabase(playlistData)
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
            playlistData.spotifyPlaylistId = playlistId
            insertPlaylistIntoDatabase(playlistData)
                .then(function() {
                    res.status(200).send()
                })
                .catch(function(err) {
                    res.status(500).json({ err: JSON.stringify(err) })
                })
        }
    }
}

module.exports = {
    createPlaylistHandler
}