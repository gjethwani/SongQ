const UserModel = require('../models/user')
const { log } = require('../util')

const changeEmailPreferenceHandler = (req, res) => {
    const { userId } = req.session
    const { emailPreference } = req.body
    if (!emailPreference) {
        return res.status(400).json({ err: 'no emailPreference'})
    }
    if (emailPreference !== 'none' && emailPreference !== 'unreadRequests' && emailPreference !== 'allRequests') {
        return res.status(400).json({ err: 'invalid emailPreference'})
    }
    UserModel.findOne({ userId }, (err, user) => {
        if (err) {
            log('/change-email-preference', userId, `[mongoose-find-err] ${JSON.stringify(err)}`)
            return res.status(500).send()
        }
        user.emailPreference = emailPreference
        user.shouldSendEmail = emailPreference !== "none"
        user.save()
            .then(() => {
                return res.status(200).send()
            })
            .catch(err => {
                log('/change-email-preference', userId, `[mongoose-save-err] ${JSON.stringify(err)}`)
                return res.status(500).send()
            })
    })
}

module.exports = {
    changeEmailPreferenceHandler
}