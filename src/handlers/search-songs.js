const { isClientCredentialsTokenValid } = require('../util')
const request = require('request')

const searchSongsHandler = function(req, res) {
    const { ccTokenInfo } = req.session
    const { q } = req.body
    const { token } = ccTokenInfo
    const type = "track"
    const options = {
        url: `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=${type}&limit=50`,
        headers: {
            'Authorization': `Bearer ${token}`
        },
        json: true
    }
    request.get(options, (error, response, body) => {
        if (!error && response.statusCode >= 200 && response.statusCode < 300) {
            return res.status(200).json({
                results: body
            })
        } else {
            if (err) {
                return res.status(500).json({ err: JSON.stringify(err) })
            }
            return res.status(response.statusCode).send()
        }
    })
}

module.exports = {
    searchSongsHandler
}