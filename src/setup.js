require('dotenv').config({
  path: __dirname + '/.env'
})
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const { passport } = require('./passport')

const cookieParser = require('cookie-parser');
const session = require('express-session');
const compression = require('compression')
const helmet = require('helmet')
const morgan = require('morgan');
const morganBody = require('morgan-body');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');
const app = express()

const port = process.env.PORT || 5000;

app.use('/api-docs', swaggerUi.serve)
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json({limit: '50mb'}))
app.use(helmet())
app.use(compression({level: 9}))
app.use(morgan(`API Request (port ${port}): :method :url :status :response-time ms - :res[content-length]`));
morganBody(app);

var SQLiteStore = require('connect-sqlite3')(session);

var sessionOptions = {
  secret: process.env.SESSION_SECRET,
  rolling: true, // https://stackoverflow.com/questions/20387554/how-to-keep-alive-an-nodejs-passport-session
  resave: true,
  saveUninitialized: false,
  store: new SQLiteStore,
}

app.use(cookieParser(sessionOptions.secret)); // read cookies (needed for auth)
app.use(session(sessionOptions));

var corsWhitelist = (process.env.CORS).split(",")
console.log("CORS Whitelist:\n", corsWhitelist)
var corsOptions = {
  origin: function (origin, callback) {
    callback(null, true)
    // if (corsWhitelist.indexOf(origin) !== -1) {
    //   callback(null, true)
    // } else {
    //   callback(new Error('Not allowed by CORS'))
    // }
  },
  credentials: true
}

app.options('*', cors(corsOptions))
app.use(cors(corsOptions))

app.use(express.static("public"))
app.use(passport.initialize())
app.use(passport.session())

module.exports = {
    app,
    swaggerUi,
    swaggerDocument
}