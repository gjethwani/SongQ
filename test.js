const fs = require("fs")

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
    console.log(adjective, noun)
}

generateCode()