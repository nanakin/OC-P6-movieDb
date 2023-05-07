
import {createModal} from "./modal.js"

const API_URL = "http://localhost:8000/api/v1/";
const NB_CATEGORIES = 3;  //genre or category ?
const NB_TITLES_PER_CATEGORY = 7; // title or movie or film ?
const NB_VISIBLE_TITLES = 4;
// version sans ajax
// utiliser un then avec : getGenres().then((genres) => console.log(genres))
// async function getGenres(filters){
//     let nextPage = API_URL + "genres";
//     let genres = {};
//     do {
//         const response = await fetch(nextPage);
//         const data = await response.json();
//         nextPage = data.next;
//         for (const genreObj of data.results){
//             genres[parseInt(genreObj.id)] = genreObj.name;
//         }
//     } while (nextPage != null);
//     return genres;
// }

var requests = {}

requests.genres =  new XMLHttpRequest();
requests.genres.onreadystatechange = getGenres;
requests.movieDetails = new XMLHttpRequest();
requests.movieDetails.onreadystatechange = fillMovieDetails;
requests.bestTitle =  new XMLHttpRequest();
requests.bestTitle.onreadystatechange = function(){getTitles(requests.bestTitle, "bestTitle", NB_TITLES_PER_CATEGORY);};
requests.titlesByGenre = {};

// make only on data variable ?
// use local storage ?
var genres = {};
var titles = {};

// rename it parse response ?
function getGenres(){
    if (requests.genres.readyState === XMLHttpRequest.DONE) {
        if (requests.genres.status === 200) {
            var response = JSON.parse(requests.genres.responseText);
            for (const genreObj of response.results){
                genres[parseInt(genreObj.id)] = genreObj.name;
            }
            if (response.next != null) {
                makeGETRequest(requests.genres, response.next);
            } else {
                console.log(genres);
                titles.bestTitle = {}
                makeGETRequest(requests.bestTitle, API_URL + "titles/?sort_by=-imdb_score");
                const selectedCategoriesID = getSelectedCategories();
                for (const categoryID of selectedCategoriesID) {
                    console.log("categoryID = " + categoryID)
                    titles[categoryID] = {};
                    requests.titlesByGenre[categoryID] =  new XMLHttpRequest();
                    requests.titlesByGenre[categoryID].onreadystatechange = function(){getTitles(requests.titlesByGenre[categoryID], categoryID, NB_TITLES_PER_CATEGORY);};
                    const url = API_URL + "titles/?genre=" + genres[categoryID] + "&sort_by=-imdb_score";
                    console.log("make request for : " + url)
                    makeGETRequest(requests.titlesByGenre[categoryID],  url);
                }
            }
        } else {
            console.log('Il y a eu un problème avec la requête.');
        }
      }
}

function moveSlideshow(event){
    const direction =  event.target.className.includes("next") ? 1 : -1;
    const movies = event.target.parentElement.getElementsByClassName("clickable");
    for (var visibleFromPosition = 0; (visibleFromPosition < movies.length) && 
        (movies[visibleFromPosition].style.display == "none"); visibleFromPosition++) {}
    if (direction == 1){ // next
        if ((movies.length - visibleFromPosition) > NB_VISIBLE_TITLES) {
            movies[visibleFromPosition].style.display = "none";
            movies[visibleFromPosition + NB_VISIBLE_TITLES].style.display = "inline";
            event.target.parentElement.getElementsByClassName("previous")[0].style.visibility = "visible";
            if (visibleFromPosition + 1 + NB_VISIBLE_TITLES ==  movies.length){
                event.target.style.visibility = "hidden";}
        }
    }
    else { // previous
        if ((visibleFromPosition + NB_VISIBLE_TITLES - 1) >= NB_VISIBLE_TITLES){
            movies[visibleFromPosition + NB_VISIBLE_TITLES - 1].style.display = "none";
            event.target.parentElement.getElementsByClassName("next")[0].style.visibility = "visible";
            movies[visibleFromPosition - 1].style.display = "inline";
            if (visibleFromPosition - 1 == 0){
                event.target.style.visibility = "hidden";
            }
        }
    }
}

function fillMovieDetails(){
    if (requests.movieDetails.readyState === XMLHttpRequest.DONE) {
        if (requests.movieDetails.status === 200) {
            const movieData = JSON.parse(requests.movieDetails.responseText);
            console.log(movieData);
            const descriptionDiv = document.getElementById("movie_description");
            descriptionDiv.innerText = (
                movieData.image_url +
                movieData.title +
                movieData.genres +
                movieData.date_published +
                movieData.rated +
                movieData.imdb_score +
                movieData.directors +
                movieData.actors +
                movieData.duration +
                movieData.countries +
                movieData.worldwide_gross_income +
                movieData.description);
            modal.style.display = "block";
        }
    }
}

function getMovieDetails(id){
    const url = API_URL + "titles/" + id;
    makeGETRequest(requests.movieDetails, url);
}

function fillBestMovieData(){
    if (requests.movieDetails.readyState === XMLHttpRequest.DONE) {
        if (requests.movieDetails.status === 200) {
            const movieData = JSON.parse(requests.movieDetails.responseText);
            const element = movieData;
            const divBestMovie = document.createElement("div");
            const divInfo = document.createElement("div");
            const titleBestMovie = document.createElement("h3");
            titleBestMovie.innerText = element.title;
            divInfo.append(titleBestMovie);
            const imgBestMovie = document.createElement("img");
            imgBestMovie.src = element.image_url;
            const buttonPlay = document.createElement("button");
            buttonPlay.className = "btn";
            buttonPlay.innerText = "Play";
            divInfo.append(buttonPlay);
            const descriptionBestMovie = document.createElement("p")
            descriptionBestMovie.innerText = element.description;
            divInfo.append(descriptionBestMovie)
            divBestMovie.append(divInfo);
            divBestMovie.append(imgBestMovie);
            document.getElementById("best_title").append(divBestMovie);
            requests.movieDetails.onreadystatechange = fillMovieDetails;
        }
    }
}

function createElements(elements, key){
    console.log("elements =");
    console.log(elements);

    let section = document.createElement("section");

    let h2 = document.createElement("h2")
    if (key == "bestTitle"){
        h2.innerText = "Best Title";
        section.appendChild(h2);
        section.id = "best_title";
        for (var id_element in elements){break;}
        requests.movieDetails.onreadystatechange = fillBestMovieData;
        getMovieDetails(id_element); 
        document.querySelector("main").prepend(section);
        section = document.createElement("section");
        h2 = document.createElement("h2")
        h2.innerText = "Best Titles";
    } else {
        h2.innerText = genres[key]
    }
    section.appendChild(h2);

    const slideshow = document.createElement("div");
    slideshow.className = "slideshow";
    const next = document.createElement("a");
    next.onclick = moveSlideshow;
    next.className = "arrow";
    next.innerText = "›";
    const previous = next.cloneNode()
    previous.onclick = moveSlideshow;
    next.className += " next"
    if (Object.keys(elements).length < NB_VISIBLE_TITLES){
        next.style.visibility = "hidden";
    }
    previous.className += " previous"
    previous.innerText = "‹";
    previous.style.visibility = "hidden";
    slideshow.appendChild(previous);
    slideshow.appendChild(next);
    section.appendChild(slideshow);
    

    const container = document.createElement("div");
    container.className = "container"
    let i = 0;
    for (const id_element in elements){
        const movieDiv = document.createElement("div");
        if (i >= NB_VISIBLE_TITLES) {
            movieDiv.style.display = "none";
        }
        movieDiv.className = "clickable";
        //movieDiv.innerText = elements[id_element].title;
        movieDiv.onclick = function() {
            getMovieDetails(id_element);
            //document.getElementById("movieDescription").innerHTML = movieDiv.nextElementSibling.innerHTML
        }

        const movieData = elements[id_element]

        const img = document.createElement("img");
        img.src = movieData.image_url;
        movieDiv.appendChild(img)
        

        container.appendChild(movieDiv);
        /*const description = document.createElement("div");
        description.className = "description"
        container.appendChild(description);*/
        i++;
    }
    slideshow.insertBefore(container, next)

    const main = document.querySelector("main")
    if (key == "bestTitle"){
        const sections = document.getElementsByTagName("section")
        if (sections.length > 1){
            main.insertBefore(section, sections[1])
        } else {
            main.append(section);
        }
    } else {
        main.append(section);
    }
}


function getTitles(request, key, nbElements){
    let variable = titles[key]
    if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
            var response = JSON.parse(request.responseText);
            for (const titleObj of response.results){
                variable[parseInt(titleObj.id)] = titleObj;
                if (Object.keys(variable).length == nbElements){
                    break;
                }
            }
            if (Object.keys(variable).length < nbElements && response.next != null) {
                 makeGETRequest(request, response.next);
             } else {
                 //console.log(variable)
                 createElements(variable, key);
             }
        } else {
            console.log('Il y a eu un problème avec la requête.');
        }
      }
}

function makeGETRequest(requestObj, url){
    requestObj.open('GET', url, true);
    requestObj.send();
}

console.log("hello");
const modal = createModal()
makeGETRequest(requests.genres, API_URL + "genres");
//makeRequestTitles(API_URL + "titles/?sort_by=-imdb_score");
console.log("after make request");

// select 3 categories randomly
function getSelectedCategories(){
    let selectedGenresID = [];
    const genresID = Object.keys(genres);
    console.log(genresID);
    do {
        let random = Math.floor(Math.random() * genresID.length);
        if (!selectedGenresID.includes(genresID[random])) {
            selectedGenresID.push(genresID[random]);
        }
    } while (selectedGenresID.length < 3);
    return selectedGenresID;
}
