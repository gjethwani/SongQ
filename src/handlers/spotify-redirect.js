const request = require('request')
const { getCurrentUnixTimeStamp } = require('../util')
const UserModel = require('../models/user')

const getSpotifyId = (accessToken) => {
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
      console.log(req.sessionID)
      var code = req.query.code
      var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
          code,
          redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
          grant_type: 'authorization_code'
        },
        headers: {
          'Authorization': 'Basic ' + (new Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64'))
        },
        json: true
      }
      request.post(authOptions, async function(error, response, body) {
        if (!error && response.statusCode === 200) {
  
          const accessToken = body.access_token,
              refreshToken = body.refresh_token,
              expiresIn = body.expires_in
          const expiresAt = getCurrentUnixTimeStamp() + expiresIn
          try {
            const userId = await getSpotifyId(accessToken)
            req.session.userId = userId
            req.session.accessToken = accessToken
            req.session.refreshToken = refreshToken
            req.session.expiresAt = expiresAt
            UserModel.findOne({ userId }, async (err, user) => {
              if (err) {
                return res.status(500).json({ err: JSON.stringify(err) })
              }
              if (!user) {
                const newUser = new UserModel({
                  userId,
                  queueActivated: false
                })
                try {
                  await newUser.save()
                } catch(err) {
                  return res.status(500).json({ err: JSON.stringify(err) })
                }
              } else {
                // return res.status(200).send()
                return res.redirect(`${process.env.FRONTEND_URL}/home`)
              }
            })
          } catch (err) {
            return res.status(500).json({ err: JSON.stringify(err )})
          }
        } else {
          if (error) {
            return res.status(500).json({ err: JSON.stringify(error) })
          }
          if (response.statusCode >= 300) {
            return res.status(response.statusCode).send()
          }
        }
      })
}

module.exports = {
    spotifyRedirectHandler
}