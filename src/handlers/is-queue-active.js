const UserModel = require('../models/user')
const { log } = require('../util')

const isQueueActivatedHandler = (req, res) => {
    const { userId } = req.body
    UserModel.findOne({ userId }, (err, user) => {
        if (err) {
            log('/is-queue-activated', userId, `[mongoose-find-err] ${JSON.stringify(err)}`)
            return res.status(500).json({ err: JSON.stringify(err) })
        }
        if (!user) {
            log('/is-queue-activated', userId, `no user`)
            return res.status(404).send()
        }
        return res.status(200).json({ queueActivated: user.queueActivated })
    })
}

module.exports = {
    isQueueActivatedHandler
}