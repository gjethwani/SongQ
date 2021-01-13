const requestModule = require('request')
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

const log = (endpoint, userId, message) => {
    if (process.env.ENV === 'local') {
        console.log(message)
        return
    }
    endpoint = endpoint.substring(1)
    logger.log(`[ID: ${userId}] ${message}`, [endpoint], err => {
        if (err) {
            console.log(err)
            console.log('Logger Error', JSON.stringify(err))
        }
    })
}

module.exports = {
    getCurrentUnixTimeStamp,
    addToQueue,
    log
}