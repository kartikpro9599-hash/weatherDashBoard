import { Droplets, Wind, Gauge, Eye } from "lucide-react";
import { formatVisibility } from "../utils/formatWeather";
import "./WeatherStats.css";

export default function WeatherStats({ weather }) {
  if (!weather) return null;

  const stats = [];

  if (weather.main?.humidity !== undefined) {
    stats.push({
      id: "humidity",
      icon: Droplets,
      label: "Humidity",
      value: `${weather.main.humidity}%`,
      color: "var(--accent-blue)",
    });
  }

  if (weather.wind?.speed !== undefined) {
    stats.push({
      id: "wind",
      icon: Wind,
      label: "Wind",
      value: `${weather.wind.speed} m/s`,
      color: "var(--accent-emerald)",
    });
  }

  if (weather.main?.pressure !== undefined) {
    stats.push({
      id: "pressure",
      icon: Gauge,
      label: "Pressure",
      value: `${weather.main.pressure} hPa`,
      color: "var(--accent-amber)",
    });
  }

  if (weather.visibility !== undefined) {
    stats.push({
      id: "visibility",
      icon: Eye,
      label: "Visibility",
      value: formatVisibility(weather.visibility),
      color: "var(--accent-rose)",
    });
  }

  if (stats.length === 0) return null;

  return (
    <section className="weather-stats" aria-label="Weather details">
      <div className="weather-stats__grid">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.id}
              className="weather-stats__card"
              style={{
                animationDelay: `${0.2 + index * 0.08}s`,
                "--stat-color": stat.color,
              }}
            >
              <div className="weather-stats__icon-wrapper">
                <Icon
                  size={22}
                  strokeWidth={1.8}
                  style={{ color: stat.color }}
                />
              </div>
              <span className="weather-stats__label">{stat.label}</span>
              <span className="weather-stats__value">{stat.value}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
