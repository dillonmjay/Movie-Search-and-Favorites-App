const apiKey = '23ca43e7';
const searchButton = document.getElementById('searchButton');
const searchInput = document.getElementById('searchInput');
const movieResults = document.getElementById('movieResults');
const favoriteMovies = document.getElementById('favoriteMovies');
const searchClose = document.getElementById('searchClose')

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
                movieResults.classList.add("show");
                searchClose.classList.add("show");
                document.body.classList.add("hide-scroll");
            });
    }
});

searchClose.addEventListener('click', () => {
    movieResults.classList.remove("show");
    searchClose.classList.remove("show");
    document.body.classList.remove("hide-scroll");
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

// function updateFavoriteCount() {
//     let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
//     document.getElementById('favoriteCount').textContent = favorites.length;
// }

// function addToFavorites(id, title, poster) {
//     let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
//     if (!favorites.some(movie => movie.id === id)) {
//         favorites.push({ id, title, poster });
//         localStorage.setItem('favorites', JSON.stringify(favorites));
//         displayFavorites();
//         updateFavoriteCount(); // Update the count after adding
//     }
// }

// function displayFavorites() {
//     let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
//     favoriteMovies.innerHTML = favorites.map(movie => `
//         <div class="movie">
//             <img src="${movie.poster}" alt="${movie.title}">
//             <h3 onclick="viewMovieDetails('${movie.id}')">${movie.title}</h3>
//             <button onclick="removeFromFavorites('${movie.id}')">Remove</button>
//         </div>
//     `).join('');
// }

// function removeFromFavorites(id) {
//     let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
//     favorites = favorites.filter(movie => movie.id !== id);
//     localStorage.setItem('favorites', JSON.stringify(favorites));
//     displayFavorites();
//     updateFavoriteCount(); // Update the count after adding
// }
async function updateFavoriteCount() {
    const loggedInUser = localStorage.getItem("user");

    if (loggedInUser) {
        // Fetch the user's favorites from the server
        const response = await fetch(`http://localhost:3000/get-favorites?username=${loggedInUser}`);
        const data = await response.json();
        document.getElementById('favoriteCount').textContent = data.favorites ? data.favorites.length : 0;
    } else {
        // Count favorites from localStorage if not logged in
        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        document.getElementById('favoriteCount').textContent = favorites.length;
    }
}


async function addToFavorites(id, title, poster) {
    const loggedInUser = localStorage.getItem("user");

    if (loggedInUser) {
        // Save to backend if user is logged in
        await fetch("http://localhost:3000/save-favorites", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: loggedInUser, id, title, poster })
        });

        updateFavoriteCount(); // Update UI count
    } else {
        // Save to localStorage if no user is logged in
        let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
        if (!favorites.some(movie => movie.id === id)) {
            favorites.push({ id, title, poster });
            localStorage.setItem("favorites", JSON.stringify(favorites));
        }

        updateFavoriteCount();
    }
}


async function displayFavorites() {
    const loggedInUser = localStorage.getItem("user");
    let favorites = [];

    try {
        if (loggedInUser) {
            const response = await fetch(`http://localhost:3000/get-favorites?username=${loggedInUser}`);

            if (!response.ok) {
                throw new Error("Server error. Could not fetch user favorites.");
            }

            const data = await response.json();
            favorites = data.favorites || [];
        } else {
            favorites = JSON.parse(localStorage.getItem("favorites")) || [];
        }

        console.log("Fetched Favorites:", favorites); // Debugging

        document.getElementById("favoriteMovies").innerHTML = favorites.map(movie => `
            <div class="movie">
                <img src="${movie.poster}" alt="${movie.title}">
                <h3 onclick="viewMovieDetails('${movie.id}')">${movie.title}</h3>
                <button onclick="removeFromFavorites('${movie.id}')">Remove</button>
            </div>
        `).join('');

        updateFavoriteCount();
    } catch (error) {
        console.error("Error fetching favorites:", error);
        alert("Could not load favorites. Please try again.");
    }
}


async function removeFromFavorites(id) {
    const loggedInUser = localStorage.getItem("user");

    try {
        if (loggedInUser) {
            await fetch("http://localhost:3000/remove-favorite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: loggedInUser, id })
            });
        } else {
            let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
            favorites = favorites.filter(movie => movie.id !== id);
            localStorage.setItem("favorites", JSON.stringify(favorites));
        }

        displayFavorites(); // Refresh UI
    } catch (error) {
        console.error("Error removing favorite:", error);
        alert("Could not remove favorite. Please try again.");
    }
}


document.addEventListener('DOMContentLoaded', () => {
    displayFavorites();  // Show saved favorites when the page loads
    updateFavoriteCount();  // Update the favorites count on page load
});

//////////////////////heart button////////////////////////
const heartBtn = document.getElementById("heartBtn");
const favourite = document.getElementById("favourite");
const favClose = document.getElementById("favClose");

heartBtn.addEventListener('click', () => {
    favourite.classList.add("show");
    document.body.classList.add("hide-scroll");
});
favClose.addEventListener('click', () => {
    favourite.classList.remove("show");
    document.body.classList.remove("hide-scroll");
});
//////////////////////////////////////////////////////////////////////
const toggleBtn = document.getElementById("toggleMode");
const toggleIcon = document.getElementById("toggleIcon");

function toggleTheme() {
    document.body.classList.toggle("light-mode");

    // Add spin effect
    toggleBtn.classList.add("spin");

    // Remove spin effect after animation
    setTimeout(() => {
        toggleBtn.classList.remove("spin");
    }, 500);

    // Save mode preference in localStorage and change icon
    if (document.body.classList.contains("light-mode")) {
        localStorage.setItem("theme", "light");
        toggleIcon.src = "assets/images/sun.png"; // Light Mode Icon
    } else {
        localStorage.setItem("theme", "dark");
        toggleIcon.src = "assets/images/crescent-moon.png"; // Dark Mode Icon
    }
}

// Load user preference from localStorage
document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("theme") === "light") {
        document.body.classList.add("light-mode");
        toggleIcon.src = "assets/images/sun.png";
    }
});

toggleBtn.addEventListener("click", toggleTheme);



















async function signup() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
        alert("Please enter a username and password.");
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            throw new Error("Server error. Please check your backend.");
        }

        const result = await response.json();
        console.log("Signup Response:", result); // Debugging
        alert(result.message);
    } catch (error) {
        console.error("Signup Error:", error);
        alert("Signup failed. Please try again.");
    }
}


async function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
        alert("Please enter both username and password.");
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            throw new Error("Server error. Please check your backend.");
        }

        const result = await response.json();
        console.log("Login Response:", result); // Debugging
        alert(result.message);

        if (result.success) {
            localStorage.setItem("user", username);
            closeAuthModal(); // Close modal on successful login
            displayFavorites(); // Refresh favorites
        }
    } catch (error) {
        console.error("Login Error:", error);
        alert("Login failed. Please try again.");
    }
}
