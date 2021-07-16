const form = document.querySelector('form');
const searchInput = document.querySelector('input');
const resultsList = document.querySelector("#results");

//This is where I would put the deployed site's URL (1:18:40 in the video)
const BASE_URL = "https://movie-shelf.vercel.app";

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
  return fetch(`${BASE_URL}/search/${searchTerm}`)
    .then(res => res.json())
    // .then(results => {
    //   console.log(results);
    // })
}


function showResults(results) {
  results.forEach(movie => {
    const li = document.createElement('li');
    const img = document.createElement('img');
    li.appendChild(img);
    img.src = movie.image;
    const a = document.createElement('a');
    a.textContent = movie.title;
    a.href = "./movie.html?tmdbID=" + movie.tmdbID;
    li.appendChild(a);
    resultsList.appendChild(li);
  })
}