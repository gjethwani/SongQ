const request = require('request')
const { getCurrentUnixTimeStamp } = require('../util')

const guestLoginHandler = function(req, res) {
    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: {
            'Authorization': 'Basic ' + (new Buffer(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64'))
        },
        form: {
            grant_type: 'client_credentials'
        },
        json: true
    }
    request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            req.session.ccTokenInfo = {
                token: body.access_token,
                expiresAt: getCurrentUnixTimeStamp() + body.expires_in
            }
            res.status(200).send()
        } else {
            res.status(response.statusCode).json({
                body: response.body,
                err: error
            })
        }
    })
}

module.exports = {
    guestLoginHandler
}