const RequestModel = require('../models/request')
         
const getLatestRequests = (req, res) => {
    const { username, password } = req.query
    if (username === process.env.GAUTAM_USERNAME && password === process.env.GAUTAM_PASSWORD) {
        RequestModel.find({}, {}, { sort: { 'createdAt': -1}}, (err, requests) => {
            if (err) {
                return res.send(JSON.stringify(err))
            }
            const filtered = []
            requests.forEach(request => {
                filtered.push({
                    id: request._id,
                    userId: request.userId,
                    songName: request.songName,
                    artists: request.artists,
                    album: request.album,
                    serviced: request.serviced,
                    accepted: request.accepted,
                    recommended: request.recommended,
                    createdAt: new Date(request.createdAt).toISOString(),
                    updatedAt: new Date(request.updatedAt).toISOString(),
                })
            })
            return res.send(JSON.stringify(filtered))
        })
    } else {
        return res.status(403).send()
    }
}

module.exports = {
    getLatestRequests
}