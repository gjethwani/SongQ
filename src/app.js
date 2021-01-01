const { app, swaggerUi, swaggerDocument } = require('./setup')
const { changePlaylistActivationHandler } = require('./handlers/change-playlist-activation')
const { createPlaylistHandler } = require('./handlers/create-playlist')
const { getPlaylistByCodeHandler } = require('./handlers/get-playlist-by-code')
const { getPlaylistsHandler } = require('./handlers/get-playlists')
const { getRequestsHandler } = require('./handlers/get-requests')
const { guestLoginHandler } = require('./handlers/guest-login')
const { makeRequestHandler } = require('./handlers/make-request')
const { searchSongsHandler } = require('./handlers/search-songs')
const { serviceRequestHandler } = require('./handlers/service-request')
const { spotifyLogInHandler } = require('./handlers/spotify-login')
const { spotifyRedirectHandler } = require('./handlers/spotify-redirect')
const { authenticateAuthorizationFlow } = require('./middleware/authenticate-authorization-flow')
const { authenticateClientCredentialsFlow } = require('./middleware/authenticate-client-credentials-flow')

app.patch('/change-playlist-activation', authenticateAuthorizationFlow, changePlaylistActivationHandler)

app.post('/create-playlist', authenticateAuthorizationFlow, createPlaylistHandler)

app.get('/get-playlist-by-code', getPlaylistByCodeHandler)

app.get('/get-playlists', authenticateAuthorizationFlow, getPlaylistsHandler)

app.get('/get-requests', authenticateAuthorizationFlow, getRequestsHandler)

app.post('/guest-login', guestLoginHandler)

app.post('/make-request', makeRequestHandler)

app.post('/search-songs', authenticateClientCredentialsFlow, searchSongsHandler)

app.post('/service-request', authenticateAuthorizationFlow, serviceRequestHandler)

app.get('/spotify-login', spotifyLogInHandler)

app.get('/spotify-redirect', spotifyRedirectHandler)

app.get('/api-docs', swaggerUi.setup(swaggerDocument))

const port = process.env.PORT || 5000
app.listen(port, function () {
  console.log(`Listening on port ${port}`)
})