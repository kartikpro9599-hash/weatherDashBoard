import { useWeather } from "./hooks/useWeather";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import WeatherHero from "./components/WeatherHero";
import WeatherStats from "./components/WeatherStats";
import Forecast from "./components/Forecast";
import SearchHistory from "./components/SearchHistory";
import LoadingState from "./components/LoadingState";
import ErrorState from "./components/ErrorState";
import "./App.css";

export default function App() {
  const {
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
    selectForecastPoint,
  } = useWeather();

  const cityName = weather?.name;

  return (
    <div className="app">
      <Header cityName={cityName} />

      <main className="app__main container">
        <div className="app__search-section">
          <SearchBar onSearch={searchCity} isLoading={searchLoading} />
        </div>

        {loading ? (
          <LoadingState />
        ) : (
          <>
            {/* Show inline error for search errors when we still have previous weather */}
            {error && weather && (
              <div className="app__inline-error">
                <ErrorState error={error} />
              </div>
            )}

            {/* Show full-page error only when there's no weather at all */}
            {error && !weather ? (
              <ErrorState error={error} onRetry={() => window.location.reload()} />
            ) : (
              <>
                <WeatherHero weather={weather} isFallback={isFallback} />

                <WeatherStats weather={weather} />

                <Forecast forecastData={forecast} onPointSelect={selectForecastPoint} />

                <SearchHistory
                  history={history}
                  historyLoading={historyLoading}
                  onSelect={searchCity}
                  onDelete={deleteHistory}
                />
              </>
            )}
          </>
        )}
      </main>

      <footer className="app__footer">
        <p className="app__footer-text">
          Made with Love ❤️
        </p>
      </footer>
    </div>
  );
}
