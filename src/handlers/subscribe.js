const SubscriberModel = require('../models/subscriber')
const { log } = require('../util')
const validator = require('validator')

const subscribeHandler = (req, res) => {
    const { email } = req.query
    if (!email) {
        log('/subscribe', '', 'no email')
        return res.status(400).json({ err: 'no email' })
    }
    if (!validator.isEmail(email)) {
        log('/subscribe', email, 'not an email')
        return res.status(400).json({ err: 'not an email'})
    }
    SubscriberModel.findOne({ email }, (err, subscriber ) => {
        if (err) {
            log('/subscribe', email, `[mongoose-find-err] ${JSON.stringify(err)}`)
        }
        if (subscriber) {
            log('/subscribe', email, `user already subscribed`)
            return res.status(200).send()
        }
        const newSubscriber = new SubscriberModel({ email })
        newSubscriber.save()
            .then(() => {
                return res.status(200).send()
            })
            .catch(err => {
                log('/subscribe', email, `[mongoose-save-err] ${JSON.stringify(err)}`)
                return res.status(500).json({ err: JSON.stringify(err) })
            })
    })
}

module.exports = {
    subscribeHandler
}