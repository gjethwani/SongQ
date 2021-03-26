const UserModel = require('../models/user')
const { log } = require('../util')

const changeShouldSendEmailHandler = (req, res) => {
    const { userId } = req.session
    const { shouldSendEmail } = req.body
    if (shouldSendEmail === undefined) {
        return res.status(400).json({ err: 'no emailPreference'})
    }
    UserModel.findOne({ userId }, (err, user) => {
        if (err) {
            log('/change-should-send-email', userId, `[mongoose-find-err] ${JSON.stringify(err)}`)
            return res.status(500).send()
        }
        user.shouldSendEmail = shouldSendEmail
        user.save()
            .then(() => {
                return res.status(200).send()
            })
            .catch(err => {
                log('/change-should-send-email', userId, `[mongoose-save-err] ${JSON.stringify(err)}`)
                return res.status(500).send()
            })
    })
}

module.exports = {
    changeShouldSendEmailHandler
}