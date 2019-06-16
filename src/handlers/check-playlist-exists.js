function checkPlaylistExists(roomCode) {
    return new Promise(function(resolve, reject) {
        knex('Playlists')
            .where({ roomCode })
            .then(function(rows) {
                if (rows.length === 0) {
                    resolve(false)
                } else {
                    resolve(true)
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
        .then(function(exists) {
            res.status(200).json({ exists })
        })
        .catch(function(err) {
            res.status(500).json({ err })
        })
}

module.exports = {
    checkPlaylistExistsHandler
}