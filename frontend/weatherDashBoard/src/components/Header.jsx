import { CloudSun, MapPin } from "lucide-react";
import "./Header.css";

export default function Header({ cityName }) {
  return (
    <header className="header">
      <div className="header__inner container">
        <div className="header__brand">
          <CloudSun className="header__icon" size={28} strokeWidth={1.8} />
          <h1 className="header__title">Weather</h1>
        </div>
        {cityName && (
          <div className="header__location">
            <MapPin size={16} strokeWidth={2} />
            <span className="header__location-text">{cityName}</span>
          </div>
        )}
      </div>
    </header>
  );
}
