const requestModule = require('request')

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
                    }
                    reject({
                        status: response.statusCode,
                        message: 'spotify error'
                    })
                }
            }
        })
    })
    
}

module.exports = {
    getCurrentUnixTimeStamp,
    addToQueue
}