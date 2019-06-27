const { knex } = require('../knex')

/* https://gis.stackexchange.com/questions/142326/calculating-longitude-length-in-miles */
function getNearbyPlaylists(latitude, longitude) {
    return new Promise(function(resolve, reject) {
        knex('Playlists')
            .whereBetween('latitude', [latitude - 0.125, latitude + 0.125])
            .whereBetween('longitude', [longitude - 0.25, longitude + 0.25])
            .then(function(rows) {
                resolve(rows)
             })
            .catch(function(err) {
                reject(err)
            })
    })
    
}

const getNearbyPlaylistsHandler = function(req, res) {
    const { latitude, longitude } = req.query
    if (!latitude) {
        res.status(400).json({ err: "missing latitude"})
    }
    if (!longitude) {
        res.status(400).json({ err: "missing longitude"})
    }
    getNearbyPlaylists(latitude, longitude)
        .then(function(playlists) {
            res.status(200).json({ playlists })
        })
        .catch(function(err) {
            res.status(500).json({ err: JSON.stringify(err) })
        })
}

module.exports = {
    getNearbyPlaylistsHandler
}