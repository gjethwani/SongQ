const { getCurrentUnixTimeStamp, getUser, updateSpotifyDetails } = require('../util')
const request = require('request')

const spotifyRefreshTokenHandler = async function(req, res) {
    if (!req.user) {
      res.status(401).send()
    } else {
      var user = await getUser(req.user)
      var { refreshToken } = user
      if (!refreshToken) {
        res.status(500).json({
          err: 'No refresh token'
        })
        return
      } else {
        var authOptions = {
          url: 'https://accounts.spotify.com/api/token',
          headers: { 'Authorization': 'Basic ' + (new Buffer(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64')) },
          form: {
            grant_type: 'refresh_token',
            refresh_token: refreshToken
          },
          json: true
        }
        request.post(authOptions, function(error, response, body) {
          if (!error && response.statusCode === 200) {
            var accessToken = body.access_token
            var expiresIn = body.expires_in
            var expiresAt = getCurrentUnixTimeStamp() + expiresIn
            updateSpotifyDetails(req.user, { 
              accessToken, 
              expiresAt 
            })
              .then(function() {
                res.status(200).send()
              })
              .catch(function(err) {
                res.status(500).json({ err })
              })
          }
        })
      }
    }
}

module.exports = {
    spotifyRefreshTokenHandler
}