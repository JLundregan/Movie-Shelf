const express = require('express');
const cors = require('cors');
const scraper = require("./scraper");

const app = express();
app.use(cors());

app.get('/', (req, res) => {
  res.json({
    message: 'Scraping is Fun!'
  })
})


// URL will look like /search/star wars, or /search/the conjuring, etc.
app.get('/search/:title', (req, res) => {
  scraper
  .searchMovies(req.params.title)
  .then(movies => {
    res.json(movies);
  });
});

app.get('/movie/:imdbID', (req, res) => {
  scraper
  .getMovie(req.params.imdbID)
  .then(movie => {
    res.json(movie);
  });
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on ${port}`);
});
