const { passport } = require('../passport')

const logInHandler = function(req, res, next) {
  console.log(process.env)
    passport.authenticate('local', { failureFlash: true}, function(err, user, info) {
      if (err) { 
        res.status(500).json({ err: JSON.stringify(err) }) 
      }
      if (!user) { 
        console.log("here1")
        console.log(info)
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