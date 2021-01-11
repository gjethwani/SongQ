const UserModel = require('../models/user')
const { log } = require('../util')

const getQueueByCodeHandler = (req, res) => {
    let { code } = req.query
    if (!code) {
        log('/get-queue-by-code', '', 'no code')
        return res.status(400).send()
    }
    code = decodeURIComponent(code)
    UserModel.findOne({ code }, (err, user) => {
        if (err) {
            log('/get-queue-by-code', code, `[mongoose-find-err] ${JSON.stringify(err)}`)
            return res.status(500).json({ err: JSON.stringify(err) })
        }
        if (!user) {
            log('/get-queue-by-code', code, `no user`)
            return res.status(404).send()
        }
        return res.status(200).json({ userId: user.userId })
    })
}

module.exports = {
    getQueueByCodeHandler
}