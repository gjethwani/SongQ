const UserModel = require('../models/user')
const RequestModel = require('../models/request')
const { log } = require('../util')

const getUserDetailsHandler = (req, res) => {
    const { userId } = req.session
    UserModel.findOne({ userId }, async (err, user) => {
        if (err) {
            log('/get-user-details', userId, `[mongoose-find-err] ${JSON.stringify(err)}`)
            return res.status(500).json({ err: JSON.stringify(err) })
        }
        if (!user) {
            log('/get-user-details', userId, `no user`)
            return res.status(404).send()
        }
        const { code, name, autoAccept, profilePicture } = user
        const userObj = {
            userId,
            code,
            name,
            autoAccept,
            profilePicture,
            requests: []
        }
        try { 
            const requests = await RequestModel.find({ userId, serviced: false})
            userObj.requests = requests
        } catch (err) {
            log('/get-user-details', userId, `[mongoose-request-find-err] ${JSON.stringify(err)}`)
            return res.status(500).json({ err: JSON.stringify(err) })
        }
        return res.status(200).json({ user: userObj })
    })
}

module.exports = {
    getUserDetailsHandler
}