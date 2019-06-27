const { knex } = require('../knex')

function getRequests(roomCode) {
    return new Promise(function(resolve, reject) {
        knex('Requests')
            .where({ roomCode, serviced: false })
            .then(function(rows) {
                resolve(rows)
            })
            .catch(function(err) {
                reject(err)
            })
    })
}

const getRequestsHandler = function(req, res) {
    if (!req.user) {
        res.status(401).send()
    } else {
        var { roomCode } = req.query
        getRequests(roomCode)
            .then(function(rows) {
                res.status(200).json({ 
                    requests: rows 
                })
            })
            .catch(function(err) {
                console.log(err)
                res.status(500).json({ err: JSON.stringify(err) })
            })
    }
}

module.exports = {
    getRequestsHandler
}