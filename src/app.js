const { app, swaggerUi, swaggerDocument } = require('./setup')
const { signUpHandler } = require('./handlers/sign-up')
const { logInHandler } = require('./handlers/login')
const { isLoggedInHandler } = require('./handlers/is-logged-in')
const { spotifyLogInHandler } = require('./handlers/spotify-login')
const { spotifyRedirectHandler } = require('./handlers/spotify-redirect')
const { authenticateSpotifyHandler } = require('./handlers/authenticate-spotify')
const { spotifyRefreshTokenHandler } = require('./handlers/spotify-refresh-token')
const { createPlaylistHandler } = require('./handlers/create-playlist')
const { guestLoginHandler } = require('./handlers/guest-login')
const { checkPlaylistExistsHandler } = require('./handlers/check-playlist-exists')
const { searchSongsHandler } = require('./handlers/search-songs')
const { makeRequestHandler } = require('./handlers/make-request')
const { getPlaylistsHandler } = require('./handlers/get-playlists')
const { getRequestsHandler } = require('./handlers/get-requests')
const { serviceRequestHandler } = require('./handlers/service-request')
const { getExistingPlaylistsHandler } = require('./handlers/get-existing-playlists')
const { getNearbyPlaylistsHandler } = require('./handlers/get-nearby-playlists')
const { updateSpotifyDetailsHandler } = require('./handlers/update-spotify-details')
const { getRefreshTokenHandler } = require('./handlers/get-refresh-token')
const { spotifyRefreshUpdateHandler } = require('./handlers/spotify-refresh-update')

app.post('/sign-up', signUpHandler)

app.post('/login', logInHandler)

app.post('/is-logged-in', isLoggedInHandler)

// app.post('/spotify-login', spotifyLogInHandler)

// app.get('/spotify-redirect', spotifyRedirectHandler)

app.get('/authenticate-spotify', authenticateSpotifyHandler)

// app.post('/spotify-refresh-token', spotifyRefreshTokenHandler)

app.post('/create-playlist', createPlaylistHandler)

app.post('/guest-login', guestLoginHandler)

app.post('/check-playlist-exists', checkPlaylistExistsHandler)

app.post('/search-songs', searchSongsHandler)

app.post('/make-request', makeRequestHandler)

app.get('/get-playlists', getPlaylistsHandler) //https://stackoverflow.com/questions/55247812/passport-session-works-with-postman-but-doesnt-work-with-browser

app.get('/get-requests', getRequestsHandler)

app.post('/service-request', serviceRequestHandler)

app.post('/get-existing-playlists', getExistingPlaylistsHandler)

app.get('/get-nearby-playlists', getNearbyPlaylistsHandler)

app.post('/update-spotify-details', updateSpotifyDetailsHandler)

app.post('/get-refresh-token', getRefreshTokenHandler)

app.post('/spotify-refresh-update', spotifyRefreshUpdateHandler)

app.get('/api-docs', swaggerUi.setup(swaggerDocument))

const port = process.env.PORT || 5000
app.listen(port, function () {
  console.log(`Listening on port ${port}`)
})