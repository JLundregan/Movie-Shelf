var Datastore = require('nedb');
var path = require('path');
var db = {};

const movieFile = path.join(__dirname, '../db/data.db').replace('app.asar', 'app.asar.unpacked');
const seriesFile = path.join(__dirname, '../db/series.db').replace('app.asar', 'app.asar.unpacked');
db.movies = new Datastore({filename: movieFile, autoload: true});
db.series = new Datastore({filename: seriesFile, autoload: true});

module.exports = db;
