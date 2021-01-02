const UserModel = require('../models/user')
const fs = require('fs')

const isCodeUnique = (code) => {
    return new Promise((resolve, reject) => {
        UserModel.findOne({ code }, (err, user) => {
            if (err) {
                reject()
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
    activated = JSON.parse(activated)
    if (!userId || activated === undefined) {
        return res.status(400).send()
    }
    UserModel.findById(userId, async (err, user) => {
        if (err) {
            return res.status(500).json({ err: JSON.stringify(err) })
        }
        if (!user) {
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
                return res.status(500).json({ err: JSON.stringify(err) })
            })
    })
}

module.exports = {
    changeQueueActivationHandler
}