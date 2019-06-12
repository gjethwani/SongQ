const { getCurrentUnixTimeStamp, getUser } = require('../util')

const authenticateSpotifyHandler = async function(req, res) {
    if (!req.user) {
      res.status(401).send()
    } else {
      var { justSignedUp } = req.query
      if (justSignedUp === 'true') {
        justSignedUp = true
      } else {
        justSignedUp = false
      }
      if (justSignedUp) {
        res.status(200).json({ 
          needToSpotifyAuth: true,
          spotifyRefresh: false
        })
        return
      } else {
        var user = await getUser(req.user)
        if (user.accessToken === null) {
          res.status(200).json({ 
            needToSpotifyAuth: true,
            spotifyRefresh: false
          })
          return
        }
        if ((user.expiresAt - getCurrentUnixTimeStamp()) <= 0) {
          res.status(200).json({
            needToSpotifyAuth: true,
            spotifyRefresh: true
          })
          return
        }
        res.status(200).json({
          needToSpotifyAuth: false
        })
      }
    }
}

module.exports = {
    authenticateSpotifyHandler
}