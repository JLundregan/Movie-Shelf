//Fetch makes the request, cheerio parses it

const fetch = require('node-fetch');
const cheerio = require('cheerio');


let searchUrl  = "https://www.themoviedb.org/search/movie?query=";
let searchShowUrl = "https://www.themoviedb.org/search/tv?query=";
let movieUrl = "https://www.themoviedb.org/movie/";
let showUrl = "https://www.themoviedb.org/tv/";

const searchCache = {};
const movieCache = {};
const showCache = {};


function searchMovies(searchTerm) {
  //console.log('This is the searched URL:' + searchUrl + searchTerm);

  //This caches the results of the search, in case the user has already searched this.
  if(searchCache[searchTerm]){
    console.log('Serving from cache: ', searchTerm);
    return Promise.resolve(searchCache[searchTerm]);
  }

  return fetch(`${searchUrl}${searchTerm}`)
    .then(response => response.text())
    .then(body => {
      const movies = [];
      const $ = cheerio.load(body);
      $('.results div.card').each(function(i, element) {
        const $element = $(element);
        const $image = $element.find('.image .poster img');
        const $title = $element.find('.details .title div a');
        const $description = $element.find('div.overview p');


        let tmdbID = null;
        if($title.attr('href').match(/movie\/(.*)/)){
          //pulled from the part of the title anchor tag that has "/movie/tmdbID"
          tmdbID = $title.attr('href').match(/movie\/(.*)/)[1];
        }
        // const tmdbID = $title.attr('href').match(/movie\/(.*)/)[1];

        const movie = {
          image: "https://www.themoviedb.org" + $image.attr('src'),
          title: $title.text(),
          description: $description.text(),
          tmdbID
        };
        movies.push(movie);
      });

      searchCache[searchTerm] = movies;

      return movies;
    });
}

async function getLetterboxdRating(url){
  return fetch(url)
    .then(response => response.text())
    .then(head => {
      const $ = cheerio.load(head);
      const $score = $("head meta[name='twitter:data2']").attr('content');

      let score = "";
      if($score !== undefined){
        score = $score.slice(0,4);
      }

      // const score = $score.slice(0,4);
      const lbScore = {score}
      return lbScore;
    })
}

async function getDirector(url){
  return fetch(url)
    .then(response => response.text())
    .then(body => {
      const $ = cheerio.load(body);
      const $director = $("#featured-film-header p a span");

      let director = "";
      if($director !== undefined){
        director = $director.text();
      }

      // const director = $director.text();
      const lbDirector = {director}
      return lbDirector;
    })
}

function getMovie(tmdbID){
  //console.log('This is the searched URL:' + movieUrl + tmdbID);

  if(movieCache[tmdbID]){
    console.log('Serving from cache: ', tmdbID);
    return Promise.resolve(movieCache[tmdbID]);
  }

  return fetch(`${movieUrl}${tmdbID}`)
    .then(response => response.text())
    .then(async(body) => {
      const $ = cheerio.load(body);
      const $title = $('.title h2 a');
      const title = $title.text();

      const $year = $(".title .release_date");
      const year = $year.text().slice(1,-1);

      const $rating = $(".certification");
      const rating = $rating.text();

      const $runTime = $(".runtime");
      const runTime = $runTime.text();

      let poster = "";
      if( $('.poster_wrapper img.poster').attr('src') == undefined){
        poster =  "https://www.themoviedb.org" + $('.poster_wrapper img.poster').attr('src');
      } else {
        poster = "https://www.themoviedb.org" + $('.poster_wrapper img.poster').attr('src').replace("_filter(blur)", "");
      }
      // const poster = "https://www.themoviedb.org" + $('.poster_wrapper img.poster').attr('src').replace("_filter(blur)", "");
      const summary = $(".overview p").text();

      const $userScore = await getLetterboxdRating(`https://letterboxd.com/tmdb/${tmdbID}`);
      const userScore = $userScore.score;
      // console.log("This is $userScore: " + $userScore + " and this is userScore: " + userScore);

      // const crew = [];
      // $(".people li.profile a").each(function(i, element) {
      //   const crewMember = $(element).text();
      //   crew.push(crewMember);
      // })
      // const director = crew[0];
      const $director = await getDirector(`https://letterboxd.com/tmdb/${tmdbID}`);
      const director = $director.director;

      const movie = {
        tmdbID,
        title,
        year,
        rating,
        runTime,
        poster,
        summary,
        director,
        userScore,
        seen: false
      };
      // console.log(body);
      // return {body}

      movieCache[tmdbID] = movie;

      return movie;
    });
}


function searchShows(searchTerm) {
  // console.log('This is the searched URL:' + searchShowUrl + searchTerm);

  //This caches the results of the search, in case the user has already searched this.
  //I might delete this later, this came from the coding garden tutorial
  if(searchCache[searchTerm]){
    console.log('Serving from cache: ', searchTerm);
    return Promise.resolve(searchCache[searchTerm]);
  }

  return fetch(`${searchShowUrl}${searchTerm}`)
    .then(response => response.text())
    .then(body => {
      const shows = [];
      const $ = cheerio.load(body);
      $('.results div.card').each(function(i, element) {
        const $element = $(element);
        const $image = $element.find('.image .poster img');
        const $title = $element.find('.details .title div a');
        const $description = $element.find('div.overview p');


        let tmdbID = null;
        if($title.attr('href').match(/tv\/(.*)/)){
          //pulled from the part of the title anchor tag that has "/movie/tmdbID"
          tmdbID = $title.attr('href').match(/tv\/(.*)/)[1];
        }
        // const tmdbID = $title.attr('href').match(/tv\/(.*)/)[1];

        const show = {
          image: "https://www.themoviedb.org" + $image.attr('src'),
          title: $title.text(),
          description: $description.text(),
          tmdbID,
          seen: false
        };
        shows.push(show);
      });

      searchCache[searchTerm] = shows;

      return shows;
    });
}

function getShow(tmdbID){
  //console.log('This is the searched URL:' + movieUrl + tmdbID);

  if(showCache[tmdbID]){
    console.log('Serving from cache: ', tmdbID);
    return Promise.resolve(showCache[tmdbID]);
  }

  return fetch(`${showUrl}${tmdbID}`)
    .then(response => response.text())
    .then(body => {
      const $ = cheerio.load(body);
      const $title = $('.title h2 a');
      const title = $title.text();

      const $year = $(".title .release_date");
      const year = $year.text().slice(1,-1);

      const $rating = $(".certification");
      const rating = $rating.text();

      //Notably, no 'runTime' attribute, becuase it doesn't really make sense for a show

      const poster = "https://www.themoviedb.org" + $('.poster_wrapper img.poster').attr('src').replace("_filter(blur)", "");
      const summary = $(".overview p").text();

      const $userScore = $('div.user_score_chart');
      const userScore = Math.floor($userScore.attr('data-percent'));

      // Keeping this JIC but I don't see any easily accessible crew elements to find on the site
      // const crew = [];
      // $(".people li.profile a").each(function(i, element) {
      //   const crewMember = $(element).text();
      //   crew.push(crewMember);
      // })
      // const director = crew[0];

      const show = {
        tmdbID,
        title,
        year,
        rating,
        poster,
        summary,
        userScore
      };

      showCache[tmdbID] = show;

      return show;
    });
}

module.exports = {
  searchMovies,
  getLetterboxdRating,
  getMovie,
  searchShows,
  getShow
};
