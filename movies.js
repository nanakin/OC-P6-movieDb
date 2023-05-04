
const API_URL = "http://localhost:8000/api/v1/";
const NB_CATEGORIES = 3;  //genre or category ?
const NB_TITLES_PER_CATEGORY = 7; // title or movie or film ?

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
requests.bestTitle =  new XMLHttpRequest();
requests.bestTitle.onreadystatechange = function(){getTitles(requests.bestTitle, "bestTitle", 1);};
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

function createElements(elements, key){
    console.log("elements =");
    console.log(elements);

    const section = document.createElement("section");

    const h2 = document.createElement("h2")
    h2.innerText = key == "bestTitle" ? "Best Title" : genres[key]
    section.appendChild(h2)

    const ul = document.createElement("ul");
    for (const id_element in elements){
        const li = document.createElement("li");
        li.innerText = elements[id_element].title + " (" + elements[id_element].imdb_score + ")";
        ul.appendChild(li);
    }
    section.appendChild(ul)

    document.querySelector("main").appendChild(section);
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
