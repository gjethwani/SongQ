const { getCurrentUnixTimeStamp, getUser } = require('../util')

const authenticateSpotifyHandler = async function(req, res) {
    if (!req.user) {
      res.status(401).send()
    } else {
      // var user = 
      getUser(req.user)
        .then(function(user) {
          if (user.accessToken === null) {
            return res.status(200).json({ 
              needToSpotifyAuth: true,
              spotifyRefresh: false,
              isLoggedIn: true
            })
          }
          if ((user.expiresAt - getCurrentUnixTimeStamp()) <= 0) {
            return res.status(200).json({
              needToSpotifyAuth: true,
              spotifyRefresh: true,
              isLoggedIn: true
            })
          }
          return res.status(200).json({
            needToSpotifyAuth: false,
            isLoggedIn: true
          })
        })
        .catch(function(err) {
          if (err.err === 'No User') {
            return res.status(200).json({
              isLoggedIn: false
            })
          } else {
            return res.status(500).send({ err: JSON.stringify(err) })
          }
        })      
    }
}

module.exports = {
    authenticateSpotifyHandler
}