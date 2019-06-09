const request = require('request')
const { spotifyApi } = require('../spotify')
const { getCurrentUnixTimeStamp, updateSpotifyDetails } = require('../util')

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
      request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {
  
          var accessToken = body.access_token,
              refreshToken = body.refresh_token,
              expiresIn = body.expires_in
  
          var expiresAt = getCurrentUnixTimeStamp() + expiresIn
          spotifyApi.setAccessToken(accessToken)
          spotifyApi.setRefreshToken(refreshToken)
          updateSpotifyDetails(req.user, {
            accessToken,
            refreshToken,
            expiresAt
          })
            .then(function() {
              res.redirect(`${process.env.FRONT_END_URI}/home`)
            })
            .catch(function(err) {
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