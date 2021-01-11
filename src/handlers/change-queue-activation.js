const UserModel = require('../models/user')
const fs = require('fs')
const { log } = require('../util')

const isCodeUnique = (code) => {
    return new Promise((resolve, reject) => {
        UserModel.findOne({ code, queueActivated: true }, (err, user) => {
            if (err) {
                reject(err)
            } else {
                if (user) {
                    resolve(false)
                } else {
                    resolve(true)
                }
            }
        })
    })
}

const getWord = (path) => {
    const wordsRaw = fs.readFileSync(path).toString()
    const words = wordsRaw.split(/[ \n]+/)
    let word = ''
    while (word === '') {
        const index = Math.floor(Math.random() * words.length)
        word = words[index].trim()
    }
    return word.toLowerCase()
}

const generateCode = () => {
    const adjective = getWord('words/adjectives.txt')
    const noun = getWord('words/nouns.txt')
    return adjective + " " + noun
}

const changeQueueActivationHandler = (req, res) => {
    let { userId, activated } = req.body
    if (!userId || activated === undefined) {
        if (!userId) {
            log('/change-queue-activation', userId, `no userId`)
        }
        if (activated === undefined) {
            log('/change-queue-activation', userId, `activated undefined`)
        }
        return res.status(400).send()
    }
    activated = JSON.parse(activated)
    UserModel.findOne({ userId }, async (err, user) => {
        if (err) {
            log('/change-queue-activation', userId, `[mongoose-find-err] ${JSON.stringify(err)}`)
            return res.status(500).json({ err: JSON.stringify(err) })
        }
        if (!user) {
            log('/change-queue-activation', userId, `no user found`)
            return res.status(404).json()
        }
        if (!user.queueActivated && activated) {
            let code
            let unique = false
            while (!unique) {
                code = generateCode()
                try {
                    unique = await isCodeUnique(code)
                } catch (err) {
                    log('/change-queue-activation', userId, `[unique-code-err] ${JSON.stringify(err)}`)
                    return res.status(500).json({ err: JSON.stringify(err) })
                } 
            }
            user.code = code
        }
        user.queueActivated = activated
        user.save()
            .then(() => {
                return res.status(200).send()
            })
            .catch(err => {
                log('/change-queue-activation', userId, `[mongoose-save-err] ${JSON.stringify(err)}`)
                return res.status(500).json({ err: JSON.stringify(err) })
            })
    })
}

module.exports = {
    changeQueueActivationHandler
}