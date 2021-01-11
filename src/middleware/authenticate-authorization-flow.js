const { getCurrentUnixTimeStamp, log } = require('../util')
const request = require('request')

const authenticateAuthorizationFlow = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ err: 'user not signed in'})
    }
    const { expiresAt } = req.session
    if (expiresAt - getCurrentUnixTimeStamp() <= 0) {
        const options = {
            url: 'https://accounts.spotify.com/api/token',
            headers: { 'Authorization': 'Basic ' + (new Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64')) },
            form: {
                grant_type: 'refresh_token',
                refresh_token: req.session.refreshToken
            },
            json: true
        }
        request.post(options, (error, response, body) => {
            if (!error && response.statusCode >= 200 && response.statusCode < 300) {
                const accessToken = body.access_token
                const refreshToken = body.refresh_token
                const expiresIn = body.expires_in
                const expiresAt = getCurrentUnixTimeStamp() + expiresIn
                req.session.accessToken = accessToken
                req.session.refreshToken = refreshToken
                req.session.expiresAt = expiresAt
                next()
            } else {
                if (error) {
                    log('/authenticate-authorization-flow', req.session.userId, `[request-module-err] ${JSON.stringify(error)}`)
                    return res.status(500).json({ err: JSON.stringify(error) })
                }
                if (response.statusCode >= 300) {
                    log('/authenticate-authorization-flow', req.session.userId, `[spotify-err] ${JSON.stringify(body)}`)
                    return res.status(response.statusCode).send()
                }
            }
        })
    } else {
        next()
    }
}

module.exports = {
    authenticateAuthorizationFlow
}