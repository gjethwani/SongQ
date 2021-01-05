const request = require('request')
const { getCurrentUnixTimeStamp } = require('../util')
const UserModel = require('../models/user')

const getSpotifyDetails = (accessToken) => {
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
          const userDetails = {
            userId: body.id,
            name: body.display_name,
            email: body.email
          }
          resolve(userDetails)
        }
      }
    })
  })
}

const checkProperties = (properties, values, user) => {
  for (let i = 0; i < properties.length; i++) {
    const property = properties[i]
    const value = values[i]
    if (user[property] !== value) {
      user[property] = value
    }
  }
  return user
}

const spotifyRedirectHandler = function(req, res) {
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
        const { userId, name, email } = await getSpotifyDetails(accessToken)
        req.session.userId = userId
        req.session.accessToken = accessToken
        req.session.refreshToken = refreshToken
        req.session.expiresAt = expiresAt
        UserModel.findOne({ userId }, async (err, user) => {
          if (err) {
            return res.status(500).json({ err: JSON.stringify(err) })
          }
          let newUser
          if (!user) {
            newUser = new UserModel({
              userId,
              name,
              email,
              queueActivated: false
            })
          } else {
            newUser = checkProperties(
              ['userId', 'name', 'email'],
              [userId, name, email],
              user
            )
          }
          try {
            await newUser.save()
            return res.redirect(`${process.env.FRONTEND_URL}/home`)
          } catch(err) {
            return res.status(500).json({ err: JSON.stringify(err) })
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