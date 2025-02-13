# 🎮 Movie Search and Favorites App 🎥

Welcome to **Movie Search and Favorites App**, a sleek and modern movie search platform where users can **search movies, add favorites, and share their lists**! This app is powered by the **OMDb API** and includes **user authentication** to save favorites.

## **🌟 Features**
✅ **Search for Movies** – Find movies using the OMDb API  
✅ **Filter by Year** – Narrow your search with a year filter  
✅ **Save Favorites** – Add and remove favorite movies  
✅ **User Accounts** – Sign up, log in, and save personal favorites  
✅ **Share Favorite Lists** – Get a unique link to share your favorite movies  
✅ **Dark/Light Mode** – Toggle between themes  
✅ **Admin Dashboard** – Manage users and their favorites  

---

## **🚀 Live Demo**
🔗 **[Live Version](https://dxdymovie.netlify.app/)** _(Replace with your deployed URL)_

---

## **👥 Installation**
To run this project locally, follow these steps:

### **1️⃣ Clone the Repository**
```sh
git clone https://github.com/dillonmjay/Movie-Search-and-Favorites-App.git
cd Movie-Search-and-Favorites-App
```

### **2️⃣ Install Dependencies**
```sh
npm install
```

### **3️⃣ Start the Server**
```sh
node server.js
```
Server runs on **`http://localhost:3000`** 🎮

### **4️⃣ Open in Browser**
Once the server is running, open your browser and visit:
```sh
http://localhost:3000/index.html
```

---

## **🛠️ Configuration**
### **🔑 OMDb API Key**
This app uses the **OMDb API** for movie searches.  
Replace the API key in `script.js` with your own:
```js
const API_KEY = "YOUR_OMDB_API_KEY";
```
Get your free API key from **[OMDb](https://www.omdbapi.com/)**.

---

## **📌 Usage Guide**
### **🌍 Searching for Movies**
1️⃣ Enter a movie name in the search bar  
2️⃣ (Optional) Add a year filter  
3️⃣ Click **Search**  
4️⃣ Browse results and click **Add to Favorites**  

### **💖 Managing Favorites**
- Click the **Heart Icon** ❤️ to view your favorite movies  
- Click **Remove** to delete a movie from favorites  
- Share your list using the **Share Link**  

### **👑 Admin Dashboard**
- Visit `/dashboard.html` to manage users  
- Edit usernames, passwords, and user IDs  
- Delete users if needed  

---

## **🛠️ Available Commands**
| Command                | Description                                   |
|------------------------|-----------------------------------------------|
| `npm install`         | Install dependencies                          |
| `node server.js`      | Start the backend server                      |
| `npm run dev`         | Start the server with live-reloading (nodemon) |
| `git clone <repo>`    | Clone the repository                          |

---

## **🚀 Deployment**
### **Deploy to Vercel**
```sh
vercel deploy
```
### **Deploy to Render**
```sh
git push origin main
```
_(Make sure Render is set up to auto-deploy from GitHub)_

---

## **👨‍💻 Technologies Used**
- **Frontend**: HTML, CSS, JavaScript  
- **Backend**: Node.js, Express.js  
- **Database**: JSON file-based storage  
- **API**: OMDb API  

---

## **📄 License**
This project is **MIT Licensed**. Feel free to fork and modify it! 🎮

---

## **📩 Contact**
🔹 **GitHub**: [dillonmjay](https://github.com/dillonmjay)  
🔹 **Email**: dillonmichaeljay@email.com  

---

🔥 **Enjoy searching for your favorite movies!** 🚀🍿

