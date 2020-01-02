const { knex } = require('../knex')

const getRefreshToken = (email) => {
    return new Promise(function(resolve, reject) {
        knex('Users')
            .select('refreshToken')
            .where({ email })
            .then(function(rows) {
                if (rows.length === 0) {
                    reject('no user')
                } else {
                    resolve(rows[0].refreshToken)
                }
            })
            .catch(function(error) {
                reject(error)
            })
    })

}

const getRefreshTokenHandler = (req, res) => {
    if (!req.user) {
        return res.status(401).send()
    } else {
        getRefreshToken(req.user)
            .then(function(token) {
                return res.status(200).json({
                    token
                })
            })
            .catch(function(err) {
                return res.status(500).json({
                    err
                })
            })
    }
}

module.exports = {
    getRefreshTokenHandler
}