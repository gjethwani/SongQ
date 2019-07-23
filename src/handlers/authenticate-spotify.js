const { getCurrentUnixTimeStamp, getUser } = require('../util')

const authenticateSpotifyHandler = async function(req, res) {
  console.log("here7")
    if (!req.user) {
      console.log("here8")
      res.status(401).send()
    } else {
      var user = await getUser(req.user)
      if (user.accessToken === null) {
        console.log("here5")
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
      console.log("here6")
      res.status(200).json({
        needToSpotifyAuth: false
      })
    }
}

module.exports = {
    authenticateSpotifyHandler
}