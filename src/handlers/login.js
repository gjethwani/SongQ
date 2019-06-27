const { passport } = require('../passport')

const logInHandler = function(req, res, next) {
    passport.authenticate('local', { failureFlash: true}, function(err, user, info) {
      if (err) { 
        res.status(500).json({ err: JSON.stringify(err) }) 
      }
      if (!user) { 
        return res.status(401).json({
          err: info
        }) 
      }
      req.logIn(user, function(err) {
        if (err) { 
          res.status(500).send({ err: JSON.stringify(err) })
          return
        }
        return res.redirect('/authenticate-spotify?justSignedUp=false')
      })
    })(req, res, next)
}

module.exports = {
    logInHandler
}