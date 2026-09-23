/**
 * In-memory weather cache.
 *
 * Caches weatherData + forecastData by normalized city name.
 * Entries expire after WEATHER_CACHE_TTL milliseconds.
 * This is purely a frontend performance optimization —
 * it does NOT affect backend session/history behavior.
 */

/** Cache TTL in milliseconds (default: 15 minutes). */
const WEATHER_CACHE_TTL = 15 * 60 * 1000;

/** @type {Map<string, { weatherData: object, forecastData: object|null, timestamp: number }>} */
const cache = new Map();

/** Normalize city name to a consistent cache key. */
function toKey(city) {
  return city.trim().toLowerCase();
}

/**
 * Get a cached entry if it exists and hasn't expired.
 * Returns { weatherData, forecastData } or null.
 */
export function getCachedWeather(city) {
  const key = toKey(city);
  const entry = cache.get(key);

  if (!entry) return null;

  const age = Date.now() - entry.timestamp;
  if (age > WEATHER_CACHE_TTL) {
    cache.delete(key);
    return null;
  }

  return {
    weatherData: entry.weatherData,
    forecastData: entry.forecastData,
  };
}

/**
 * Store weather + forecast data in the cache.
 * Only caches successful responses (caller should not cache errors).
 */
export function setCachedWeather(city, weatherData, forecastData) {
  if (!weatherData) return;

  const key = toKey(city);
  cache.set(key, {
    weatherData,
    forecastData: forecastData || null,
    timestamp: Date.now(),
  });
}

/**
 * Remove a specific city from the cache.
 * (Not currently needed, but available for invalidation.)
 */
export function invalidateCache(city) {
  cache.delete(toKey(city));
}

/** Clear the entire cache. */
export function clearCache() {
  cache.clear();
}
