import "./LoadingState.css";

export default function LoadingState() {
  return (
    <div className="loading-state" aria-label="Loading weather data" role="status">
      {/* Hero skeleton */}
      <div className="loading-state__hero">
        <div className="loading-state__hero-left">
          <div className="skeleton loading-state__line loading-state__line--city" />
          <div className="skeleton loading-state__line loading-state__line--date" />
          <div className="skeleton loading-state__line loading-state__line--temp" />
          <div className="skeleton loading-state__line loading-state__line--desc" />
          <div className="loading-state__meta-row">
            <div className="skeleton loading-state__pill" />
            <div className="skeleton loading-state__pill" />
          </div>
        </div>
        <div className="skeleton loading-state__hero-icon" />
      </div>

      {/* Stats skeleton */}
      <div className="loading-state__stats">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="loading-state__stat-card">
            <div className="skeleton loading-state__stat-icon" />
            <div className="skeleton loading-state__stat-label" />
            <div className="skeleton loading-state__stat-value" />
          </div>
        ))}
      </div>

      {/* History skeleton */}
      <div className="loading-state__history">
        <div className="skeleton loading-state__line loading-state__line--section-title" />
        <div className="loading-state__chip-row">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton loading-state__chip" />
          ))}
        </div>
      </div>
    </div>
  );
}
