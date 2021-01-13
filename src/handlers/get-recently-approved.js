const RequestModel = require('../models/request')
const { log } = require('../util')

const getRecentlyApprovedHandler = (req, res) => {
    const { userId } = req.query
    RequestModel.find({ userId, accepted: true }, {}, { sort: { 'createdAt': -1}}, (err, requests) => {
        if (err) {
            log('/get-recently-approved', userId, `[mongoose-find-err] ${JSON.stringify(err)}`)
            return res.status(500).send()
        }
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
    .limit(5)
}

module.exports = {
    getRecentlyApprovedHandler
}