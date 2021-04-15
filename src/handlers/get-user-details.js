const UserModel = require('../models/user')
const RequestModel = require('../models/request')
const { getUsersTopTracks, log } = require('../util')
const request = require('request')

const getAudioFeatures = (accessToken, trackIds) => {
    return new Promise((resolve, reject) => {
        const options = {
            url: `https://api.spotify.com/v1/audio-features?ids=${trackIds}`,
            headers: {
                'Authorization': `Bearer ${accessToken}` 
            },
            json: true
        }
        request.get(options, (error, response, body) => {
            if (!error && response.statusCode >= 200 && response.statusCode < 300) {
                resolve(body['audio_features'])
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

const getUserDetailsHandler = async (req, res) => {
    const { userId, accessToken } = req.session
    UserModel.findOne({ userId }, async (err, user) => {
        if (err) {
            log('/get-user-details', userId, `[mongoose-find-err] ${JSON.stringify(err)}`)
            return res.status(500).json({ err: JSON.stringify(err) })
        }
        if (!user) {
            log('/get-user-details', userId, `no user`)
            return res.status(404).send()
        }
        getUsersTopTracks(accessToken, 20)
            .then(topTracks => {
                getAudioFeatures(accessToken, topTracks)
                    .then(averages => {
                        user.topTracks = averages
                        user.save()
                    })
            })
            .catch(err => {
                log('/get-user-details', userId, `get top tracks err ${JSON.stringify(err)}`)
            })
        const { 
            code, 
            name, 
            autoAccept, 
            profilePicture, 
            emailPreference 
        } = user
        const userObj = {
            userId,
            code,
            name,
            autoAccept,
            profilePicture,
            requests: [],
            emailPreference
        }
        try { 
            const requests = await RequestModel.find({ userId, serviced: false})
            userObj.requests = requests
        } catch (err) {
            log('/get-user-details', userId, `[mongoose-request-find-err] ${JSON.stringify(err)}`)
            return res.status(500).json({ err: JSON.stringify(err) })
        }
        return res.status(200).json({ user: userObj })
    })
}

module.exports = {
    getUserDetailsHandler
}