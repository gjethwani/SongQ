const RequestModel = require('../models/request')

const getRequestsHandler = function(req, res) {
    RequestModel.find({ userId: req.session.userId, serviced: false }, (err, requests) => {
        if (err) {
            return res.status(500).json({ err: JSON.stringify(err) })
        }
        return res.status(200).json({ requests })
    })
}

module.exports = {
    getRequestsHandler
}