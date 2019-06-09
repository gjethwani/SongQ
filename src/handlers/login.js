const { passport } = require('../passport')

const logInHandler = function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
      if (err) { return next(err) }
      if (!user) { return res.redirect(process.env.FRONT_END_URI) }
      req.logIn(user, function(err) {
        if (err) { return next(err) }
        return res.redirect('/authenticate-spotify?justSignedUp=false')
      })
    })(req, res, next)
}

module.exports = {
    logInHandler
}