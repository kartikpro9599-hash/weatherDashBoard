import { AlertTriangle } from "lucide-react";
import { getWeatherIconUrl, getWeatherEmoji } from "../utils/weatherIcons";
import { formatTemp, formatDate, capitalizeWords } from "../utils/formatWeather";
import "./WeatherHero.css";

export default function WeatherHero({ weather, isFallback }) {
  if (!weather) return null;

  const condition = weather.weather?.[0];
  const iconUrl = getWeatherIconUrl(condition?.icon);
  const emoji = getWeatherEmoji(condition?.main);
  const description = capitalizeWords(condition?.description);

  const temp = weather.main?.temp;
  const feelsLike = weather.main?.feels_like;
  const tempMin = weather.main?.temp_min;
  const tempMax = weather.main?.temp_max;
  const cityName = weather.name;
  const country = weather.sys?.country;

  return (
    <section className="weather-hero" aria-label="Current weather">
      {isFallback && (
        <div className="weather-hero__fallback-banner">
          <AlertTriangle size={16} />
          <span>Showing fallback data — live weather is temporarily unavailable</span>
        </div>
      )}

      <div className="weather-hero__content">
        <div className="weather-hero__info">
          <div className="weather-hero__location">
            <h2 className="weather-hero__city">
              {cityName || "Unknown"}
              {country && <span className="weather-hero__country">, {country}</span>}
            </h2>
            <p className="weather-hero__date">{formatDate(weather.dt)}</p>
          </div>

          <div className="weather-hero__temp-block">
            <span className="weather-hero__temp">{formatTemp(temp)}</span>
          </div>

          {description && (
            <p className="weather-hero__description">{description}</p>
          )}

          <div className="weather-hero__meta">
            {feelsLike !== undefined && (
              <span className="weather-hero__feels-like">
                Feels like {formatTemp(feelsLike)}
              </span>
            )}
            {tempMax !== undefined && tempMin !== undefined && (
              <span className="weather-hero__hi-lo">
                H: {formatTemp(tempMax)}  ·  L: {formatTemp(tempMin)}
              </span>
            )}
          </div>
        </div>

        <div className="weather-hero__icon-container">
          {iconUrl ? (
            <img
              className="weather-hero__icon-img"
              src={iconUrl}
              alt={description || "Weather icon"}
              width={160}
              height={160}
            />
          ) : (
            <span className="weather-hero__icon-emoji">{emoji}</span>
          )}
        </div>
      </div>
    </section>
  );
}
