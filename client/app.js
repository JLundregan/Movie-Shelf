const form = document.querySelector('form');
const searchInput = document.querySelector('input');
const resultsList = document.querySelector("#results");
const container = document.querySelector('main');
const searchBarContainer = document.getElementById('search-bar-container');

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


//This event listener clears the 'last search' from localStorage, allowing for a new search
searchInput.addEventListener("click", function(){
  //console.log('localStorage starts out as: ' + localStorage.getItem("last search"));
  localStorage.clear();
  //console.log('localStorage is now: ' + localStorage.getItem("last search"));
  form.addEventListener('submit', formSubmitted);
})

//This covers the case when clicking "search" from the movie page.
//If there is a search in localStorage, this pulls from that. Otherwise,
//just default to normal search page behavior.
if(localStorage.hasOwnProperty('last search')){
  getSearchResults(localStorage.getItem("last search"))
    .then(showResults);
} else {
  form.addEventListener('submit', formSubmitted);
}
// form.addEventListener('submit', formSubmitted);

function formSubmitted(event) {
  event.preventDefault();

  const searchTerm = searchInput.value;
  getSearchResults(searchTerm)
    .then(showResults);
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

  //This handles cases where there are no results
  if(results.length == 0){
    const li = document.createElement('li');
    li.classList.add("result-li");
    li.innerHTML = "<p class='no-results-text'>No Results<br>(Make sure everything is spelled correctly)</p>";
    resultsList.appendChild(li);
    return;
  }

  results.forEach(movie => {
    const li = document.createElement('li');
    const img = document.createElement('img');
    const p = document.createElement('p');
    const libButton = document.createElement('button');
    const popup = document.createElement('div');

    li.classList.add("result-li");

    //Adding the image, title, and add to library button to each result
    li.appendChild(img);
    img.classList.add("result-img");
    img.src = movie.image;
    img.addEventListener('error', function() {
      img.src = '../images/imgnotfound.png';
    });

    const a = document.createElement('a');
    //add event listener to the 'a,' adding movie to local storage
    a.addEventListener('click', function(){
      if(!localStorage.hasOwnProperty("last search")){
        localStorage.setItem("last search", searchInput.value);
      }
      localStorage.removeItem('scrollPosition');
      localStorage.setItem('scrollPosition', document.documentElement.scrollTop);
    })
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

    //adds ability to click poster or description to go to movie info page
    img.addEventListener('click', function(){
      if(!localStorage.hasOwnProperty("last search")){
        localStorage.setItem("last search", searchInput.value);
      }
      localStorage.removeItem('scrollPosition');
      localStorage.setItem('scrollPosition', document.documentElement.scrollTop);
      window.location.href = "./movie.html?tmdbID=" + movie.tmdbID;;
    })
    p.addEventListener('click', function(){
      if(!localStorage.hasOwnProperty("last search")){
        localStorage.setItem("last search", searchInput.value);
      }
      localStorage.removeItem('scrollPosition');
      localStorage.setItem('scrollPosition', document.documentElement.scrollTop);
      window.location.href = "./movie.html?tmdbID=" + movie.tmdbID;;
    })
    //add event listener to a adding movie to local storage

    resultsList.appendChild(li);
  })

    //This checks to see how the far the user has scrolled down on the page, and returns them
    //to that position once they go back to the search page from the movie. If they
    //have not scrolled, the top defaults to 276.8, the top of the element that contains the search bar
    let topPos = 276.8;
    if(localStorage.hasOwnProperty('scrollPosition')){
      topPos = localStorage.getItem('scrollPosition')
    }

    window.scrollTo({
      top: topPos,
      left: 0,
      behavior: 'auto'
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

//I made this function exclusively so I could give the navbar "onclick" attributes in the HTML,
//rather than writing event listeners in the js file here
function clearStorage(){
  localStorage.clear();
}
