const { app, swaggerUi, swaggerDocument } = require('./setup')
const { changeQueueActivationHandler } = require('./handlers/change-queue-activation')
const { getQueueByCodeHandler } = require('./handlers/get-queue-by-code')
const { getRequestsHandler } = require('./handlers/get-requests')
const { guestLoginHandler } = require('./handlers/guest-login')
const { makeRequestHandler } = require('./handlers/make-request')
const { searchSongsHandler } = require('./handlers/search-songs')
const { serviceRequestHandler } = require('./handlers/service-request')
const { spotifyLogInHandler } = require('./handlers/spotify-login')
const { spotifyRedirectHandler } = require('./handlers/spotify-redirect')
const { authenticateAuthorizationFlow } = require('./middleware/authenticate-authorization-flow')
const { authenticateClientCredentialsFlow } = require('./middleware/authenticate-client-credentials-flow')
const { getUserDetailsHandler } = require('./handlers/get-user-details')

app.patch('/change-queue-activation', authenticateAuthorizationFlow, changeQueueActivationHandler)

app.get('/get-queue-by-code', getQueueByCodeHandler)

app.get('/get-requests', authenticateAuthorizationFlow, getRequestsHandler)

app.post('/guest-login', guestLoginHandler)

app.post('/make-request', makeRequestHandler)

app.post('/search-songs', authenticateClientCredentialsFlow, searchSongsHandler)

app.post('/service-request', authenticateAuthorizationFlow, serviceRequestHandler)

app.get('/spotify-login', spotifyLogInHandler)

app.get('/spotify-redirect', spotifyRedirectHandler)

app.get('/get-user-details', authenticateAuthorizationFlow, getUserDetailsHandler)

app.get('/api-docs', swaggerUi.setup(swaggerDocument))

const port = process.env.PORT || 5000
app.listen(port, function () {
  console.log(`Listening on port ${port}`)
})