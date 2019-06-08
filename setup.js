const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
const cors = require('cors')
const { passport } = require('./passport')

const app = express()

app.use( bodyParser.json())       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}))

const whitelist = [
  'http://localhost:5000'
]
  
const routes = [
  '/sign-up',
  '/login',
  '/spotify-login',
  '/spotify-redirect',
  '/authenticate-spotify'
]

const corsOptions = {
  origin: function (origin, callback) {
    callback(null, true)
    // if (whitelist.indexOf(origin) !== -1) {
    //   callback(null, true)
    // } else {
    //   callback(new Error('Not allowed by CORS'))
    // }
  },
  credentials: true
}

app.use(cors(corsOptions))
  
// app.options(routes, cors(corsOptions))
  
app.use(express.static("public"))
app.use(session({ 
    secret: "cats",
    saveUninitialized: true,
    resave: false
}))
app.use(passport.initialize())
app.use(passport.session())

module.exports = {
    app,
    corsOptions
}