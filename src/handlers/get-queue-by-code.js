const UserModel = require('../models/user')

const getQueueByCodeHandler = (req, res) => {
    let { code } = req.query
    if (!code) {
        return res.status(400).send()
    }
    code = decodeURIComponent(code)
    UserModel.findOne({ code }, (err, user) => {
        if (err) {
            return res.status(500).json({ err: JSON.stringify(err) })
        }
        if (!user) {
            return res.status(404).send()
        }
        return res.status(200).json({ userId: user.userId })
    })
}

module.exports = {
    getQueueByCodeHandler
}