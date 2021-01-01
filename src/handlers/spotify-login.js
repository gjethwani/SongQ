const spotifyLogInHandler = function(req, res) {
  const scopes = 'user-read-private user-read-email playlist-modify-public playlist-modify-private user-read-birthdate user-modify-playback-state'
  return res.redirect('https://accounts.spotify.com/authorize' +
    '?response_type=code' +
    '&client_id=' + process.env.SPOTIFY_CLIENT_ID +
    (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
    '&redirect_uri=' + encodeURIComponent(process.env.SPOTIFY_REDIRECT_URI)
  )
}

module.exports = {
    spotifyLogInHandler
}