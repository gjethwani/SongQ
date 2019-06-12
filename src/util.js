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

module.exports = {
    getCurrentUnixTimeStamp,
    updateSpotifyDetails,
    getUser,
    isClientCredentialsTokenValid
}