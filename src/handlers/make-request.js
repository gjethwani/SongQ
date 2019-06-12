const { isClientCredentialsTokenValid } = require('../util')
const { knex } = require('../knex')

function makeRequest(requestData) {
    return new Promise(function(resolve, reject) {
        knex("Requests")
            .insert(requestData)
            .then(function() {
                resolve()
            })
            .catch(function(err) {
                console.log(err)
                reject(err)
            })
    })
}

const makeRequestHandler = function(req, res) {
    var { ccTokenInfo } = req.session
    if (!isClientCredentialsTokenValid(ccTokenInfo)) {
        res.status(401).send()
    } else {
        console.log("hello")
        const { roomCode, songId, songName, artists, album } = req.body
        if (!roomCode || !songId || !songName || !artists || !album) {
            req.status(400).send()
            return
        }
        var requestData = {
            roomCode,
            songId,
            songName,
            artists,
            album,
            serviced: false
        }
        makeRequest(requestData)
            .then(function() {
                res.status(200).send()
            })
            .catch(function(err) {
                console.log(err)
                res.status(500).json({ err })
            })
    }
}

module.exports = {
    makeRequestHandler
}