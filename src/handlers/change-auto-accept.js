const UserModel = require('../models/user')
const request = require('request')

const changeAutoAccept = (userId, autoAccept) => {
    return new Promise((resolve, reject) => {
        UserModel.findOne({ userId }, (err, user) => {
            if (err) {
                reject({
                    status: 500,
                    message: JSON.stringify(err)
                })
            }
            if (!user) {
                reject({
                    status: 404,
                    message: 'no user'
                })
            }
            user.autoAccept = autoAccept
            user.save()
                .then(() => {
                    resolve({
                        status: 200
                    })
                })
                .catch(err => {
                    reject({
                        status: 500,
                        message: JSON.stringify(err)
                    })
                })
        })
    })
}

const changeAutoAcceptHandler = (req, res) => {
    let { autoAccept } = req.body
    if (autoAccept === undefined) {
        return res.status(400).send()
    }
    autoAccept = JSON.parse(autoAccept)
    if (autoAccept)  {
        const options = {
            url: `https://api.spotify.com/v1/me/player`,
            headers: {
                'Authorization': `Bearer ${req.session.accessToken}`
            },
            json: true
        }
        request.get(options, (error, response, body) => {
            if (!error && response.statusCode >= 200 && response.statusCode < 300) {
                if (!body) {
                    return res.status(404).json({ err: 'queue inactive' })
                }
                changeAutoAccept(req.session.userId, autoAccept)
                    .then(() => {
                        return res.status(200).send()
                    })
                    .catch(response => {
                        return res.status(response.status, response.message)
                    })
            } else {
                if (error) {
                    return res.status(500).json({ err: JSON.stringify(error) })
                }
                return res.status(response.statusCode).send()
            }
        })
    } else {
        changeAutoAccept(req.session.userId, autoAccept)
            .then(() => {
                return res.status(200).send()
            })
            .catch(response => {
                return res.status(response.status, response.message)
            })
    }
}

module.exports = {
    changeAutoAcceptHandler
}