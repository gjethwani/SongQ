require('dotenv').config({
  path: __dirname + '/.env'
})
const { knex } = require('./knex')
const { passport } = require('./passport')
const { app } = require('./setup')
const bcrypt = require('bcrypt')
const request = require('request')

app.set('view-engine', 'ejs')

function validateEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(String(email).toLowerCase())
}

function validatePassword(password) {
  /*
  Password requirements
  1 lowercase
  1 uppercase
  1 numeric
  1 special character
  8 characters or longer 
  */
  var re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/
  return re.test(String(password))
}

function doesUserExists(email) {
  return new Promise(function(resolve, reject) {
    knex('Users')
      .select('email')
      .where({
        email: email
      })
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

function addUser(email, password) {
  var encryptedPassword = encryptPassword(password)
  return new Promise(function(resolve, reject) {
    knex('Users')
      .insert({
        email,
        password: encryptedPassword
      })
      .then(function() {
        resolve('success')
      })
      .catch(function(err) {
        reject(err)
      })
  })

}

function encryptPassword(password) {
  const saltRounds = 10
  var salt = bcrypt.genSaltSync(saltRounds)
  var hash = bcrypt.hashSync(password, salt)
  return hash
}

app.post('/sign-up', async function(req, res) {
  var email = req.body.email
  var password = req.body.password
  var errs = []
  var serverErr = ''
  if (!validateEmail(email)) {
    errs.push('Invalid email')
  }
  var userExists = await doesUserExists(email)
    .catch(function(err) {
      serverErr = err
    })
  if (serverErr !== '') {
    res.status(500).json({
      err: serverErr
    })
    return
  }
  if (userExists === true) {
    errs.push('Users exist')
  }
  if (!validatePassword(password)) {
    errs.push('Invalid password')
  }
  if (errs.length !== 0) {
    res.status(400).json({
      err: errs
    })
    return
  } else {
    await addUser(email, password)
      .then(function() {
        req.logIn(email)
      })
      .catch(function(err) {
        serverErr = err
      })
    if (serverErr !== '') {
      res.status(500).json({
        err: serverErr
      })
      return
    }
    res.redirect('/authenticate-spotify?justSignedUp=true')
  }
})

app.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err) }
    if (!user) { return res.redirect(process.env.FRONT_END_URI) }
    req.logIn(user, function(err) {
      if (err) { return next(err) }
      return res.redirect('/authenticate-spotify?justSignedUp=false')
    })
  })(req, res, next)
})

app.get('/spotify-login', function(req, res) {
  if (!req.user) {
    res.status(401).send()
  } else {
    var scopes = 'user-read-private user-read-email'
    res.redirect('https://accounts.spotify.com/authorize' +
      '?response_type=code' +
      '&client_id=' + process.env.SPOTIFY_CLIENT_ID +
      (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
      '&redirect_uri=' + encodeURIComponent(process.env.SPOTIFY_REDIRECT_URI))
  }
})

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

app.get('/spotify-redirect', function(req, res) {
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
})

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

function getCurrentUnixTimeStamp() {
  return Math.round((new Date()).getTime() / 1000)
}

app.get('/authenticate-spotify', async function(req, res) {
  if (!req.user) {
    res.status(401).send()
  } else {
    var { justSignedUp } = req.query
    if (justSignedUp === 'true') {
      justSignedUp = true
    } else {
      justSignedUp = false
    }
    if (justSignedUp) {
      res.status(200).json({ 
        needToSpotifyAuth: true,
        spotifyRefresh: false
      })
      return
    } else {
      var user = await getUser(req.user)
      if (user.accessToken === null) {
        res.status(200).json({ 
          needToSpotifyAuth: true,
          spotifyRefresh: false
        })
        return
      }
      if ((user.expiresAt - getCurrentUnixTimeStamp()) <= 0) {
        res.status(200).json({
          needToSpotifyAuth: true,
          spotifyRefresh: true
        })
        return
      }
      res.status(200).json({
        needToSpotifyAuth: false
      })
    }
  }
})

// TODO: Update access and refresh tokens
app.get('/spotify-refresh-token', async function(req, res) {
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
              res.redirect(`${process.env.FRONT_END_URI}/home`)
            })
            .catch(function(err) {
              res.status(500).json({ err })
            })
        }
      })
    }
  }
})

const port = process.env.PORT || 5000
app.listen(port, function () {
  console.log(`Listening on port ${port}`)
})

module.exports = {
  validateEmail,
  validatePassword
}