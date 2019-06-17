const request = require('request')
const { getCurrentUnixTimeStamp, updateSpotifyDetails } = require('../util')

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
          resolve(body.id)
        }
      }
    })
  })
}

const spotifyRedirectHandler = function(req, res) {
    if (!req.user) {
      res.status(401).send()
    } else {
      var code = req.query.code
      var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
          code,
          redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
          grant_type: 'authorization_code'
        },
        headers: {
          'Authorization': 'Basic ' + (new Buffer(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64'))
        },
        json: true
      }
      request.post(authOptions, async function(error, response, body) {
        if (!error && response.statusCode === 200) {
  
          var accessToken = body.access_token,
              refreshToken = body.refresh_token,
              expiresIn = body.expires_in
  
          var expiresAt = getCurrentUnixTimeStamp() + expiresIn
          var spotifyId = await getSpotifyId(accessToken)
            .catch(function(err) {
              res.status(500).json({ err })
            })
          updateSpotifyDetails(req.user, { //TODO: handle same spotify id
            accessToken,
            refreshToken,
            expiresAt,
            spotifyId
          })
            .then(function() {
              // res.status(200).send()
              res.redirect(`${process.env.FRONT_END_URI}/home`)
            })
            .catch(function(err) {
              console.log("here1")
              console.log(err)
              res.status(500).json({ err })
            })
        } else {
          if (error) {
            res.status(500).json({ err: error })
          }
          if (response.statusCode !== 200) {
            res.status(response.status).send()
          }
        }
      })
    }
}

module.exports = {
    spotifyRedirectHandler
}