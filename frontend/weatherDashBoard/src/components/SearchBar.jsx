import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import "./SearchBar.css";

export default function SearchBar({ onSearch, isLoading }) {
  const [query, setQuery] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed || isLoading) return;
    onSearch(trimmed);
    setQuery("");
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit} role="search">
      <div className="search-bar__input-wrapper">
        <Search
          className="search-bar__icon"
          size={20}
          strokeWidth={2}
        />
        <input
          id="city-search"
          className="search-bar__input"
          type="text"
          placeholder="Search city..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isLoading}
          autoComplete="off"
          aria-label="Search for a city"
        />
      </div>
      <button
        className="search-bar__btn"
        type="submit"
        disabled={isLoading || !query.trim()}
        aria-label="Search"
      >
        {isLoading ? (
          <Loader2 className="search-bar__spinner" size={20} />
        ) : (
          "Search"
        )}
      </button>
    </form>
  );
}
