const { passport } = require('../passport')

const logInHandler = function(req, res, next) {
    return passport.authenticate('local', { failureFlash: true}, function(err, user, info) {
      if (err) { 
        return res.status(500).json({ err: JSON.stringify(err) }) 
      }
      if (!user) { 
        return res.status(401).json({
          err: info
        }) 
      } else {
        return req.logIn(user, function(err) {
          if (err) { 
            return res.status(500).send({ err: JSON.stringify(err) })
          } else {
            return res.redirect(`/authenticate-spotify?justSignedUp=false`)
          }
        })
      }
    })(req, res, next)
}

module.exports = {
    logInHandler
}