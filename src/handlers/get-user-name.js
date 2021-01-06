const UserModel = require('../models/user')

const getUserNameHandler = (req, res) => {
    const { userId } = req.query
    UserModel.findOne({ userId }, async (err, user) => {
        if (err) {
            return res.status(500).json({ err: JSON.stringify(err) })
        }
        if (!user) {
            return res.status(404).send()
        }
        return res.status(200).json({ name: user.name })
    })
}

module.exports = {
    getUserNameHandler
}