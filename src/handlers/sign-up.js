const { knex } = require('../knex')
const bcrypt = require('bcrypt')

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return re.test(String(email).toLowerCase())
}

function doesUserExist(email) {
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

function encryptPassword(password) {
    const saltRounds = 10
    var salt = bcrypt.genSaltSync(saltRounds)
    var hash = bcrypt.hashSync(password, salt)
    return hash
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

const signUpHandler = async function(req, res) {
    var email = req.body.email
    var password = req.body.password
    var errs = []
    var serverErr = ''
    if (!validateEmail(email)) {
      errs.push('Invalid email')
    }
    var userExists = await doesUserExist(email)
      .catch(function(err) {
        serverErr = err
      })
    if (serverErr !== '') {
        console.log(serverErr)
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
      addUser(email, password)
        .then(function() {
          req.logIn(email, function(){})
          res.status(200).send()
        })
        .catch(function(err) {
          serverErr = err
          console.log(serverErr)
          res.status(500).json({
            err: serverErr
          })
        })
    }
}

module.exports = {
    signUpHandler,
    validateEmail,
    validatePassword
}