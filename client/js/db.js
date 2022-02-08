var Datastore = require('nedb');
var db = {};
db.movies = new Datastore({filename: './client/db/data.db', autoload: true});
db.series = new Datastore({filename: './client/db/series.db', autoload: true});

module.exports = db;
