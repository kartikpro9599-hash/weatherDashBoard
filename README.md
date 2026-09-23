# Weather Dashboard

A full-stack, polished Weather Dashboard application built with **React** on the frontend and **Node.js / Express** on the backend, using **MongoDB** to store user search history.

This project is designed with a focus on buttery-smooth user interactions, a premium dark-theme UI, and a secure architecture where all sensitive API keys are hidden on the server.

---

## 🌟 Key Features

- **Real-Time Weather:** Get instant current weather conditions for any city worldwide.
- **Interactive 5-Day Forecast:** View a 5-day, 3-hour forecast. The forecast features a smooth, interactive SVG temperature chart. Clicking any point on the chart reveals an animated panel with deep hourly details (humidity, wind, pressure, visibility, and more).
- **Persistent Search History:** Your recent searches are automatically saved to a MongoDB database. This history is tied to an anonymous, secure session cookie.
- **Smart Caching:** An in-memory frontend cache remembers weather data for recently searched cities (15-minute lifespan), making repeated clicks instant without making extra API calls.
- **Geolocation Support:** Automatically detects your location on the first visit to show your local weather.
- **Premium, Responsive UI:** A beautifully crafted dark theme with glassmorphism effects, smooth slide/fade animations, and layouts that perfectly adapt to mobile phones, tablets, and desktops.
- **High Security:** The frontend never talks to the OpenWeatherMap API directly. All requests go through the backend, keeping your API keys completely safe.

---

## 🏗️ Project Architecture

The repository is split into two main directories:

- **`frontend/weatherDashBoard/`**: The React application, built with Vite. It is strictly presentational, handling state, caching, animations, and API communication with our custom backend. *(See `frontend/weatherDashBoard/README.md` for a deep dive into the frontend architecture).*
- **`backend/`**: The Express server that acts as a secure proxy. It handles requests to OpenWeatherMap, manages user sessions via cookies, and stores/retrieves search history from MongoDB.

---

## 🚀 Getting Started

To run this project locally, you will need **Node.js**, a **MongoDB** database (local or Atlas), and a free **OpenWeatherMap API Key**.

### 1. Backend Setup

1. Open your terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` folder and add the following variables:
   ```env
   PORT=3000
   MONGO_URI=your_mongodb_connection_string
   WEATHER_API_KEY=your_openweathermap_api_key
   SESSION_SECRET=a_secure_random_string_for_cookies
   FRONTEND_URL=http://localhost:5173
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup

1. Open a new terminal window and navigate to the frontend folder:
   ```bash
   cd frontend/weatherDashBoard
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend/weatherDashBoard` folder and point it to your backend:
   ```env
   VITE_API_URL=http://localhost:3000
   ```
4. Start the React development server:
   ```bash
   npm run dev
   ```
5. Open your browser and go to `http://localhost:5173`!

---

## 💻 Technologies Used

**Frontend:**
- React 19
- Vite
- Axios (for API requests with cookie support)
- Vanilla CSS (Custom design tokens, CSS variables, and keyframe animations without external UI frameworks)

**Backend:**
- Node.js
- Express.js
- MongoDB & Mongoose
- `express-session` (for secure, cookie-based session management)
- Axios (for proxying OpenWeatherMap requests)

**APIs:**
- OpenWeatherMap (Current Weather Data & 5 Day / 3 Hour Forecast APIs)