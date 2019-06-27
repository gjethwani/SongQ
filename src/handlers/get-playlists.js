const { knex } = require('../knex')

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

const getPlaylistsHandler = function(req, res) {
    if (!req.user) {
        res.status(401).send()
    } else {
        var { user } = req
        getPlaylists(user)
            .then(function(rows) {
                res.status(200).json({
                    playlists: rows
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