const { isClientCredentialsTokenValid } = require('../util')
const request = require('request')

const searchSongsHandler = function(req, res) {
    var { ccTokenInfo } = req.session
    if (!isClientCredentialsTokenValid(ccTokenInfo)) {
        res.status(401).send()
    } else {
        var { q } = req.body
        var { token } = ccTokenInfo
        var type = "track"
        var options = {
            url: `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=${type}`,
            headers: {
                'Authorization': `Bearer ${token}`
            },
            json: true
        }
        request.get(options, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                res.status(200).json({
                    results: body
                })
            } else {
                res.status(response.statusCode).json({
                    body: response.body,
                    err: error
                })
            }
        })
    }
}

module.exports = {
    searchSongsHandler
}