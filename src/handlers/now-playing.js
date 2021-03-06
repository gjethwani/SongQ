const request = require('request')
const { log } = require('../util')

const nowPlayingHandler = (req, res) => {
    const requestOptions = {
        url: 'https://api.spotify.com/v1/me/player/currently-playing',
        headers: {
            'Authorization': `Bearer ${req.session.accessToken}` 
        },
        json: true
    }
    request.get(requestOptions, (error, response, body) => {
        if (!error && response.statusCode >= 200 && response.statusCode < 300) {
            return res.status(200).json({ nowPlaying: body })
        } else {
            if (error) {
                log('/now-playing', req.session.userId, `[request-module-err] ${JSON.stringify(error)}`)
                return res.status(500).json({ err: JSON.stringify(err) })
            }
            log('/now-playing', req.session.userId, `[spotify-request-err] ${JSON.stringify(body)}`)
            return res.status(response.statusCode).json()
        }
    })
}

module.exports = {
    nowPlayingHandler 
}