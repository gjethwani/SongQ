require('dotenv').config({
  path: __dirname + '/.env'
})
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const { passport } = require('./passport')

const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const compression = require('compression')
const MongoStore = require('connect-mongo')(session);
const helmet = require('helmet')
const morgan = require('morgan');
const morganBody = require('morgan-body');
const app = express()

const port = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json({limit: '50mb'}));
app.use(helmet())
app.use(compression({level: 9}))
app.use(morgan(`API Request (port ${port}): :method :url :status :response-time ms - :res[content-length]`));
morganBody(app);

// setup mongoose
var mongooseOptions = {
  reconnectInterval: 500, // Reconnect every 500ms
  reconnectTries: 30, // max number of retries
  keepAlive: true, // keep alive for long running connections
  poolSize: 10, // Maintain up to 10 socket connections
  bufferMaxEntries: 0 // If not connected, return errors immediately rather than waiting for reconnect
};

mongoose.Promise = global.Promise; // clear mongo's promise depreciation warning : https://github.com/Automattic/mongoose/issues/4291
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/boilerplate', mongooseOptions)

var sessionOptions = {
  secret: process.env.SESSION_SECRET,
  rolling: true, // https://stackoverflow.com/questions/20387554/how-to-keep-alive-an-nodejs-passport-session
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  cookie: {
    // domain: 'localhost:8080',
    // path: '/',
    // domain: 'localhost',
    maxAge: 1000 * 60 * 24 // 24 hours
  }
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
}