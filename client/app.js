const form = document.querySelector('form');
const searchInput = document.querySelector('input');
const resultsList = document.querySelector("#results");
const container = document.querySelector('main');
const searchBarContainer = document.getElementById('search-bar-container');
// const topDivHeader = document.querySelector('#top-div h1');
var Datastore = require('nedb'),
  db = new Datastore({
    filename: './client/Files/data.db',
    autoload: true
  });

//This is where I would put the deployed site's URL (1:18:40 in the video)
const BASE_URL = "https://movie-shelf.vercel.app/";


//Get the button
let scrollbutton = document.getElementById("btn-back-to-top");

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function () {
  scrollFunction();
};

// When the user clicks on the button, scroll to the top of the document
scrollbutton.addEventListener("click", backToTop);



form.addEventListener('submit', formSubmitted);

function formSubmitted(event) {
  event.preventDefault();

  const searchTerm = searchInput.value;
  getSearchResults(searchTerm)
    .then(showResults);
  //console.log(searchTerm);
}

function getSearchResults(searchTerm) {
  resultsList.innerHTML = '';
  //dont forget to delete the slash after BASE_URL
  return fetch(`${BASE_URL}search/${searchTerm}`)
    .then(res => res.json())
}

function showResults(results) {
  // container.classList.add('results-show');
  form.classList.add('bottom-border');
  // topDivHeader.classList.remove('expand-div');
  // topDivHeader.classList.add('shrink-div');

  if(results.length == 0){
    const li = document.createElement('li');
    li.innerHTML = "<p class='no-results-text'>No Results<br>(Make sure everything is spelled correctly)</p>";
    //li.classList.add('no-results-text');
    resultsList.appendChild(li);
    return;
  }

  results.forEach(movie => {
    const li = document.createElement('li');
    const img = document.createElement('img');
    const p = document.createElement('p');
    const libButton = document.createElement('button');
    const popup = document.createElement('div');

    //Adding the image, title, and add to library button to each result
    li.appendChild(img);
    img.classList.add("result-img");
    img.src = movie.image;
    img.addEventListener('error', function() {
      img.src = '../images/imgnotfound.png';
    });

    const a = document.createElement('a');
    a.textContent = movie.title;
    a.href = "./movie.html?tmdbID=" + movie.tmdbID;
    a.classList.add('result-title');
    li.appendChild(a);

    //This was experimental code for adding the description
    p.innerHTML = movie.description;
    p.classList.add('result-p');
    li.appendChild(p);

    //Adds the plus sign button
    libButton.innerHTML = "<span class='material-icons'>add</span>"
    libButton.classList.add("result-lib-button");
    libButton.id = "libButton";

    //This checks to see if the movie is already in library
    let inLibrary = false;
    db.findOne({
      tmdbID: movie.tmdbID
    }, function(err, doc) {
      if (doc) {
        inLibrary = true;
      }
    });

    //Now we add the popup, telling the user if it has been added, or if it is already in ibrary
    popup.classList.add('popup');
    popup.innerHTML = "<span class='popuptext' id='" + movie.tmdbID + "-myPopup'>Added to Shelf!</span>";
    li.appendChild(libButton);
    libButton.appendChild(popup);

    //this adds the functionality to the plus button that will show up on each of the search results
    libButton.addEventListener('click', function() {
      getMovie(movie.tmdbID).then(function(mov) {
        if (!inLibrary) {
          db.insert(mov);
          inLibrary = true;
        } else {
          popup.innerHTML = "<span class='popuptext' id='" + movie.tmdbID + "-myPopup'>Already on Shelf</span>";
        }
        showPopup(mov.tmdbID);
      });
    });

    resultsList.appendChild(li);
  })
    window.scrollTo({
      top: 234.8,
      left: 0,
      behavior: 'smooth'
    });
}

function getMovie(tmdbID) {
  return fetch(`${BASE_URL}movie/${tmdbID}`)
    .then(res => res.json());
}

function showPopup(tmdbID) {
  var popup = document.getElementById(tmdbID + "-myPopup");
  popup.classList.toggle("show");
  setTimeout(function() {
    popup.classList.toggle("show");
  }, 2500);
}

//The next two have to do with the scroll button that scrolls the page to the top
//Once the arrow button (scrollButton) is clicked
function scrollFunction() {
  if (
    document.body.scrollTop > 20 ||
    document.documentElement.scrollTop > 20
  ) {
    scrollbutton.style.display = "block";
  } else {
    scrollbutton.style.display = "none";
  }
}

function backToTop() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}
