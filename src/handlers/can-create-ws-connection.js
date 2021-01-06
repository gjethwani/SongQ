const WSConnectionModel = require('../models/ws-connection')

const canCreateWSConnectionHandler = (req, res) => {
    const { userId } = req.session
    WSConnectionModel.findOneAndDelete({ userId }, async (err) => {
        if (err) {
          console.log(err)
        } else {
            const newConnection = new WSConnectionModel({ userId })
            try { 
                const doc = await newConnection.save()
                return res.status(200).json({ id: doc._id })
            } catch(err) {
                return res.status(500).json({ err: JSON.stringify(err) })
            }
        }
    })
}

module.exports = {
    canCreateWSConnectionHandler
}