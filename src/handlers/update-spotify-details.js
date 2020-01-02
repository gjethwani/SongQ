const { getCurrentUnixTimeStamp, updateSpotifyDetails } = require('../util')
const { knex } = require('../knex')
const request = require('request')

function doesSpotifyIdExist(spotifyId) {
    return new Promise(function(resolve, reject) {
        knex('Users')
            .select('spotifyId')
            .where({ spotifyId })
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

function getSpotifyId(accessToken) {
    var options = {
      url: 'https://api.spotify.com/v1/me',
      headers: {
        'Authorization': `Bearer ${accessToken}` 
      },
      json: true
    }
    return new Promise(function(resolve, reject) {
      request.get(options, function(error, response, body) {
        if (error) {
          reject({ err: error })
        } else if (response.statusCode !== 200) {
          reject({ err: `${response.statusCode}`})
        } else {
          if (body.error) {
            reject(body.error)
          } else {
            const { id } = body
            doesSpotifyIdExist(id)
                .then(function(exists) {
                    if (exists) {
                        reject('spotify user exists')
                    } else {
                        resolve(id)
                    }
                })
                .catch(function(err) {
                    reject(err)
                })
          }
        }
      })
    })
  }

const updateSpotifyDetailsHandler = function(req, res) {
    if (!req.user) {
        res.status(401).send()
    } else {
        const { accessToken, refreshToken, expiresIn } = req.body
        const expiresAt = getCurrentUnixTimeStamp() + expiresIn
        getSpotifyId(accessToken)
            .then(function(spotifyId) {
                updateSpotifyDetails(req.user, { //TODO: handle same spotify id
                    accessToken,
                    refreshToken,
                    expiresAt,
                    spotifyId
                })
                .then(function() {
                    res.status(200).send()
                    // return res.redirect(`${process.env.FRONT_END_URI}/home`)
                })
                .catch(function(err) {
                    console.log(err)
                    return res.status(500).json({ err: JSON.stringify(err) })
                })
            })
            .catch(function(err) {
                console.log(err)
                return res.status(500).json({ err: JSON.stringify(err) })
            })
    }
}

module.exports = {
    updateSpotifyDetailsHandler
}