const request = require('request')
const RequestModel = require('../models/request')
const { getRecentlyApproved, log } = require('../util')

const joinArtists = artistsRaw => {
    let result = ''
    for (let i = 0; i < artistsRaw.length; i++) {
        result += artistsRaw[i].name
        if (i < artistsRaw.length - 1) {
            result += ', '
        }
    }
    return result
}

const getUsersTopTracks = accessToken => {
    return new Promise((resolve, reject) => {
        const options = {
            url: "https://api.spotify.com/v1/me/top/tracks?time_range=short_term",
            headers: {
                'Authorization': `Bearer ${accessToken}` 
            },
            json: true
        }
        request.get(options, (error, response, body) => {
            if (!error && response.statusCode >= 200 && response.statusCode < 300) {
                const { items } = body
                const trackIds = []
                for (let i = 0; i < 5; i++) {
                    if (i >= items.length) {
                        break
                    }
                    trackIds.push(items[i].id)
                }
                resolve(trackIds)
            } else {
                if (error) {
                    reject({ error })
                } else {
                    reject({ body, statusCode: response.statusCode })
                }
            }
        })
    })
}

const getRecommendationHandler = (req, res) => {
    const { userId, accessToken } = req.session
    getRecentlyApproved(userId, 5)
        .then(async requests => {
            let requestsString = ''
            if (requests.length > 0) {
                for (let i = 0; i < requests.length; i++) {
                    requestsString += requests[i].songId
                    if (i < requests.length - 1) {
                        requestsString += ','
                    }
                }
            } else {
                try {
                    const trackIds = await getUsersTopTracks(accessToken)
                    requestsString = trackIds.join(',')
                } catch(err) {
                    log('/get-recommendation', userId, `[user-top-tracks] ${JSON.stringify(err)}`)
                    return res.status(500).send()
                }
            }
            const options = {
                url: `https://api.spotify.com/v1/recommendations?seed_tracks=${requestsString}&limit=1`,
                headers: {
                    'Authorization': `Bearer ${accessToken}` 
                },
                json: true
            }
            request.get(options, async (error, response, body) => {
                if (!error && response.statusCode >= 200 && response.statusCode < 300) {
                    const { tracks } = body
                    if (tracks) {
                        const track = tracks[0]
                        const recommendation = new RequestModel({
                            userId,
                            songId: track.id,
                            songName: track.name,
                            artists: joinArtists(track.artists),
                            album: track.album.name,
                            albumArt: track.album.images[0].url,
                            serviced: false,
                            recommended: true
                        })
                        try {
                            await recommendation.save()
                            return res.status(200).json({ recommendation })
                        } catch(err) {
                            log('/get-recommendation', userId, `[mongoose-save-err] ${JSON.stringify(err)}`)
                            return res.status(500).send()
                        }
                    } else {
                        return res.status(200).send()
                    }
                } else {
                    if (error) {
                        log('/get-recommendations', userId, `[request-err] ${JSON.stringify(error)}`)
                        return res.status(500).send()
                    } else {
                        log('/get-recommendations', userId, `[spotify-err] ${JSON.stringify(body)}`)
                        return res.status(response.statusCode).send()
                    }
                    
                }
            })
        })
        .catch(err => {
            log('/get-recommendations', userId, `[get-recently-approved-err] ${JSON.stringify(err)}`)
            return res.status(500).send()
        })
}

module.exports = {
    getRecommendationHandler
}