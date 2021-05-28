const { app } = require('./setup')
const { nowPlayingHandler } = require('./handlers/now-playing')
const { guestLoginHandler } = require('./handlers/guest-login')
const { makeRequestHandler, sendEmailNotification } = require('./handlers/make-request')
const { searchSongsHandler } = require('./handlers/search-songs')
const { serviceRequestHandler } = require('./handlers/service-request')
const { spotifyLogInHandler } = require('./handlers/spotify-login')
const { spotifyRedirectHandler } = require('./handlers/spotify-redirect')
const { authenticateAuthorizationFlow } = require('./middleware/authenticate-authorization-flow')
const { authenticateClientCredentialsFlow } = require('./middleware/authenticate-client-credentials-flow')
const { getUserDetailsHandler } = require('./handlers/get-user-details')
const { getUserNameHandler } = require('./handlers/get-user-name')
const { connectHandler } = require('./handlers/connect')
const { canCreateWSConnectionHandler } = require('./handlers/can-create-ws-connection')
const { changeAutoAcceptHandler } = require('./handlers/change-auto-accept')
const { serviceAllHandler } = require('./handlers/service-all')
const { getRecentlyApprovedHandler } = require('./handlers/get-recently-approved')
const { getRequestsHandler } = require('./handlers/get-requests')
const { subscribeHandler } = require('./handlers/subscribe')
const { getRecommendationHandler } = require('./handlers/get-recommendation')
const { submitFeedbackHandler } = require('./handlers/submit-feedback')
const { changeEmailPreferenceHandler } = require('./handlers/change-email-preference')
const { changeShouldSendEmailHandler } = require('./handlers/change-should-send-email')
const { getLatestRequests } = require('./handlers/get-latest-requests')

app.get('/now-playing', authenticateAuthorizationFlow, nowPlayingHandler)

app.post('/guest-login', guestLoginHandler)

app.get('/get-user-name', authenticateClientCredentialsFlow, getUserNameHandler)

app.post('/make-request', authenticateClientCredentialsFlow, makeRequestHandler)

app.post('/search-songs', authenticateClientCredentialsFlow, searchSongsHandler)

app.post('/service-request', authenticateAuthorizationFlow, serviceRequestHandler)

app.get('/spotify-login', spotifyLogInHandler)

app.get('/spotify-redirect', spotifyRedirectHandler)

app.get('/get-user-details', authenticateAuthorizationFlow, getUserDetailsHandler)

app.post('/can-create-ws-connection', authenticateAuthorizationFlow, canCreateWSConnectionHandler)

app.post('/change-auto-accept', authenticateAuthorizationFlow, changeAutoAcceptHandler)

app.post('/service-all', authenticateAuthorizationFlow, serviceAllHandler)

app.get('/get-recently-approved', authenticateClientCredentialsFlow, getRecentlyApprovedHandler)

app.get('/get-requests', authenticateAuthorizationFlow, getRequestsHandler)

app.get('/get-recommendation', authenticateAuthorizationFlow, getRecommendationHandler)

app.post('/submit-feedback', authenticateAuthorizationFlow, submitFeedbackHandler)

app.post('/change-email-preference', authenticateAuthorizationFlow, changeEmailPreferenceHandler)

app.post('/change-should-send-email', authenticateAuthorizationFlow, changeShouldSendEmailHandler)

app.get('/get-latest-requests', getLatestRequests)

app.get('/subscribe', subscribeHandler)

app.ws('/connect', connectHandler)

const port = process.env.PORT || 5000
app.listen(port, function () {
  console.log(`Listening on port ${port}`)
})