const form = document.querySelector('form');
const searchInput = document.querySelector('input');
const resultsList = document.querySelector("#results");
const container = document.querySelector('main');
const searchBarContainer = document.getElementById('search-bar-container');
// const topDivHeader = document.querySelector('#top-div h1');
var Datastore = require('nedb'),
  db = new Datastore({
    filename: './client/Files/series.db',
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
  return fetch(`${BASE_URL}searchtv/${searchTerm}`)
    .then(res => res.json())
}

function showResults(results) {
  // container.classList.add('results-show');
  form.classList.add('bottom-border');
  // topDivHeader.classList.remove('expand-div');
  // topDivHeader.classList.add('shrink-div');

  //This handles cases where there are no results
  if(results.length == 0){
    const li = document.createElement('li');
    li.classList.add("result-li");
    li.innerHTML = "<p class='no-results-text'>No Results<br>(Make sure everything is spelled correctly)</p>";
    //li.classList.add('no-results-text');
    resultsList.appendChild(li);
    return;
  }

  results.forEach(show => {
    const li = document.createElement('li');
    const img = document.createElement('img');
    const p = document.createElement('p');
    const libButton = document.createElement('button');
    const popup = document.createElement('div');

    li.classList.add("result-li");

    //Adding the image, title, and add to library button to each result
    li.appendChild(img);
    img.classList.add("result-img");
    img.src = show.image;
    img.addEventListener('error', function() {
      img.src = '../images/imgnotfound.png';
    });

    const a = document.createElement('a');
    a.textContent = show.title;
    a.href = "./show.html?tmdbID=" + show.tmdbID;
    a.classList.add('result-title');
    li.appendChild(a);

    //This was experimental code for adding the description
    p.innerHTML = show.description;
    p.classList.add('result-p');
    li.appendChild(p);

    //Adds the plus sign button
    libButton.innerHTML = "<span class='material-icons'>add</span>"
    libButton.classList.add("result-lib-button");
    libButton.id = "libButton";

    //This checks to see if the show is already in library
    let inLibrary = false;
    db.findOne({
      tmdbID: show.tmdbID
    }, function(err, doc) {
      if (doc) {
        inLibrary = true;
      }
    });

    //Now we add the popup, telling the user if it has been added, or if it is already in ibrary
    popup.classList.add('popup');
    popup.innerHTML = "<span class='popuptext' id='" + show.tmdbID + "-myPopup'>Added to Shelf!</span>";
    li.appendChild(libButton);
    libButton.appendChild(popup);

    //this adds the functionality to the plus button that will show up on each of the search results
    libButton.addEventListener('click', function() {
      getShow(show.tmdbID).then(function(showresult) {
        if (!inLibrary) {
          db.insert(showresult);
          inLibrary = true;
        } else {
          popup.innerHTML = "<span class='popuptext' id='" + show.tmdbID + "-myPopup'>Already on Shelf</span>";
        }
        showPopup(showresult.tmdbID);
      });
    });

    resultsList.appendChild(li);
  })
    window.scrollTo({
      top: 276.8,
      left: 0,
      behavior: 'smooth'
    });
}

function getShow(tmdbID) {
  return fetch(`${BASE_URL}show/${tmdbID}`)
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