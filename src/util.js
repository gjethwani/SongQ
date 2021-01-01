const getCurrentUnixTimeStamp = () => {
    return Math.round((new Date()).getTime() / 1000)
}

module.exports = {
    getCurrentUnixTimeStamp
}