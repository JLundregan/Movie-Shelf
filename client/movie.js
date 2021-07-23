const main = document.querySelector('main');
var Datastore = require('nedb'),
  db = new Datastore({
    filename: './client/Files/data.db',
    autoload: true
  });

// console.log(window.location.search);
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

  // const libButton = document.createElement('button');
  // libButton.id = 'libButton';
  // libButton.classList.add('custom-btn');
  // libButton.innerHTML = 'Add to Library';



  //Checks to make sure current movie is not already in library
  let inLibrary = false;
  db.findOne({
    tmdbID: movie.tmdbID
  }, function(err, doc) {
    if (doc) {
      inLibrary = true;
    }
  });

  const popup = document.createElement('div');
  popup.classList.add('popup');
  popup.innerHTML = "<span class='popuptext' id='" + movie.tmdbID + "-myPopup'>Added to Shelf!</span>";
  // main.appendChild(libButton);
  document.body.appendChild(popup);
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
          <button id='libButton' class='custom-btn'>Add to Shelf</button>
        </dl>
      </div>
    </section>
  `;

  //This selects the description, and allows for the popup of a modal
  //with the full description
  let descriptionElement = document.querySelectorAll('dd')[3];
  descriptionElement.id  = 'movie-description';
  descriptionElement.addEventListener('click', function(){
    showDescription(descriptionElement.textContent);
  })

  libButton.addEventListener('click', function() {
    if (!inLibrary) {
      db.insert(movie);
      inLibrary = true;
      //console.log("Here is your movies' tmdbID:" + movie.tmdbID)
    } else {
      popup.innerHTML = "<span class='popuptext' id='" + movie.tmdbID + "-myPopup'>Already on Shelf</span>";
    }
    showPopup(movie.tmdbID);
  });

}

//I can probably delete this
function addToLibrary(movie) {
  console.log(db.filename);
  db.insert(movie);
  console.log(`ran addToLibrary function on ${movie.title}`);
}

function showPopup(tmdbID) {
  var popup = document.getElementById(tmdbID + "-myPopup");
  popup.classList.toggle("show");

  document.getElementById('meta-info').style.zIndex = "-1";

  let blackBackground = document.createElement('div');
  blackBackground.id = 'black-background';
  blackBackground.classList.add('black-background');
  document.body.prepend(blackBackground);

  setTimeout(function() {
    document.body.removeChild(blackBackground);
    document.getElementById('meta-info').style.zIndex = "0";
    popup.classList.toggle("show");
    //window.location.reload();
  }, 2000);
}


//This is to pop up a modal showing the full description, since currently the css
//clamps the description at 4-5 lines
function showDescription(description){
  const descriptionModal = document.createElement('div');
  descriptionModal.classList.add('description-popup');
  descriptionModal.textContent = description;
  document.body.append(descriptionModal);

  //Creates the black background to reduce opacity of the rest of the page
  document.getElementById('meta-info').style.zIndex = "-1";
  let blackBackground = document.createElement('div');
  blackBackground.id = 'black-background';
  blackBackground.classList.add('black-background');
  document.body.prepend(blackBackground);

  blackBackground.addEventListener('click', function() {
    document.getElementById('meta-info').style.zIndex = "0";
    document.body.removeChild(descriptionModal);
    document.body.removeChild(blackBackground);
  });

}

getMovie(tmdbID)
  .then(showMovie);
