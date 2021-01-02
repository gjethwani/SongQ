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

const store = new MongoDBStore({
  uri: process.env.MONGODB_URI,
  collection: 'sessions'
})

store.on('error', function(error) {
  console.log(error);
})

const sessionOptions = {
  store,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}

const mongoose = require('mongoose')
const connectToDb = async () => { await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })}
try {
    connectToDb()
    console.log('Database connection successful')
} catch(err)  {
    console.log(err)
    console.error('Database connection error')
}
app.use(cookieParser(sessionOptions.secret)); // read cookies (needed for auth)
app.use(session(sessionOptions));

module.exports = {
    app,
    swaggerUi,
    swaggerDocument
}