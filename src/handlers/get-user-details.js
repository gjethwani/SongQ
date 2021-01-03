const UserModel = require('../models/user')
const RequestModel = require('../models/request')

const getUserDetailsHandler = (req, res) => {
    const { userId } = req.session
    UserModel.findOne({ userId }, async (err, user) => {
        if (err) {
            return res.status(500).json({ err: JSON.stringify(err) })
        }
        if (!user) {
            return res.status(404).send()
        }
        const { code, queueActivated } = user
        const userObj = {
            userId,
            code,
            queueActivated,
            requests: []
        }
        if (queueActivated) {
            try { 
                const requests = await RequestModel.find({ userId, serviced: false})
                userObj.requests = requests
            } catch (err) {
                return res.status(500).json({ err: JSON.stringify(err) })
            }
        }
        return res.status(200).json({ user: userObj })
    })
}

module.exports = {
    getUserDetailsHandler
}