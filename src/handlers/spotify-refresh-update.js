const { getCurrentUnixTimeStamp, updateSpotifyDetails } = require('../util')

const spotifyRefreshUpdateHandler = function(req, res) {
    if (!req.user) {
        return res.status(401).send()
    } else {
        const { accessToken, expiresIn } = req.body
        const expiresAt = getCurrentUnixTimeStamp() + expiresIn
        updateSpotifyDetails(req.user, {
            accessToken,
            expiresAt,
        })
            .then(function() {
                res.status(200).send()
                // return res.redirect(`${process.env.FRONT_END_URI}/home`)
            })
            .catch(function(err) {
                console.log(err)
                return res.status(500).json({ err: JSON.stringify(err) })
            })
    }
}

module.exports = {
    spotifyRefreshUpdateHandler
}