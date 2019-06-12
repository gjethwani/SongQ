const { passport } = require('../passport')

const logInHandler = function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
      if (err) { 
        res.status(500).json({ err }) 
      }
      if (!user) { 
        return res.status(204).send() 
      }
      req.logIn(user, function(err) {
        if (err) { 
          res.status(401).send({ err })
          return
        }
        return res.redirect('/authenticate-spotify?justSignedUp=false')
      })
    })(req, res, next)
}

module.exports = {
    logInHandler
}