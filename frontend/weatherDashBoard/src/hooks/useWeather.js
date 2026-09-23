import { useState, useEffect, useCallback, useRef } from "react";
import {
  getDefaultWeather,
  getWeatherByCity,
  getHistory as fetchHistory,
  deleteHistoryItem as removeHistoryItem,
} from "../services/weatherApi";
import { getCachedWeather, setCachedWeather, invalidateCache } from "../utils/weatherCache";

export function useWeather() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFallback, setIsFallback] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const initializedRef = useRef(false);

  // ---------- Load default weather on mount ----------
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    async function init() {
      setLoading(true);
      setError(null);

      try {
        // Attempt geolocation
        let lat, lon;
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 8000,
              maximumAge: 300000, // 5 min cache
            });
          });
          lat = position.coords.latitude;
          lon = position.coords.longitude;
        } catch {
          // User denied or geolocation unavailable — proceed without coords
        }

        const result = await getDefaultWeather(lat, lon);
        setWeather(result.weatherData);
        setForecast(result.forecastData);
        setIsFallback(result.isFallback);

        // Seed the cache with the default city so re-clicking it is instant
        const defaultCity = result.weatherData?.name;
        if (defaultCity && !result.isFallback) {
          setCachedWeather(defaultCity, result.weatherData, result.forecastData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }

      // Fetch history (may 401 on first visit — handled silently in the API layer)
      try {
        setHistoryLoading(true);
        const historyData = await fetchHistory();
        setHistory(historyData);
      } catch {
        // silently ignore history errors on initial load
      } finally {
        setHistoryLoading(false);
      }
    }

    init();
  }, []);

  // ---------- Search for a specific city ----------
  const searchCity = useCallback(async (city) => {
    const trimmed = city?.trim();
    if (!trimmed) return;

    setError(null);

    // Check cache first
    const cached = getCachedWeather(trimmed);
    if (cached) {
      setWeather(cached.weatherData);
      setForecast(cached.forecastData);
      setIsFallback(false);
      return;
    }

    // Cache miss — call the backend
    setSearchLoading(true);

    try {
      const result = await getWeatherByCity(trimmed);
      setWeather(result.weatherData);
      setIsFallback(result.isFallback);
      setForecast(result.forecastData);

      // Cache successful, non-fallback responses
      if (!result.isFallback && result.weatherData) {
        const resolvedCity = result.weatherData.name || trimmed;
        setCachedWeather(resolvedCity, result.weatherData, result.forecastData);
      }

      // Refresh history after successful search
      try {
        const historyData = await fetchHistory();
        setHistory(historyData);
      } catch {
        // History refresh failure is non-critical
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // ---------- Delete a history item ----------
  const deleteHistory = useCallback(async (city) => {
    // Optimistic removal from UI
    setHistory((prev) => prev.filter((item) => item.city !== city));

    try {
      await removeHistoryItem(city);
      // Backend succeeded — also purge the frontend cache
      invalidateCache(city);
    } catch {
      // Revert on failure — re-fetch actual history (cache stays intact)
      try {
        const historyData = await fetchHistory();
        setHistory(historyData);
      } catch {
        // ignore
      }
    }
  }, []);

  // ---------- Refresh history ----------
  const refreshHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      const historyData = await fetchHistory();
      setHistory(historyData);
    } catch {
      // ignore
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  // ---------- Select a forecast point → update hero ----------
  const originalWeatherRef = useRef(null);

  const selectForecastPoint = useCallback((forecastItem) => {
    if (!forecastItem) return;

    // Save the original weather so we can conceptually restore it later if needed
    if (!originalWeatherRef.current && weather) {
      originalWeatherRef.current = weather;
    }

    // Build a weather-like object from the forecast entry
    // so the Hero section can display it without changes
    const heroData = {
      ...weather, // preserve name, sys.country, coord, etc.
      dt: forecastItem.dt,
      main: forecastItem.main,
      weather: forecastItem.weather,
      wind: forecastItem.wind,
      clouds: forecastItem.clouds,
      visibility: forecastItem.visibility,
    };

    setWeather(heroData);
    setIsFallback(false);
  }, [weather]);

  return {
    weather,
    forecast,
    loading,
    searchLoading,
    error,
    isFallback,
    history,
    historyLoading,
    searchCity,
    deleteHistory,
    refreshHistory,
    selectForecastPoint,
  };
}
