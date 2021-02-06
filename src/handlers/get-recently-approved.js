const RequestModel = require('../models/request')
const { log, getRecentlyApproved } = require('../util')

const getRecentlyApprovedHandler = (req, res) => {
    const { userId } = req.query
    getRecentlyApproved(userId, 5)
        .then(requests => {
            const formattedRequests = []
            requests.forEach(r => {
                formattedRequests.push({
                    songName: r.songName,
                    artists: r.artists,
                    albumArt: r.albumArt
                })
            })
            return res.status(200).json({ requests: formattedRequests })
        })
        .catch(err => {
            log('/get-recently-approved', userId, `[mongoose-find-err] ${JSON.stringify(err)}`)
            return res.status(500).send()
        })
}

module.exports = {
    getRecentlyApprovedHandler
}