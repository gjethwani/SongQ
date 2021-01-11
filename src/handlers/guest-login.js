const request = require('request')
const { getCurrentUnixTimeStamp, log } = require('../util')

const guestLoginHandler = (req, res) => {
    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: {
            'Authorization': 'Basic ' + (new Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64'))
        },
        form: {
            grant_type: 'client_credentials'
        },
        json: true
    }
    request.post(authOptions, (error, response, body) => {
        if (!error && response.statusCode >= 200 && response.statusCode < 300) {
            req.session.ccTokenInfo = {
                token: body.access_token,
                expiresAt: getCurrentUnixTimeStamp() + body.expires_in
            }
            return res.status(200).send()
        } else {
            if (error) {
                log('/guest-login', '', `[request-module-err] ${JSON.stringify(error)}`)
                return res.status(500).json({ err: JSON.stringify(error) })
            }
            log('/guest-login', '', `[guest-login-err] ${JSON.stringify(body)}`)
            return res.status(response.statusCode).send()
        }
    })
}

module.exports = {
    guestLoginHandler
}