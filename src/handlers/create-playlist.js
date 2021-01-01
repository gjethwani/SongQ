const request = require('request')
const fs = require('fs')
const PlaylistModel = require('../models/playlist')

const isCodeUnique = (code) => {
    return new Promise((resolve, reject) => {
        PlaylistModel.findOne({ code }, (err, playlist) => {
            if (err) {
                reject()
            } else {
                if (playlist) {
                    resolve(false)
                } else {
                    resolve(true)
                }
            }
        })
    })
}

const insertPlaylistIntoDatabase = (playlistData) => {
    return new Promise((resolve, reject) =>  {
        const playlist = new PlaylistModel(playlistData)
        playlist.save()
            .then(doc => {
                resolve(doc)
            })
            .catch(err => {
                reject(err)
            })
    })
}

// function generateCode(length) {
//     var chars = '0123456789abcdefghijklmnopqrstuvwxyz'
//     var result = '';
//     for (var i = length; i > 0; --i) {
//         result += chars[Math.floor(Math.random() * chars.length)]
//     }
//     return result
// }

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


const createPlaylistHandler = async function(req, res) {
    const { playlistName } = req.body
    if (!playlistName) {
        return res.status(400).send()
    }
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
    const playlistData = {
        code,
        owner: req.session.userId,
        activated: false,
        playlistName
    }
    insertPlaylistIntoDatabase(playlistData)
        .then(playlist => {
            return res.status(200).json({ playlist })
        })
        .catch((err) => {
            return res.status(500).json({ err: JSON.stringify(err) })
        })

}

module.exports = {
    createPlaylistHandler
}