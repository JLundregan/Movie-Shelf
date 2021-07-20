const form = document.querySelector('form');
const searchInput = document.querySelector('input');
const resultsList = document.querySelector("#results");
//const movieGetter = require('./movie')
var Datastore = require('nedb'), db = new Datastore({ filename: './client/Files/data.db', autoload: true });

//This is where I would put the deployed site's URL (1:18:40 in the video)
const BASE_URL = "https://movie-shelf.vercel.app/";

form.addEventListener('submit', formSubmitted);

function formSubmitted(event){
  event.preventDefault();

  const searchTerm = searchInput.value;
  getSearchResults(searchTerm)
    .then(showResults);
  //console.log(searchTerm);
}

function getSearchResults(searchTerm){
  //dont forget to delete the slash after BASE_URL
  return fetch(`${BASE_URL}search/${searchTerm}`)
    .then(res => res.json())
}


function showResults(results) {
  results.forEach(movie => {
    const li = document.createElement('li');
    const img = document.createElement('img');
    const libButton = document.createElement('button');
    const popup = document.createElement('div');

    li.appendChild(img);
    img.src = movie.image;
    const a = document.createElement('a');
    a.textContent = movie.title;
    a.href = "./movie.html?tmdbID=" + movie.tmdbID;
    li.appendChild(a);
    libButton.innerHTML = "<span class='material-icons'>add</span>"
    libButton.id = "libButton";

    popup.classList.add('popup');
    popup.innerHTML = "<span class='popuptext' id='" + movie.tmdbID+ "-myPopup'>Added to Your Library!</span>";
    li.appendChild(libButton);
    li.appendChild(popup);
    //this adds the functionality to the plus button that will show up on each of the search results
    libButton.addEventListener('click', function(){
        getMovie(movie.tmdbID).then(function(mov) {
          //console.log(mov);
          db.insert(mov);
          showPopup(mov.tmdbID);
        });
    });

    resultsList.appendChild(li);
  })
}

function getMovie(tmdbID){
  return fetch(`${BASE_URL}movie/${tmdbID}`)
    .then(res => res.json());
}

function showPopup(tmdbID){
  var popup = document.getElementById(tmdbID + "-myPopup");
  popup.classList.toggle("show");
  setTimeout(function () {
    popup.classList.toggle("show");
  }, 2500);
}
