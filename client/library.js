var Datastore = require('nedb'), db = new Datastore({ filename: './client/Files/data.db', autoload: true });

let data = [];
db.find({}, function (err, docs) {
  console.log(docs);
  for(var i = 0; i < docs.length; i++){
    console.log("Here is " + docs[i].title);
    makeHTML(docs[i]);
  }
});


/*
*****************************************************************************
The functions
*****************************************************************************
*/

//This gets called on the movie objects to create their respective HTML elements
//and insert each movie div into the CSS grid
function makeHTML(movieObject) {
  console.log('We are in the makeHTML functoin');
  var movie = document.createElement("div");
  document.getElementById('movie-grid').append(movie);

  //This is the current movie object, as it wouldn't let me pass movieObjectList[i] into addModal
  //let currentMovieObject = movieArray.find(mov => mov.tmdbID === movieObject.tmdbID);

  //populates the grid with all of the movies in the movieList array
  let currentId = movieObject.title.replace(/ /g, "-");
  movie.id = currentId;
  movie.classList.add("movie-entry");
  movie.classList.add("grid-item");
  //movie.innerHTML = "<h3>" + movieObject.title + "</h3>"; //Consider showing the title upon hover

  //This is to make the movie thumbnail the background of the html element
  // let imageURL = "images/" + movieObject.thumbnail;
  // document.getElementById(currentId).style.backgroundImage= "url('" + imageURL + "')";
  //document.getElementById(currentId).style.backgroundSize = "230px 330px";
  let imageURL = movieObject.poster;
  document.getElementById(currentId).style.backgroundImage = "url('" + imageURL + "')";
  document.getElementById(currentId).style.backgroundSize = "230px 330px";

  //adds the ability to generate a modal with movie information
  movie.addEventListener('click', function(){
    addModal(currentId, movieObject);
  });
}

//Creates the modal for each movie on click, also changing background styling to accomodate
function addModal(movId, movObj){
   document.body.classList.add('noscroll');
   document.getElementById('modal-container').classList.add('show-modal');

   let currentMovieModal = document.createElement('div');
   currentMovieModal.classList.add('movie-modal');
   currentMovieModal.id = movId + "-modal";

   //***Needs potential optimization, cause right now it looks kind of weird***
   //This populates the modal with each movie's respective information.
   currentMovieModal.innerHTML = "<div id='close'><span class='material-icons'>close</span></div><h1>" + movObj.title +
   "</h1><div class='description'><p>" + movObj.summary +
   "</p></div><p>Runtime: " + movObj.runTime + "</p><p>Director: " + movObj.director +
   "</p><p>Released: " +  movObj.year + "</p><p>TMDB user Score: " + movObj.userScore + "</p>";
   document.getElementById('modal-container').prepend(currentMovieModal);

     //This is to create a background with a color equal to the dominant color of the Thumbnail
   //Since Color Thief requires an img element, this creates an invisible (because of the 'hidden-image' class)
   //img element from which to extract the dominant color. This color is then used for the modal's
   //'background-color'
   let modalBackground = "";
   let dominantColor = "";
   const colorThief = new ColorThief();
   let hiddenImage = new Image();
   hiddenImage.classList.add('hidden-image');
   hiddenImage.src = movObj.poster;
   hiddenImage.addEventListener('load', function() {
      dominantColor = colorThief.getColor(hiddenImage);
      modalBackground = document.createElement('div');

      //this will basically be a pseudo element used to make the modal background the
      //blurred thumbnail image of the respective movie, where the underlying color is
      //the image's dominant color
      modalBackground.classList.add('modal-background');
      modalBackground.id = 'modal-background';
      modalBackground.style.backgroundColor = "rgb(" + dominantColor + ")";
      modalBackground.style.backgroundImage = "url('" + movObj.poster + "')";
      currentMovieModal.prepend(modalBackground);
    });

   //This adds a background element before the modal to reduce the opacity of the rest of the page
   let blackBackground = document.createElement('div');
   blackBackground.id = 'black-background';
   blackBackground.classList.add('black-background');
   document.getElementById('modal-container').prepend(blackBackground);

   //adds functionality to the close button
   document.getElementById('close').addEventListener('click', function(){
     removeModal(movId);
   });

   //adds the ability to click outside the modal to close it, rather than just the close button
   document.getElementById('black-background').addEventListener('click', function(){
     removeModal(movId);
   });
 }

//Self-explanatory, but just basically undoes all of the changes that addModal added
function removeModal(movId){
   let buttonParent = document.getElementById('close').parentNode; //This is the div with class 'movie-modal'
   let modalContainer = document.getElementById('modal-container')
   document.body.classList.remove('noscroll');
   modalContainer.classList.remove('show-modal');
   modalContainer.removeChild(document.getElementById('black-background'))
   buttonParent.parentNode.removeChild(document.getElementById(movId + "-modal"));
 }

//This sort function is ascending alphabetical, except it discounts 'A', 'An', and 'The'
function alphabetize(input1, input2){
  let inputArray1 = input1.title.split(' ');
  let relevantChar1 = inputArray1[0];
  let inputArray2 = input2.title.split(' ');
  let relevantChar2 = inputArray2[0];
  if(inputArray1[0] == 'The' || inputArray1[0] == 'A' || inputArray1[0] == 'An'){
    relevantChar1 = inputArray1[1];
  }
  if(inputArray2[0] == 'The' || inputArray2[0] == 'A' || inputArray2[0] == 'An'){
    relevantChar2 = inputArray2[1];
  }

  if(relevantChar1 > relevantChar2) {
    return 1;
  }
  if(relevantChar1 < relevantChar2) {
    return -1;
  }
  return 0;
}
