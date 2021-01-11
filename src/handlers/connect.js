const connectHandler = (ws, req) => {
  const { id } = req.query
  if (!id) {
    ws.send('unauthenticated')
    return
  }
  ws.id = id
}

module.exports = {
    connectHandler
}