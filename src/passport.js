const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

const { knex } = require('./knex')

passport.use(new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    function(email, password, done) {
      knex('Users')
        .where({ email })
        .then(function(rows) {
          if (rows.length == 0) {
            return done(null, false, { message: 'No user' })
          }
          var user = rows[0]
          bcrypt.compare(password, user.password, function(err, res) {
            if (err) {
              return done(err)
            }
            if (res) {
              return done(null, user.email)
            } else {
              return done(null, false, { message: 'Incorrect password.' })
            }
          })
        })
        .catch(function(err) {
          return done(err)
        })
    }
))

passport.serializeUser(function(user, done) {
    done(null, user);
})
  
passport.deserializeUser(function(id, done) {
    knex('Users')
        .where({ email: id})
        .then(function(rows) {
            return done(null, rows[0].email)
        })
        .catch(function(err) {
            return done(err, null)
        })
})

module.exports = {
    passport
}