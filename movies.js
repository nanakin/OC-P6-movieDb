import { createModal } from './modal.js';

const API_URL = 'http://localhost:8000/api/v1/';
const NB_TITLES_PER_CATEGORY = 7;
const NB_VISIBLE_TITLES = 4;

const genres = {}; // To store genres data retrieved from the API
const titles = {}; // To store all movies data once retrieved from the API

// Create all movies sections and the insert --------------------------------------------
function getAllTitles () {
  // API call for best movies data, then create the best films section and the insert
  titles.bestTitle = {};
  getTitles(API_URL + 'titles?sort_by=-imdb_score', 'bestTitle', NB_TITLES_PER_CATEGORY).then((data) => {
    createElements(data, 'bestTitle');
  });
  // Create 3 sections (1 per category) with slideshow
  const selectedCategoriesID = [3, 5, 17]; // crime, history and sport
  const nav = document.getElementsByClassName('dropdown-content')[0];
  // Iterate over categories
  for (const categoryID of selectedCategoriesID) {
    // Add the category to the dropdown menu
    const categoryAnchorLink = document.createElement('a');
    categoryAnchorLink.href = '?#' + categoryID;
    categoryAnchorLink.innerHTML = genres[categoryID];
    nav.append(categoryAnchorLink);
    // API call for data then create category section
    titles[categoryID] = {};
    const url = API_URL + 'titles?genre=' + genres[categoryID] + '&sort_by=-imdb_score';
    getTitles(url, categoryID, NB_TITLES_PER_CATEGORY).then((data) => {
      createElements(data, categoryID);
    });
  }
}

// Fetch all genre data following pagination
async function getGenres () {
  let nextPage = API_URL + 'genres';
  try {
    do {
      const response = await fetch(nextPage);
      const data = await response.json();
      nextPage = data.next;
      for (const genreObj of data.results) {
        genres[parseInt(genreObj.id)] = genreObj.name;
      }
    } while (nextPage != null);
    return genres;
  } catch (error) {
    console.log(error);
  };
}

// Function called by an arrow (slideshow) clic
function moveSlideshow (event) {
  const direction = event.target.className.includes('next') ? 1 : -1;
  const movies = event.target.parentElement.getElementsByClassName('clickable');
  // Retrieve the current state of the slide
  let visibleFromPosition = 0;
  for (; (visibleFromPosition < movies.length); visibleFromPosition++) {
    if (movies[visibleFromPosition].style.display !== 'none') {
      break;
    }
  }
  if (direction === 1) { // clic on the next button
    if ((movies.length - visibleFromPosition) > NB_VISIBLE_TITLES) {
      // make the next cover visible and hide the first visible
      movies[visibleFromPosition].style.display = 'none';
      movies[visibleFromPosition + NB_VISIBLE_TITLES].style.display = 'inline';
      event.target.parentElement.getElementsByClassName('previous')[0].style.visibility = 'visible';
      if (visibleFromPosition + 1 + NB_VISIBLE_TITLES === movies.length) {
        event.target.style.visibility = 'hidden';
      }
    }
  } else { // clic on the previous button
    if ((visibleFromPosition + NB_VISIBLE_TITLES - 1) >= NB_VISIBLE_TITLES) {
      // make the previous cover visible and hide the last visible
      movies[visibleFromPosition + NB_VISIBLE_TITLES - 1].style.display = 'none';
      event.target.parentElement.getElementsByClassName('next')[0].style.visibility = 'visible';
      movies[visibleFromPosition - 1].style.display = 'inline';
      if (visibleFromPosition - 1 === 0) {
        event.target.style.visibility = 'hidden';
      }
    }
  }
}

// Call the API to get the movie details then fill the modal
function getAndFillDetails (id) {
  getMovieDetails(id).then((data) => {
    fillMovieDetails(data);
  });
}

// Call the API to get the movie details then fill the insert
function getAndFillInsert (id) {
  getMovieDetails(id).then((data) => {
    fillBestMovieData(data);
  });
}

// Fill the modal
function fillMovieDetails (movieData) {
  document.getElementById('title').innerText = movieData.title;
  const movieImage = document.getElementById('cover');
  movieImage.src = movieData.image_url;
  movieImage.alt = movieData.title;
  document.getElementById('genres').innerText = movieData.genres.join(', ');
  document.getElementById('date').innerText = movieData.date_published;
  document.getElementById('rated').innerText = movieData.rated;
  document.getElementById('imdb').innerText = movieData.imdb_score;
  document.getElementById('directors').innerText = movieData.directors.join(', ');
  document.getElementById('actors').innerText = movieData.actors.join(', ');
  document.getElementById('duration').innerText = movieData.duration;
  document.getElementById('countries').innerText = movieData.countries.join(', ');
  document.getElementById('income').innerText = movieData.worldwide_gross_income;
  document.getElementById('description').innerText = movieData.description;
  // Display the modal
  modal.style.display = 'block';
  document.getElementsByTagName('body')[0].style.overflow = 'hidden';
}

// From a movie ID, make the API GET request to get the movie details
async function getMovieDetails (id) {
  const url = API_URL + 'titles/' + id;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  };
}

// Create the best movie insert
function fillBestMovieData (movieData) {
  const element = movieData;
  const divBestMovie = document.createElement('div');
  const divInfo = document.createElement('div');
  const titleBestMovie = document.createElement('h3');
  titleBestMovie.innerText = element.title;
  divInfo.append(titleBestMovie);
  const imgBestMovie = document.createElement('img');
  imgBestMovie.className = 'clickable';
  imgBestMovie.src = element.image_url;
  imgBestMovie.alt = element.title;
  imgBestMovie.onclick = function () {
    getAndFillDetails(movieData.id);
  };
  const buttonPlay = document.createElement('button');
  buttonPlay.className = 'btn';
  buttonPlay.innerText = 'Play';
  divInfo.append(buttonPlay);
  const descriptionBestMovie = document.createElement('p');
  descriptionBestMovie.innerText = element.description;
  divInfo.append(descriptionBestMovie);
  divBestMovie.append(divInfo);
  divBestMovie.append(imgBestMovie);
  document.getElementById('best_title').append(divBestMovie);
}

// Create the elements of a slideshow section
function createElements (elements, key) {
  let section = document.createElement('section');
  let h2 = document.createElement('h2');
  if (key === 'bestTitle') {
    h2.innerText = 'Best Title';
    section.append(h2);
    section.id = 'best_title';
    const idElement = Object.keys(elements)[0];
    getAndFillInsert(idElement);
    document.querySelector('main').prepend(section);
    section = document.createElement('section');
    h2 = document.createElement('h2');
    h2.innerText = 'Best Titles';
  } else {
    h2.innerText = genres[key];
    section.id = key;
  }
  section.append(h2);
  const slideshow = document.createElement('div');
  slideshow.className = 'slideshow';
  const next = document.createElement('a');
  next.onclick = moveSlideshow;
  next.className = 'arrow';
  next.innerText = '›';
  const previous = next.cloneNode();
  previous.onclick = moveSlideshow;
  next.className += ' next';
  if (Object.keys(elements).length < NB_VISIBLE_TITLES) {
    next.style.visibility = 'hidden';
  }
  previous.className += ' previous';
  previous.innerText = '‹';
  previous.style.visibility = 'hidden';
  slideshow.append(previous);
  slideshow.append(next);
  section.append(slideshow);

  const container = document.createElement('div');
  container.className = 'container';
  let i = 0;
  for (const idElement in elements) {
    const movieDiv = document.createElement('div');
    if (i >= NB_VISIBLE_TITLES) {
      movieDiv.style.display = 'none';
    }
    movieDiv.className = 'clickable';
    movieDiv.onclick = function () {
      getAndFillDetails(idElement);
    };

    const movieData = elements[idElement];

    const img = document.createElement('img');
    img.src = movieData.image_url;
    img.alt = movieData.title;
    movieDiv.append(img);

    container.append(movieDiv);
    i++;
  }
  slideshow.insertBefore(container, next);

  const main = document.querySelector('main');
  if (key === 'bestTitle') {
    const sections = document.getElementsByTagName('section');
    if (sections.length > 1) {
      main.insertBefore(section, sections[1]);
    } else {
      main.append(section);
    }
  } else {
    main.append(section);
  }
}

// Fetch all titles data following pagination
async function getTitles (url, key, nbElements) {
  let nextPage = url;
  const variable = titles[key];
  try {
    do {
      const response = await fetch(nextPage);
      const data = await response.json();
      nextPage = data.next;
      for (const titleObj of data.results) {
        // Store retrieved data to "title" variable
        variable[parseInt(titleObj.id)] = titleObj;
        if (Object.keys(variable).length === nbElements) {
          break;
        }
      }
    } while (Object.keys(variable).length < nbElements && nextPage != null);
    return variable;
  } catch (error) {
    console.log(error);
  };
}

// Main
const modal = createModal();
getGenres().then(() => {
  getAllTitles();
});
