const FeedbackSchema = require('../models/feedback')
const { log } = require('../util')

const submitFeedbackHandler = (req, res) => {
    const { feedback, rating } = req.body
    const { userId } = req.session
    if (!feedback) {
        return res.status(400).json({ err: 'feedback required'})
    }
    const feedbackObject = new FeedbackSchema({ feedback, rating, userId })
    feedbackObject.save()
        .then(() => {
            return res.status(200).send()
        })
        .catch(err => {
            log('/submit-feedback', '', `[mongoose-save-err] ${JSON.stringify(err)}`)
            return res.status(500).send()
        })
}

module.exports = {
    submitFeedbackHandler
}