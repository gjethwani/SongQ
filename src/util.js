const requestModule = require('request')
const RequestModel = require('./models/request')
const { logger } = require('./setup')

const getCurrentUnixTimeStamp = () => {
    return Math.round((new Date()).getTime() / 1000)
}

const addToQueue = (songId, accessToken, successCallback) => {
    return new Promise((resolve, reject) => {
        const options = {
            url: `https://api.spotify.com/v1/me/player/queue?uri=spotify:track:${songId}`,
            headers: {
                'Authorization': `Bearer ${accessToken}` 
            },
            json: true
        }
        requestModule.post(options, async (error, response, body) => {
            if (!error && response.statusCode >= 200 && response.statusCode < 300) {
                resolve(successCallback())
            } else {
                if (error) {
                    reject({
                        status: 500,
                        mesage: JSON.stringify(error)
                    })
                } else {
                    if (response.statusCode === 404) {
                        reject({
                            status: 404,
                            message: 'no queue'
                        })
                    } else {
                        reject({
                            status: response.statusCode,
                            message: `spotify error ${JSON.stringify(body)}`
                        })
                    }
                    
                }
            }
        })
    })
    
}

const getRecentlyApproved = (userId, limit) => {
    return new Promise((resolve, reject) => {
        RequestModel.find({ userId, accepted: true }, {}, { sort: { 'createdAt': -1}}, (err, requests) => {
            if (err) {
                reject(err)
            }
            resolve(requests)
        })
        .limit(limit)
    })
}

const getUsersTopTracks = (accessToken, max) => {
    return new Promise((resolve, reject) => {
        const options = {
            url: `https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=${max}`,
            headers: {
                'Authorization': `Bearer ${accessToken}` 
            },
            json: true
        }
        requestModule.get(options, (error, response, body) => {
            if (!error && response.statusCode >= 200 && response.statusCode < 300) {
                const { items } = body
                const trackIds = []
                for (let i = 0; i < items.length; i++) {
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

const log = (endpoint, userId, message) => {
    if (process.env.ENV === 'local') {
        console.log(message)
        return
    }
    endpoint = endpoint.substring(1)
    logger.log(`[ID: ${userId}] ${message}`, [endpoint], err => {
        if (err) {
            console.log('Logger Error', JSON.stringify(err))
        }
    })
}

module.exports = {
    getCurrentUnixTimeStamp,
    addToQueue,
    getRecentlyApproved,
    getUsersTopTracks,
    joinArtists,
    log
}