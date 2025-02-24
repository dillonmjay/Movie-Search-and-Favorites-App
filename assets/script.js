const apiKey = '23ca43e7';
const searchButton = document.getElementById('searchButton');
const searchInput = document.getElementById('searchInput');
const movieResults = document.getElementById('movieResults');
const favoriteMovies = document.getElementById('favoriteMovies');
const searchClose = document.getElementById('searchClose')

// Save search input and results to localStorage
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

                    // Save search input and results to localStorage
                    localStorage.setItem("searchQuery", query);
                    localStorage.setItem("searchYear", year);
                    localStorage.setItem("searchResults", movieResults.innerHTML);
                    localStorage.setItem("searchVisible", "true");
                } else {
                    movieResults.innerHTML = '<p>No results found</p>';
                }

                movieResults.classList.add("show");
                searchClose.classList.add("show");
                document.body.classList.add("hide-scroll");
            });
    }
});

// Close search results and clear localStorage
searchClose.addEventListener('click', () => {
    movieResults.classList.remove("show");
    searchClose.classList.remove("show");
    document.body.classList.remove("hide-scroll");

    // Clear search persistence when closed
    localStorage.removeItem("searchQuery");
    localStorage.removeItem("searchYear");
    localStorage.removeItem("searchResults");
    localStorage.removeItem("searchVisible");
});

// Restore search inputs and results on page load
document.addEventListener("DOMContentLoaded", () => {
    const savedQuery = localStorage.getItem("searchQuery");
    const savedYear = localStorage.getItem("searchYear");
    const savedResults = localStorage.getItem("searchResults");
    const isSearchVisible = localStorage.getItem("searchVisible");

    if (savedQuery) searchInput.value = savedQuery;
    if (savedYear) searchYear.value = savedYear;
    if (savedResults) movieResults.innerHTML = savedResults;

    if (isSearchVisible === "true") {
        movieResults.classList.add("show");
        searchClose.classList.add("show");
        document.body.classList.add("hide-scroll");
    }
});

//////////////////////////////////////////////////////////////////
const latestMoviesContainer = document.getElementById("latestMovies");

// Fetch and store recommended movies in localStorage
async function fetchLatestMovies() {
    let searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
    let storedMovies = JSON.parse(localStorage.getItem("latestMovies")) || [];

    // Use the last 3 search terms (or fallback to a default)
    let recentSearches = searchHistory.slice(-3);
    if (recentSearches.length === 0) recentSearches = ["love", "war", "mission"]; // Default recommendations

    // Load from localStorage if available
    if (storedMovies.length > 0) {
        latestMoviesContainer.innerHTML = storedMovies.map(movie => `
            <div class="new-movie">
                <img src="${movie.Poster}" alt="${movie.Title}" onclick="viewMovieDetails('${movie.imdbID}')">
                <h3 onclick="viewMovieDetails('${movie.imdbID}')">${movie.Title} (${movie.Year})</h3>
                <button onclick="addToFavorites('${movie.imdbID}', '${movie.Title}', '${movie.Poster}')">Add to Favorites</button>
            </div>
        `).join('');
        console.log("Loaded recommendations from localStorage.");
        return;
    }

    latestMoviesContainer.innerHTML = "<p>Loading recommendations...</p>"; // Show loading text
    let allMovies = [];

    for (let search of recentSearches) {
        try {
            let response = await fetch(`https://www.omdbapi.com/?s=${search}&type=movie&apikey=${apiKey}`);
            let data = await response.json();

            if (data.Response === "True") {
                allMovies.push(...data.Search.slice(0, 10)); // Get top 10 movies per search
            }
        } catch (error) {
            console.error(`Error fetching movies for ${search}:`, error);
        }
    }

    if (allMovies.length > 0) {
        latestMoviesContainer.innerHTML = allMovies.slice(0, 30).map(movie => `
            <div class="new-movie">
                <img src="${movie.Poster}" alt="${movie.Title}" onclick="viewMovieDetails('${movie.imdbID}')">
                <h3 onclick="viewMovieDetails('${movie.imdbID}')">${movie.Title} (${movie.Year})</h3>
                <button onclick="addToFavorites('${movie.imdbID}', '${movie.Title}', '${movie.Poster}')">Add to Favorites</button>
            </div>
        `).join('');

        // Store recommendations in localStorage
        localStorage.setItem("latestMovies", JSON.stringify(allMovies.slice(0, 30)));
    } else {
        latestMoviesContainer.innerHTML = "<p>No latest movies found.</p>";
    }
}

// Update search history when user searches
searchButton.addEventListener("click", () => {
    const query = searchInput.value.trim();
    if (query) {
        let searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];

        // Avoid duplicate consecutive searches
        if (searchHistory[searchHistory.length - 1] !== query) {
            searchHistory.push(query);
            if (searchHistory.length > 10) searchHistory.shift(); // Limit stored searches to 10
            localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
        }

        // Clear stored recommendations and fetch new ones
        localStorage.removeItem("latestMovies");
        fetchLatestMovies();
    }
});

// Load recommended movies on page load
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

/////////////////////////////////////////////////////////////////////
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
        window.location.reload(); // Reload page to reflect changes
        updateFavoriteCount(); // Update UI count
    } else {
        // Save to localStorage if no user is logged in
        let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
        if (!favorites.some(movie => movie.id === id)) {
            favorites.push({ id, title, poster });
            localStorage.setItem("favorites", JSON.stringify(favorites));
        }
        window.location.reload(); // Reload page to reflect changes
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

        const favoriteMoviesContainer = document.getElementById("favoriteMovies");

        if (favorites.length === 0) {
            favoriteMoviesContainer.innerHTML = `<p id="emptyMsg">Favorites are empty :)</p>`;
        } else {
            favoriteMoviesContainer.innerHTML = favorites.map(movie => `
                <div class="movie">
                    <img src="${movie.poster}" alt="${movie.title}">
                    <h3 onclick="viewMovieDetails('${movie.id}')">${movie.title}</h3>
                    <button onclick="removeFromFavorites('${movie.id}')">Remove</button>
                </div>
            `).join('');
        }

        updateFavoriteCount();
    } catch (error) {
        console.error("Error fetching favorites:", error);
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

        displayFavorites(); // Refresh UI without alert
        window.location.reload(); // Reload page to reflect changes
    } catch (error) {
        console.error("Error removing favorite:", error);
    }
}


document.addEventListener('DOMContentLoaded', () => {
    displayFavorites();  // Show saved favorites when the page loads
    updateFavoriteCount();  // Update the favorites count on page load
});
/////////////////////////////////////////////////////////////////////

//////////////////////heart button////////////////////////
const heartBtn = document.getElementById("heartBtn");
const favourite = document.getElementById("favourite");
const favClose = document.getElementById("favClose");

heartBtn.addEventListener('click', () => {
    favourite.classList.add("show");
    document.body.classList.add("hide-scroll");
});
// Check localStorage to keep favorites open after refresh
document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("favoritesOpen") === "true") {
        favourite.classList.add("show");
        document.body.classList.add("hide-scroll");
    }
});

// Close favorites ONLY when close button is clicked
favClose.addEventListener("click", () => {
    favourite.classList.remove("show");
    document.body.classList.remove("hide-scroll");
    localStorage.setItem("favoritesOpen", "false"); // Save state
});

// Open favorites and persist state
document.getElementById("heartBtn").addEventListener("click", () => {
    favourite.classList.add("show");
    document.body.classList.add("hide-scroll");
    localStorage.setItem("favoritesOpen", "true"); // Save state
});

//////////////////////////////theme////////////////////////////////////////
const toggleBtn = document.getElementById("toggleMode");
const toggleIcon = document.getElementById("toggleIcon");
const profileImg = document.getElementById("profileImg");

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
        profileImg.src = "assets/images/profile-light.png";
        toggleIcon.src = "assets/images/sun.png"; // Light Mode Icon
    } else {
        localStorage.setItem("theme", "dark");
        profileImg.src = "assets/images/profile-dark.png";
        toggleIcon.src = "assets/images/crescent-moon.png"; // Dark Mode Icon
    }
}

// Load user preference from localStorage
document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("theme") === "light") {
        document.body.classList.add("light-mode");
        profileImg.src = "assets/images/profile-light.png";
        toggleIcon.src = "assets/images/sun.png";
    }
});

toggleBtn.addEventListener("click", toggleTheme);

///////////////////////////////////////////////////////////////////
// const profileBtn = document.getElementById("profileBtn");
// const authModal= document.getElementById("authModal");
// const authClose = document.getElementById("authClose");

// profileBtn.addEventListener('click', () => {
//     authModal.classList.add("show");
//     document.body.classList.add("hide-scroll");
// });
// authClose.addEventListener('click', () => {
//     authModal.classList.remove("show");
//     document.body.classList.remove("hide-scroll");
// });
const profileBtn = document.getElementById("profileBtn");
const authModal = document.getElementById("authModal");
const authClose = document.getElementById("authClose");
const authForm = document.getElementById("authForm");
const userGreeting = document.getElementById("userGreeting");
const usernameDisplay = document.getElementById("usernameDisplay");
const logoutBtn = document.getElementById("logoutBtn");
const authTitle = document.getElementById("authTitle");

// Function to Check Login Status and Update Modal UI
function checkLoginStatus() {
    const loggedInUser = localStorage.getItem("user");

    if (loggedInUser) {
        // User is logged in - Show greeting and logout button
        userGreeting.style.display = "block";
        usernameDisplay.textContent = loggedInUser;
        logoutBtn.style.display = "block";

        // Hide login/signup form
        authForm.style.display = "none";
        authTitle.textContent = "Hello! Nice to See you Again.";
    } else {
        // No user logged in - Show login/signup form
        userGreeting.style.display = "none";
        logoutBtn.style.display = "none";
        authForm.style.display = "block";
        authTitle.textContent = "Login / Sign Up";
    }
}

// Open Modal & Check Login Status
profileBtn.addEventListener("click", () => {
    authModal.classList.add("show");
    document.body.classList.add("hide-scroll");
    checkLoginStatus();
});

// Close Modal
authClose.addEventListener("click", () => {
    authModal.classList.remove("show");
    document.body.classList.remove("hide-scroll");
});

// Logout Function (Clears User Data and Updates UI)
logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("user");
    checkLoginStatus(); // Update UI after logout
    window.location.reload();
});

// Run on Page Load to Check User Status
document.addEventListener("DOMContentLoaded", checkLoginStatus);

///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
async function signup() {
    // Get username and password input values
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const loginMessage = document.getElementById("loginMessage"); // Message div for feedback

    // Check if inputs are empty
    if (!username || !password) {
        loginMessage.style.color = "red";
        loginMessage.textContent = "Please enter a username and password.";
        return;
    }

    try {
        // Send signup request to the backend server
        const response = await fetch("http://localhost:3000/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }) // Convert data to JSON format
        });

        const result = await response.json(); // Parse the JSON response

        if (response.ok) {
            // If signup is successful, display success message
            loginMessage.style.color = "green";
            loginMessage.textContent = result.message;

            // Automatically login after signup (delay to show success message)
            setTimeout(() => {
                loginMessage.textContent = "";
                login(); // Call the login function
            }, 1000);
        } else {
            // If signup fails (e.g., username already exists), show error message
            loginMessage.style.color = "red";
            loginMessage.textContent = result.message;
        }
    } catch (error) {
        // Handle errors if the request fails
        console.error("Signup Error:", error);
        loginMessage.style.color = "red";
        loginMessage.textContent = "Signup failed. Please try again.";
    }
}

async function login() {
    // Get username and password input values
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const loginMessage = document.getElementById("loginMessage"); // Message div for feedback

    // Check if inputs are empty
    if (!username || !password) {
        loginMessage.style.color = "red";
        loginMessage.textContent = "Please enter both username and password.";
        return;
    }

    try {
        // Send login request to the backend server
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }) // Convert data to JSON format
        });

        const result = await response.json(); // Parse the JSON response

        if (result.success) {
            // If login is successful, save user data in localStorage
            localStorage.setItem("user", username);

            // Close the authentication modal after login
            authModal.classList.remove("show"); 
            document.body.classList.remove("hide-scroll");

            // Refresh the favorites list to show user-specific data
            displayFavorites();

            // Show login success message
            loginMessage.style.color = "green";
            loginMessage.textContent = "Login successful! Redirecting...";

            // Refresh the page after a short delay to update UI
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            // If login fails (e.g., incorrect credentials), show error message
            loginMessage.style.color = "red";
            loginMessage.textContent = result.message;
        }
    } catch (error) {
        // Handle errors if the request fails
        console.error("Login Error:", error);
        loginMessage.style.color = "red";
        loginMessage.textContent = "Login failed. Please try again.";
    }
}

async function generateShareLink() {
    // Get logged-in user from localStorage
    const loggedInUser = localStorage.getItem("user");

    // If no user is logged in, hide the share link section
    if (!loggedInUser) {
        document.getElementById("shareLinkContainer").style.display = "none";
        return;
    }

    try {
        // Fetch user ID from the backend
        const response = await fetch(`http://localhost:3000/get-user-id?username=${loggedInUser}`);
        const data = await response.json();

        // If user ID is not found, hide the share link section
        if (!data.success) {
            document.getElementById("shareLinkContainer").style.display = "none";
            return;
        }

        // Generate the shareable URL using the user ID
        const userID = data.userID;
        const shareURL = `http://127.0.0.1:5500/favourites.html?id=${userID}`;

        // Display the share link
        document.getElementById("shareLinkContainer").style.display = "block";
        const shareLink = document.getElementById("shareLink");
        shareLink.href = shareURL;
        shareLink.textContent = "Copy";

        // Add an event listener to copy the URL when the link is clicked
        shareLink.addEventListener("click", function(event) {
            event.preventDefault(); // Prevent the link from opening

            navigator.clipboard.writeText(shareURL).then(() => {
                shareLink.textContent = "Copied"; // Change text to "Copied" after copying
            }).catch(err => {
                console.error("Failed to copy: ", err);
            });
        });

    } catch (error) {
        console.error("Error generating share link:", error);
    }
}

// Run on page load to generate the share link if the user is logged in
document.addEventListener("DOMContentLoaded", generateShareLink);
