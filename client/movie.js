const main = document.querySelector('main');
var Datastore = require('nedb'),
  db = new Datastore({
    filename: './client/Files/data.db',
    autoload: true
  });

console.log(window.location.search);
//Bascially, when the page loads, request the specific movie that you have clicked on
//"search" is the ID of the movie that was clicked
const tmdbID = window.location.search.match(/tmdbID=(.*)/)[1];

//This is where I would put the deployed site's URL (1:18:40 in the video)
const BASE_URL = "https://movie-shelf.vercel.app/";

function getMovie(tmdbID) {
  return fetch(`${BASE_URL}movie/${tmdbID}`)
    .then(res => res.json());
}

function showMovie(movie) {
  const section = document.createElement('section');

  const libButton = document.createElement('button');
  libButton.id = 'libButton';
  libButton.classList.add('custom-btn');
  libButton.innerHTML = 'Add to Library';

  const popup = document.createElement('div');

  //Checks to make sure current movie is not already in library
  let inLibrary = false;
  db.findOne({
    tmdbID: movie.tmdbID
  }, function(err, doc) {
    if (doc) {
      inLibrary = true;
    }
  });

  popup.classList.add('popup');
  popup.innerHTML = "<span class='popuptext' id='" + movie.tmdbID + "-myPopup'>Added to Your Library!</span>";
  // main.appendChild(libButton);
  main.appendChild(popup);
  main.appendChild(section);

  const properties = [{
    title: "Rating",
    property: 'rating'
  }, {
    title: "Runtime",
    property: "runTime"
  }, {
    title: "Release Year",
    property: "year"
  }, {
    title: "Plot Summary",
    property: "summary"
  }, {
    title: "Director",
    property: "director"
  }, {
    title: "TMDB User Score",
    property: "userScore"
  }];

  const descriptionHTML = properties.reduce((html, property) => {
    html += `
      <dt class="col-sm-3">${property.title}</dt>
      <dd class="col-sm-9">${movie[property.property]}</dd>`;
    return html;
  }, '');

  section.outerHTML = `
    <section class="row">
      <h1>${movie.title}</h1>
      <div class="col-sm-12">
        <img src="${movie.poster}" class="img-fluid" id="mov-image"/>
        <dl class="row" id="meta-info">
          ${descriptionHTML}
        </dl>
        <button id='libButton' class='custom-btn'>Add to Shelf</button>
      </div>
    </section>
  `;

  libButton.addEventListener('click', function() {
    if (!inLibrary) {
      addToLibrary(movie);
    } else {
      popup.innerHTML = "<span class='popuptext' id='" + movie.tmdbID + "-myPopup'>Already in Library</span>";
    }
    showPopup(movie.tmdbID);
  });

}


function addToLibrary(movie) {
  console.log(db.filename);
  db.insert(movie);
  console.log(`ran addToLibrary function on ${movie.title}`);
}

// module.exports = {
//   getMovie
// };

function showPopup(tmdbID) {
  var popup = document.getElementById(tmdbID + "-myPopup");
  popup.classList.toggle("show");
  setTimeout(function() {
    popup.classList.toggle("show");
  }, 2500);
}

getMovie(tmdbID)
  .then(showMovie);
