const { spotifyApi } = require('../spotify')
const axios = require('axios')

const createPlaylistHandler = function(req, res) {
    const { playlistName, playlistIsByLocation, playlistIsPublic } = req.body
    var playlistData = { playlistName }
    playlistData.owner = req.user
    if (playlistIsByLocation) {
        const { latitude, longitude } = req.boy
        playlistData.latitude = latitude
        playlistData.longitude = longitude
    } else {
        const { roomCode } = req.body
        playlistData.roomCode = roomCode
    }
    console.log(playlistName)
    // spotifyApi.createPlaylist(playlistName, { 'public' : false })
    //     .then(function(data) {
    //         console.log(data)
    //     }, function(err) {
    //         console.log('Something went wrong!', err)
    //     })
    axios.post('https://api.spotify.com/v1/users/1278127700/playlists', {
        name: playlistName,
        public: false
    }, {
        headers: {
            'Authorization': 'Bearer BQBKLRz6hnD-9wUITj7BKjaHbmGHlJqwxISFfWDfWftWbXQhDw-RNjRJTg8_0z4GtYZtLz5DjVOHHX7j0Erx5xYDvve6xp0BB4qfv-IvI1C2S5vndrtQ0zORFLqJM8Rvn3CUMHErgSscYt17crSSxq2LbeNSNZwc0nO12O7MBdMwmnLDe3wQLD0IvRCbIM6sGEfvbY2SwtPgNhfHCmMK89q0BogmWoE',
            'Content-Type': 'application/json' 
        }
    })
        .then(function(resp) {
            console.log(resp)
        })
        .catch(function(err) {
            console.log(err)
        })
}

module.exports = {
    createPlaylistHandler
}