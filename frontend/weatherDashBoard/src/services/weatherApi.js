import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true,
  timeout: 15000,
});

/**
 * Transforms raw Axios errors into user-friendly error objects.
 */
function handleError(error) {
  if (error.response) {
    const { status, data } = error.response;

    if (status === 404 && data?.message) {
      throw new Error(data.message);
    }
    if (status === 400 && data?.message) {
      throw new Error(data.message);
    }
    if (status === 401) {
      throw new Error("Session expired. Please refresh the page.");
    }
    if (status === 503) {
      const err = new Error("Weather service is temporarily unavailable.");
      err.fallbackData = data?.weatherData || null;
      err.fallbackForecast = data?.forecastData || null;
      throw err;
    }
    throw new Error(data?.message || "Something went wrong. Please try again.");
  }

  if (error.code === "ECONNABORTED") {
    throw new Error("Request timed out. Please check your connection.");
  }

  throw new Error("Can't connect to the weather service. Please check your connection and try again.");
}

/**
 * GET /api/default  or  GET /api/default?lat=...&lon=...
 * Fetches default weather (optionally by geolocation).
 */
export async function getDefaultWeather(lat, lon) {
  try {
    const params = {};
    if (lat !== undefined && lon !== undefined) {
      params.lat = lat;
      params.lon = lon;
    }
    const { data } = await api.get("/api/default", { params });
    return {
      weatherData: data.weatherData,
      forecastData: data.forecastData || null,
      isFallback: !data.success,
    };
  } catch (error) {
    if (error.fallbackData) {
      return {
        weatherData: error.fallbackData,
        forecastData: error.fallbackForecast || null,
        isFallback: true,
      };
    }
    handleError(error);
  }
}

/**
 * GET /api/specific?city=...
 * Fetches weather for a specific city and records it in search history.
 */
export async function getWeatherByCity(city) {
  try {
    const { data } = await api.get("/api/specific", {
      params: { city },
    });
    return {
      weatherData: data.weatherData,
      forecastData: data.forecastData || null,
      isFallback: false,
    };
  } catch (error) {
    handleError(error);
  }
}

/**
 * GET /api/history
 * Returns the session's search history.
 */
export async function getHistory() {
  try {
    const { data } = await api.get("/api/history");
    return data.history || [];
  } catch (error) {
    // 401 = no session yet (first visit), 404 = no history yet
    if (error.response && (error.response.status === 401 || error.response.status === 404)) {
      return [];
    }
    handleError(error);
  }
}

/**
 * DELETE /api/deleteHistory/:city
 * Deletes a single history entry.
 */
export async function deleteHistoryItem(city) {
  try {
    const { data } = await api.delete(`/api/deleteHistory/${encodeURIComponent(city)}`);
    return data;
  } catch (error) {
    handleError(error);
  }
}
