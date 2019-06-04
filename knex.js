const knex = require('knex')({
    dialect: 'sqlite3',
    connection: {
      filename: process.env.DB_PATH
    },
    useNullAsDefault: true
})

module.exports = {
  knex
}