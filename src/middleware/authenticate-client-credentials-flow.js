const { getCurrentUnixTimeStamp, log } = require('../util')
const request = require('request')

const authenticateClientCredentialsFlow = (req, res, next) => {
    const { ccTokenInfo } = req.session
    if (!ccTokenInfo) {
        return res.status(401).json({ err: 'no ccTokenInfo' })
    }
    const { expiresAt } = ccTokenInfo
    if (expiresAt - getCurrentUnixTimeStamp() <= 0) {
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
                next()
              } else {
                if (err) {
                    log('/authenticate-client-credentials-flow', '', `[requst-module-err] ${JSON.stringify(err)}`)
                    return res.status(500).json({ err: JSON.stringify(err) })
                }
                log('/authenticate-client-credentials-flow', '', `[spotify-err] ${JSON.stringify(body)}`)
                return res.status(response.statusCode).json()
            }
        })
    } else {
        next()
    }
}

module.exports = {
    authenticateClientCredentialsFlow
}