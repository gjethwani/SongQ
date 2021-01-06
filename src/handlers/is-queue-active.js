const UserModel = require('../models/user')

const isQueueActivatedHandler = (req, res) => {
    const { userId } = req.body
    UserModel.findOne({ userId }, (err, user) => {
        if (err) {
            return res.status(500).json({ err: JSON.stringify(err) })
        }
        if (!user) {
            return res.status(404).send()
        }
        return res.status(200).json({ queueActivated: user.queueActivated })
    })
}

module.exports = {
    isQueueActivatedHandler
}