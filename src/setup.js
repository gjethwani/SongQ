require('dotenv').config({
  path: __dirname + '/.env'
})
const express = require('express')
const bodyParser = require('body-parser')

const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');
const app = express()

app.use('/api-docs', swaggerUi.serve)
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json({limit: '50mb'}))

const cors = require('cors')

const corsOptions = {
  origin: [process.env.FRONTEND_URL],
  credentials: true
}

app.use(cors(corsOptions))

const store = new MongoDBStore({
  uri: process.env.MONGODB_URI,
  collection: 'sessions'
})

store.on('error', function(error) {
  console.log(error);
})

const cookie = process.env.ENV === 'local' ? {
  maxAge: 3600000,
  secure: false, 
  httpOnly: true 
} : {
  maxAge: 3600000,
  // secure: true,
  secure: false,
  httpOnly: true,
}

const sessionOptions = {
  store,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie
}

app.use(cookieParser(sessionOptions.secret)) // read cookies (needed for auth)
const sessionParser = session(sessionOptions)
app.use(sessionParser)

const expressWs = require('express-ws')(app)

const loggly = require('loggly')
const logger = loggly.createClient({
    token: process.env.LOGGLY_TOKEN,
    subdomain: process.env.LOGGLY_SUBDOMAIN,
})

const mongoose = require('mongoose')
const connectToDb = async () => { await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true }) }
try {
    connectToDb()
    console.log('Database connection successful')
} catch(err)  {
    console.error('Database connection error')
}

module.exports = {
    app,
    swaggerUi,
    swaggerDocument,
    expressWs,
    logger,
}