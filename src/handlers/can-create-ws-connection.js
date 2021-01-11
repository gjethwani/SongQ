const WSConnectionModel = require('../models/ws-connection')
const { log } = require('../util')

const canCreateWSConnectionHandler = (req, res) => {
    const { userId } = req.session
    WSConnectionModel.findOneAndDelete({ userId }, async (err) => {
        if (err) {
            log('/can-create-ws-connection', userId, `[mongodb-delete-err] ${JSON.stringify(err)}`)
        } else {
            const newConnection = new WSConnectionModel({ userId })
            try { 
                const doc = await newConnection.save()
                return res.status(200).json({ id: doc._id })
            } catch(err) {
                log('/can-create-ws-connection', userId, `[mongodb-save-err] ${JSON.stringify(err)}`)
                return res.status(500).json({ err: JSON.stringify(err) })
            }
        }
    })
}

module.exports = {
    canCreateWSConnectionHandler
}