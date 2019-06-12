const { knex } = require('../knex')

function getPlaylists(email) {
    return new Promise(function(resolve, reject) {
        knex("Playlists")
            .where({ email })
            .then(function(rows) {
                console.log(rows)
                resolve(rows)
            })
            .catch(function(err) {
                reject(err)
            })
    })
}

const getPlaylistsHandler = function(req, res) {
    if (!req.user) {
        res.status(401).send()
    } else {
        var email = { req }
        getPlaylists(email)
            .then(function(rows) {
                res.status(200).json({
                    playlists: rows
                })
            })
            .catch(function(err) {
                console.log(err)
                res.status(500).json({ err })
            })
    }
}

module.exports = {
    getPlaylistsHandler,
    getPlaylists
}