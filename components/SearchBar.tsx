import * as React from "react";
import { App } from "obsidian";
import { IconDisplay } from "./IconDisplay";

interface SearchBarProps {
  app: App;
  query: string;
  setQuery: (query: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  resultsCount: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  app,
  query,
  setQuery,
  onKeyDown,
  resultsCount,
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div
      className={`search-container ${query ? "has-query" : ""} ${
        resultsCount > 0 ? "has-results" : ""
      }`}
    >
      <div className="search-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder="Search your mind..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          autoFocus
        />
        <div className="search-right-section">
          {query && (
            <button
              className="search-clear-btn visible"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
            >
              <IconDisplay app={app} iconName="x" />
            </button>
          )}
          <div className="search-icon-indicator">
            {query ? (
              <IconDisplay app={app} iconName="corner-down-left" />
            ) : (
              <IconDisplay app={app} iconName="search" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
