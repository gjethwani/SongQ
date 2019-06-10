const { app } = require('./setup')
const { signUpHandler } = require('./handlers/sign-up')
const { logInHandler } = require('./handlers/login')
const { spotifyLogInHandler } = require('./handlers/spotify-login')
const { spotifyRedirectHandler } = require('./handlers/spotify-redirect')
const { authenticateSpotifyHandler } = require('./handlers/authenticate-spotify')
const { spotifyRefreshTokenHandler } = require('./handlers/spotify-refresh-token')
const { createPlaylistHandler } = require('./handlers/create-playlist')

app.post('/sign-up', signUpHandler)

app.post('/login', logInHandler)

app.get('/spotify-login', spotifyLogInHandler)

app.get('/spotify-redirect', spotifyRedirectHandler)

app.get('/authenticate-spotify', authenticateSpotifyHandler)

app.get('/spotify-refresh-token', spotifyRefreshTokenHandler)

app.post('/create-playlist', createPlaylistHandler)

const port = process.env.PORT || 5000
app.listen(port, function () {
  console.log(`Listening on port ${port}`)
})