const { knex } = require('./knex')

function getCurrentUnixTimeStamp() {
    return Math.round((new Date()).getTime() / 1000)
}

function updateSpotifyDetails(email, details) {
    return new Promise(function(resolve, reject) {
      knex('Users')
        .where('email', email)
        .update(details)
        .then(function() {
          resolve('success')
        })
        .catch(function(err) {
          reject(err)
        })
    })
}

function getUser(email) {
    return new Promise(function(resolve, reject) {
      knex('Users')
        .select('*')
        .where({
          email
        })
        .then(function(rows) {
          if (rows.length === 0) {
            reject({ err: 'No User'})
          } else {
            resolve(rows[0])
          }
        })
        .catch(function(err) {
          reject({ err })
        })
    })
}

function isClientCredentialsTokenValid(ccTokenInfo) {
  if (!ccTokenInfo) {
    return false
  }
  var { expiresAt } = ccTokenInfo
  if ((expiresAt - getCurrentUnixTimeStamp()) <= 0) {
    return false
  }
  return true
}

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

module.exports = {
    getCurrentUnixTimeStamp,
    updateSpotifyDetails,
    getUser,
    isClientCredentialsTokenValid,
    getPlaylists
}

/* Distance calculator https://www.movable-type.co.uk/scripts/latlong.html */
// function toRadians(angle) {
//   return (angle/180) * Math.PI
// }

// var lat1 = 53.2734
// var lon1 = -7.77832031

// var lat2 = 3.1524568
// var lon2 = 101.64879040000001

// var R = 6371e3; // metres
// var φ1 = toRadians(lat1);
// var φ2 = toRadians(lat2);
// var Δφ = toRadians(lat2-lat1);
// var Δλ = toRadians(lon2-lon1);

// var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
//       Math.cos(φ1) * Math.cos(φ2) *
//       Math.sin(Δλ/2) * Math.sin(Δλ/2);
// var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

// var d = R * c;

// console.log(d)