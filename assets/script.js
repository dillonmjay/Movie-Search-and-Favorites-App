const apiKey = '23ca43e7';
const searchButton = document.getElementById('searchButton');
const searchInput = document.getElementById('searchInput');
const movieResults = document.getElementById('movieResults');
const favoriteMovies = document.getElementById('favoriteMovies');

searchButton.addEventListener('click', () => {
    const query = searchInput.value.trim();
    const year = searchYear.value.trim();

    if (query) {
        let apiUrl = `https://www.omdbapi.com/?s=${query}&apikey=${apiKey}`;

        if (year) {
            apiUrl += `&y=${year}`;
        }

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.Response === "True") {
                    movieResults.innerHTML = data.Search.map(movie => `
                        <div class="movie">
                            <img src="${movie.Poster}" alt="${movie.Title}">
                            <h3 onclick="viewMovieDetails('${movie.imdbID}')">${movie.Title} (${movie.Year})</h3>
                            <button onclick="addToFavorites('${movie.imdbID}', '${movie.Title}', '${movie.Poster}')">Add to Favorites</button>
                        </div>
                    `).join('');
                } else {
                    movieResults.innerHTML = '<p>No results found</p>';
                }
            });
    }
});

//////////////////////////////////////////////////////////////////


const latestMoviesContainer = document.getElementById("latestMovies");
        

        function fetchLatestMovies() {
            fetch(`https://www.omdbapi.com/?s=inside&type=movie&apikey=${apiKey}`)
                .then(response => response.json())
                .then(data => {
                    if (data.Response === "True") {
                        latestMoviesContainer.innerHTML = data.Search.slice(0, 10).map(movie => `
                            <div class="new-movie">
                                <img src="${movie.Poster}" alt="${movie.Title}" onclick="viewMovieDetails('${movie.imdbID}')">
                                <h3 onclick="viewMovieDetails('${movie.imdbID}')">${movie.Title} (${movie.Year})</h3>
                                <button onclick="addToFavorites('${movie.imdbID}', '${movie.Title}', '${movie.Poster}')">Add to Favorites</button>
                            </div>
                        `).join('');
                    } else {
                        latestMoviesContainer.innerHTML = '<p>No latest movies found.</p>';
                    }
                })
                .catch(error => console.error("Error fetching latest movies:", error));
        }

        document.addEventListener("DOMContentLoaded", fetchLatestMovies);

/////////////////////////////////////////////////////////////////////

function viewMovieDetails(movieID) {
    fetch(`https://www.omdbapi.com/?i=${movieID}&apikey=${apiKey}`)
        .then(response => response.json())
        .then(movie => {
            document.getElementById("movieTitle").innerText = movie.Title;
            document.getElementById("moviePoster").src = movie.Poster;
            document.getElementById("movieYear").innerText = movie.Year;
            document.getElementById("movieGenre").innerText = movie.Genre;
            document.getElementById("moviePlot").innerText = movie.Plot;
            document.getElementById("movieRating").innerText = movie.imdbRating;
            document.getElementById("movieModal").style.display = "flex";
        });
}

function closeModal() {
    document.getElementById("movieModal").style.display = "none";
}

function addToFavorites(id, title, poster) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (!favorites.some(movie => movie.id === id)) {
        favorites.push({ id, title, poster });
        localStorage.setItem('favorites', JSON.stringify(favorites));
        displayFavorites();
    }
}

function displayFavorites() {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favoriteMovies.innerHTML = favorites.map(movie => `
        <div class="movie">
            <img src="${movie.poster}" alt="${movie.title}">
            <h3 onclick="viewMovieDetails('${movie.id}')">${movie.title}</h3>
            <button onclick="removeFromFavorites('${movie.id}')">Remove</button>
        </div>
    `).join('');
}

function removeFromFavorites(id) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites = favorites.filter(movie => movie.id !== id);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    displayFavorites();
}

document.addEventListener('DOMContentLoaded', displayFavorites);
