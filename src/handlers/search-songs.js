const request = require('request')
const { log } = require('../util')

const searchSongsHandler = (req, res) => {
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
            if (error) {
                log('/search-songs', '', `[request-module-err] ${JSON.stringify(error)}`)
                return res.status(500).json({ err: JSON.stringify(error) })
            }
            log('/search-songs', '', `[spotify-request-err] ${JSON.stringify(body)}`)
            return res.status(response.statusCode).send()
        }
    })
}

module.exports = {
    searchSongsHandler
}