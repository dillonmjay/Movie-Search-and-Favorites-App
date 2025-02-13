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
//////////////////////////////////////////////////////////////////////
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

// ✅ Function to Check Login Status and Update Modal UI
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

// ✅ Open Modal & Check Login Status
profileBtn.addEventListener("click", () => {
    authModal.classList.add("show");
    document.body.classList.add("hide-scroll");
    checkLoginStatus();
});

// ✅ Close Modal
authClose.addEventListener("click", () => {
    authModal.classList.remove("show");
    document.body.classList.remove("hide-scroll");
});

// ✅ Logout Function (Clears User Data and Updates UI)
logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("user");
    checkLoginStatus(); // Update UI after logout
    window.location.reload();
});

// ✅ Run on Page Load to Check User Status
document.addEventListener("DOMContentLoaded", checkLoginStatus);















async function signup() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const loginMessage = document.getElementById("loginMessage"); // Message div

    if (!username || !password) {
        loginMessage.style.color = "red";
        loginMessage.textContent = "Please enter a username and password.";
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();

        if (response.ok) {
            loginMessage.style.color = "green";
            loginMessage.textContent = result.message;

            setTimeout(() => {
                loginMessage.textContent = "";
                login(); // Auto-login after signup
            }, 1000);
        } else {
            loginMessage.style.color = "red";
            loginMessage.textContent = result.message;
        }
    } catch (error) {
        console.error("Signup Error:", error);
        loginMessage.style.color = "red";
        loginMessage.textContent = "Signup failed. Please try again.";
    }
}

async function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const loginMessage = document.getElementById("loginMessage"); // Message div

    if (!username || !password) {
        loginMessage.style.color = "red";
        loginMessage.textContent = "Please enter both username and password.";
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();

        if (result.success) {
            localStorage.setItem("user", username);
            authModal.classList.remove("show"); // Close modal
            document.body.classList.remove("hide-scroll");
            displayFavorites(); // Refresh favorites

            loginMessage.style.color = "green";
            loginMessage.textContent = "Login successful! Redirecting...";
            setTimeout(() => {
                window.location.reload(); // Refresh to update UI
            }, 1000);
        } else {
            loginMessage.style.color = "red";
            loginMessage.textContent = result.message;
        }
    } catch (error) {
        console.error("Login Error:", error);
        loginMessage.style.color = "red";
        loginMessage.textContent = "Login failed. Please try again.";
    }
}


async function generateShareLink() {
    const loggedInUser = localStorage.getItem("user");

    if (!loggedInUser) {
        document.getElementById("shareLinkContainer").style.display = "none";
        return;
    }

    // Fetch user ID from the backend
    const response = await fetch(`http://localhost:3000/get-user-id?username=${loggedInUser}`);
    const data = await response.json();

    if (!data.success) {
        document.getElementById("shareLinkContainer").style.display = "none";
        return;
    }

    const userID = data.userID;
    const shareURL = `http://127.0.0.1:5500/favourites.html?id=${userID}`;

    // Show the share link
    document.getElementById("shareLinkContainer").style.display = "block";
    const shareLink = document.getElementById("shareLink");
    shareLink.href = shareURL;
    shareLink.textContent = "Copy"

    // copy url
    shareLink.addEventListener("click", function(event) {
        event.preventDefault(); // Prevent the link from opening
    
        const shareURL = this.href; // Get the href value
    
        navigator.clipboard.writeText(shareURL).then(() => {
            shareLink.textContent = "Copied"
        }).catch(err => {
            console.error("Failed to copy: ", err);
        });
    });
}

// Run on page load
document.addEventListener("DOMContentLoaded", generateShareLink);
