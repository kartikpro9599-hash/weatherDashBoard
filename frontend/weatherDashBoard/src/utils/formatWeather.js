/**
 * Rounds a temperature and returns it with °C suffix.
 * Returns "--" for null/undefined.
 */
export function formatTemp(temp) {
  if (temp === null || temp === undefined) return "--";
  return `${Math.round(temp)}°`;
}

/**
 * Converts visibility from meters to km.
 * Returns a formatted string like "10 km".
 */
export function formatVisibility(meters) {
  if (meters === null || meters === undefined) return "--";
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Formats a unix timestamp or Date into a human-readable date string.
 * Example: "Sunday, Sep 21"
 */
export function formatDate(timestamp) {
  const date = timestamp ? new Date(timestamp * 1000) : new Date();
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

/**
 * Formats the current time.
 * Example: "5:30 PM"
 */
export function formatTime() {
  return new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Capitalizes the first letter of each word.
 * "clear sky" → "Clear Sky"
 */
export function capitalizeWords(str) {
  if (!str) return "";
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}
