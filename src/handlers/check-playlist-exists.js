const { knex } = require('../knex')

function checkPlaylistExists(roomCode) {
    return new Promise(function(resolve, reject) {
        knex('Playlists')
            .where({ roomCode })
            .then(function(rows) {
                if (rows.length === 0) {
                    resolve({
                        playlistExists: false,
                        playlistName: ''
                    })
                } else {
                    resolve({
                        playlistExists: true,
                        playlistName: rows[0].playlistName
                    })
                }
            })
            .catch(function(err) {
                reject(err)
            })
    })
}

const checkPlaylistExistsHandler = function(req, res) {
    var { roomCode } = req.body
    checkPlaylistExists(roomCode)
        .then(function(playlistDetails) {
            res.status(200).json(playlistDetails)
        })
        .catch(function(err) {
            res.status(500).json({ err: JSON.stringify(err) })
        })
}

module.exports = {
    checkPlaylistExistsHandler
}