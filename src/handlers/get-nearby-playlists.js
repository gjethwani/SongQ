const { knex } = require('../knex')

const toRadians = (degrees) => {
  var pi = Math.PI;
  return degrees * (pi/180);
}

const getDistance = (lat1, lon1, lat2, lon2)=> {
    var R = 6371e3 // metres
    var φ1 = toRadians(lat1)
    var φ2 = toRadians(lat2)
    var Δφ = toRadians(lat2-lat1)
    var Δλ = toRadians(lon2-lon1)

    var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2)
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

    var d = R * c
    return d
}

/* https://gis.stackexchange.com/questions/142326/calculating-longitude-length-in-miles */
const getNearbyPlaylists = (latitude, longitude) => {
    return new Promise(function(resolve, reject) {
        knex
            .raw(`
                SELECT *
                FROM Playlists
                WHERE latitude BETWEEN ${latitude - 0.125} AND ${parseFloat(latitude) + 0.125}
                AND
                longitude BETWEEN ${longitude - 0.125} AND ${parseFloat(longitude) + 0.125}
            `)
            .then(function(rows) {
                for (let i = 0; i < rows.length; i++) {
                    rows[i].distance = getDistance(latitude, longitude, rows[i].latitude, rows[i].longitude)
                }
                resolve(rows)
             })
            .catch(function(err) {
                console.log(err)
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