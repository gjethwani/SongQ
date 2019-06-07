const { knex } = require('./knex')
var bookshelfModule = require('bookshelf')
var bookshelf = bookshelfModule(function() {
    return knex({
        client: 'sqlite3',
        connection: {
          filename: process.env.DB_PATH
        },
        useNullAsDefault: true
    })
})


var User = bookshelf.Model.extend({
    tableName: 'Users',
    playlists: function() {
        return this.hasMany(Playlists)
    }
})

var Playlists = bookshelf.Model.extend({
    tableName: 'Playlists',
    requests: function() {
        return this.hasMany(Requests)
    }
})

var Requests = bookshelf.Model.extend({
    tableName: 'Requests',
})

// new User({'email': 'gjethwani1@gmail.com'})
//     .fetch()
//     .then(function(model) {
//         console.log(model.get('password'))
//     })

User.where('email', 'gjethwani1@gmail.com')
    .fetch()
    .then(function(model) {
        console.log(model)
    })