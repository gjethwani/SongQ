const request = require('request')
const { getUser } = require('../util')

function filterPlaylists(playlists, ownerId) {
    return playlists.filter((
        function(playlist) {
            return playlist.collaborative === true || playlist.owner.id === ownerId
        })
    )
}

const getExistingPlaylistsHandler = function(req, res) {
    if (!req.user) {
        res.status(401).send()
    } else {
        getUser(req.user)
            .then(function(user) {
                var options = {
                    url: `https://api.spotify.com/v1/me/playlists?limit=50`,
                    headers: {
                        'Authorization': `Bearer ${user.accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    json: true
                }
                request.get(options, function(error, response, body) {
                    if (!error && response.statusCode === 200) {
                        var playlists = filterPlaylists(body.items, user.spotifyId)
                        res.status(200).json({
                            playlists
                        })
                    } else {
                        res.status(response.statusCode).json({
                            body: response.body,
                            err: error
                        })
                    }
                })
            })
            .catch(function(err) {
                res.status(500).json({ err })
            })
    }
}

module.exports = {
    getExistingPlaylistsHandler
}