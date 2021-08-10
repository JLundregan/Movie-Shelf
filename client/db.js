var Datastore = require('nedb');
var db = {};
db.movies = new Datastore({filename: './client/Files/data.db', autoload: true});
db.series = new Datastore({filename: './client/Files/series.db', autoload: true});

module.exports = db;
