/**
 * Constructs an OpenWeatherMap icon URL from the icon code.
 * Falls back to a default icon string.
 */
export function getWeatherIconUrl(iconCode) {
  if (!iconCode) return null;
  return `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
}

/**
 * Maps OpenWeather condition `main` string to an emoji fallback.
 */
export function getWeatherEmoji(conditionMain) {
  if (!conditionMain) return "🌤️";

  const map = {
    Clear: "☀️",
    Clouds: "☁️",
    Rain: "🌧️",
    Drizzle: "🌦️",
    Thunderstorm: "⛈️",
    Snow: "❄️",
    Mist: "🌫️",
    Fog: "🌫️",
    Haze: "🌫️",
    Smoke: "🌫️",
    Dust: "🌪️",
    Sand: "🌪️",
    Ash: "🌋",
    Squall: "💨",
    Tornado: "🌪️",
  };

  return map[conditionMain] || "🌤️";
}
