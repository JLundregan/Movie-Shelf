var Datastore = require('nedb'),
  db = new Datastore({
    filename: './client/Files/series.db',
    autoload: true
  });

// let data = [];
// db.find({}, function (err, docs) {
//   // console.log(docs);
//   docs.sort(alphabetize);
//   for(var i = 0; i < docs.length; i++){
//     // console.log("Here is " + docs[i].title);
//     makeHTML(docs[i]);
//   }
// });
parseDatabase();

//Get the button
let scrollbutton = document.getElementById("btn-back-to-top");

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function () {
  scrollFunction();
};

// When the user clicks on the button, scroll to the top of the document
scrollbutton.addEventListener("click", backToTop);


/*
*****************************************************************************
The functions
*****************************************************************************
*/

//Loops through the database, calling makeHTML to populate the user's shelf
function parseDatabase() {
  db.find({}, function(err, docs) {
    // console.log(docs);
    docs.sort(alphabetize);
    for (var i = 0; i < docs.length; i++) {
      // console.log("Here is " + docs[i].title);
      makeHTML(docs[i]);
    }
  });
}

//This gets called on the show objects to create their respective HTML elements
//and insert each show div into the CSS grid
function makeHTML(showObject) {
  var show = document.createElement("div");
  document.getElementById('movie-grid').append(show);

  //This is the current movie object, as it wouldn't let me pass movieObjectList[i] into addModal
  //let currentMovieObject = movieArray.find(mov => mov.tmdbID === movieObject.tmdbID);

  //populates the grid with all of the movies in the movieList array
  // let currentId = movieObject.title.replace(/ /g, "-");
  let currentId = showObject.tmdbID;
  show.id = currentId;
  show.classList.add("movie-entry");
  show.classList.add("grid-item");
  //movie.innerHTML = "<h3>" + movieObject.title + "</h3>"; //Consider showing the title upon hover

  //This is to make the movie thumbnail the background of the html element
  let imageURL = showObject.poster;
  document.getElementById(currentId).style.backgroundImage = "url('" + imageURL + "')";
  document.getElementById(currentId).style.backgroundSize = "230px 330px";

  //adds the ability to generate a modal with movie information
  show.addEventListener('click', function() {
    addModal(currentId, showObject);
  });
}

//Creates the modal for each movie on click, also changing background styling to accomodate
function addModal(showId, showObj) {
  document.body.classList.add('noscroll');
  document.getElementById('modal-container').classList.add('show-modal');

  let currentShowModal = document.createElement('div');
  currentShowModal.classList.add('movie-modal');
  currentShowModal.id = showId + "-modal";


  //This populates the modal with each movie's respective information.
  currentShowModal.innerHTML = `<div id='close'><span class='material-icons'>close</span></div><div id='modal-info'><h1>
   ${showObj.title}</h1><div class='description'><p>${showObj.summary}</p></div><p>Released: ${showObj.year}</p>
   <p>TMDB user Score: ${showObj.userScore}</p></div><div class="remove-div">
   <span class="material-icons" id="remove-button">remove<span class="fadeIn">Remove from Shelf</span></span></div>`;

  document.getElementById('modal-container').prepend(currentShowModal);

  /* This is to create a background with a color equal to the dominant color of the thumbnail.
  Since Color Thief requires an img element, this creates an invisible (because of the 'hidden-image' class)
  img element from which to extract the dominant color. This color is then used for the modal's
  'background-color' */
  const colorThief = new ColorThief();
  let hiddenImage = new Image();
  hiddenImage.classList.add('hidden-image');
  hiddenImage.src = showObj.poster;
  hiddenImage.addEventListener('load', function() {
    let dominantColor = colorThief.getColor(hiddenImage);
    let modalBackground = document.createElement('div');

    //this will basically be a pseudo element used to make the modal background the
    //blurred thumbnail image of the respective movie, where the underlying color is
    //the image's dominant color
    modalBackground.classList.add('modal-background');
    modalBackground.id = 'modal-background';
    modalBackground.style.backgroundColor = "rgb(" + dominantColor + ")";
    modalBackground.style.backgroundImage = "url('" + showObj.poster + "')";
    currentShowModal.prepend(modalBackground);
  });

  //This adds a background element before the modal to reduce the opacity of the rest of the page
  addBlackBackground(document.getElementById('modal-container'), showId)

  //adds functionality to the close button
  document.getElementById('close').addEventListener('click', function() {
    removeModal(showId);
  });

  //adds the ability to click outside the modal to close it, rather than just the close button
  // document.getElementById('black-background').addEventListener('click', function(){
  //   removeModal(movId);
  // });

  //Adds functionality to "remove from library" button
  document.getElementById('remove-button').addEventListener('click', function() {
    let title = showObj.title;
    db.remove({
      tmdbID: showObj.tmdbID
    }, function(err, numDeleted) {});
    removeModal(showId);
    showRemovedPopup(title, showId);
    setTimeout(function() {
      window.location.reload()
    }, 1500);
  });
}

//Self-explanatory, but just basically undoes all of the changes that addModal added
function removeModal(showId) {
  let buttonParent = document.getElementById('close').parentNode; //This is the div with class 'movie-modal'
  let modalContainer = document.getElementById('modal-container')
  document.body.classList.remove('noscroll');
  modalContainer.classList.remove('show-modal');
  modalContainer.removeChild(document.getElementById('black-background'))
  buttonParent.parentNode.removeChild(document.getElementById(showId + "-modal"));
}

//This sort function is ascending alphabetical, except it discounts 'A', 'An', and 'The'
function alphabetize(input1, input2) {
  let inputArray1 = input1.title.split(' ');
  let relevantChar1 = inputArray1[0];
  let inputArray2 = input2.title.split(' ');
  let relevantChar2 = inputArray2[0];
  if (inputArray1[0] == 'The' || inputArray1[0] == 'A' || inputArray1[0] == 'An') {
    relevantChar1 = inputArray1[1];
  }
  if (inputArray2[0] == 'The' || inputArray2[0] == 'A' || inputArray2[0] == 'An') {
    relevantChar2 = inputArray2[1];
  }

  if (relevantChar1 > relevantChar2) {
    return 1;
  }
  if (relevantChar1 < relevantChar2) {
    return -1;
  }
  return 0;
}

//This creates a popup to tell the user that the selected movie has been removed
function showRemovedPopup(showTitle, showId) {
  const removedPopup = document.createElement('div');
  removedPopup.classList.add('removed-popup');
  removedPopup.textContent = "Removed " + showTitle + " from your Shelf";
  document.body.append(removedPopup);
  addBlackBackground(document.getElementById('modal-container'), showId)
  setTimeout(function() {
    document.body.removeChild(removedPopup);
  }, 2000);
}

//This adds a background element before the modal to reduce the opacity of the rest of the page
//Including functionality where clicking this background closes the modal
function addBlackBackground(container, seriesId) {
  let blackBackground = document.createElement('div');
  blackBackground.id = 'black-background';
  blackBackground.classList.add('black-background');
  container.prepend(blackBackground);

  blackBackground.addEventListener('click', function() {
    removeModal(seriesId);
  });
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
