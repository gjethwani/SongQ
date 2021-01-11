const UserModel = require('../models/user')
const { log } = require('../util')

const getUserNameHandler = (req, res) => {
    const { userId } = req.query
    UserModel.findOne({ userId }, async (err, user) => {
        if (err) {
            log('/get-user-name', userId, `[mongoose-find-err] ${JSON.stringify(err)}`)
            return res.status(500).json({ err: JSON.stringify(err) })
        }
        if (!user) {
            log('/get-user-name', userId, `no user`)
            return res.status(404).send()
        }
        return res.status(200).json({ name: user.name })
    })
}

module.exports = {
    getUserNameHandler
}