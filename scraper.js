//Fetch makes the request, cheerio parses it

const fetch = require('node-fetch');
const cheerio = require('cheerio');


let searchUrl  = "https://www.imdb.com/find?&s=tt&ref_=nv_sr_sm&q=";
let movieUrl = "https://www.imdb.com/title/";

const searchCache = {};
const movieCache = {};


function searchMovies(searchTerm) {
  //console.log('This is the searched URL:' + searchUrl + searchTerm);

  if(searchCache[searchTerm]){
    console.log('Serving from cache: ', searchTerm);
    return Promise.resolve(searchCache[searchTerm]);
  }

  return fetch(`${searchUrl}${searchTerm}`)
    .then(response => response.text())
    .then(body => {
      const movies = [];
      const $ = cheerio.load(body);
      $('.findResult').each(function(i, element) {
        const $element = $(element);
        const $image = $element.find('td a img');
        const $title = $element.find('td.result_text a')

        const imdbID = $title.attr('href').match(/title\/(.*)\//)[1];

        const movie = {
          image: $image.attr('src'),
          title: $title.text(),
          imdbID
        };
        movies.push(movie);
      });

      searchCache[searchTerm] = movies;

      return movies;
    });
}

function getMovie(imdbID){

  if(movieCache[imdbID]){
    console.log('Serving from cache: ', imdbID);
    return Promise.resolve(movieCache[imdbID]);
  }

  return fetch(`${movieUrl}${imdbID}`)
    .then(response => response.text())
    .then(body => {
      const $ = cheerio.load(body);
      const $title = $('.ipc-page-section div div h1');
      const title = $title.text();

      //Departing from the video
      //const metaInfo = $('.ipc-inline-list.baseAlt.ipc-inline-list--show-dividers li');
      const metaInfo = $('ul[data-testid="hero-title-block__metadata"] li');
      let metaInfoArray = []
      metaInfo.each(function(i, elm) {
        metaInfoArray.push($(this).text()); // for testing do text()
      });

      const year = metaInfoArray[0].slice(0, metaInfoArray[0].length / 2);
      const rating = metaInfoArray[1].slice(0, metaInfoArray[1].length / 2);
      const runTime = metaInfoArray[2];
      //console.log(metaInfoArray);

      const poster = $('img.ipc-image').attr('src');
      const summary = $("span[data-testid='plot-xs_to_m']").text();
      const director = $(".ipc-metadata-list-item__list-content-item--link").first().text();
      const metascore = $('.score-meta').text();

      const movie = {
        imdbID,
        title,
        year,
        rating,
        runTime,
        poster,
        summary,
        director,
        metascore
      };
      // console.log(body);
      // return {body}

      movieCache[imdbID] = movie;

      return movie;
    });
}


module.exports = {
  searchMovies,
  getMovie
};
