require('dotenv').config({
  path: __dirname + '/.env'
})
const {
  knex
} = require('./knex')
const {
  passport
} = require('./passport')
const {
  app,
  corsOptions
} = require('./setup')
const fs = require('fs')
const cors = require('cors')

app.set('view-engine', 'ejs')

app.get('/', function(req, res) {
  res.render('index.ejs')
})

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
  return new Promise(function(resolve, reject) {
    knex('Users')
      .insert({
        email,
        password
      })
      .then(function() {
        resolve('success')
      })
      .catch(function(err) {
        reject(err)
      })
  })

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
      .catch(function(err) {
        serverErr = err
      })
    if (serverErr !== '') {
      console.log('here1')
      res.status(500).json({
        err: serverErr
      })
      return
    }
    res.status(200).send()
  }
})

app.post('/login', cors(corsOptions), passport.authenticate('local', {successRedirect: '/authenticate-spotify', failureRedirect: '/'}))

app.post('/authenticate-spotify', cors(corsOptions), function(req, res) {
  console.log("here")
})

const port = process.env.PORT || 5000
app.listen(port, function () {
  console.log(`Listening on port ${port}`)
})

module.exports = {
  validateEmail,
  validatePassword
}