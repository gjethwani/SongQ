

const isLoggedInHandler = function(req, res) {
    return res.redirect('/authenticate-spotify?justSignedUp=false')
}

module.exports = {
    isLoggedInHandler
}