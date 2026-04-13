import * as React from "react";
import { IconDisplay } from "./IconDisplay";
import { useAppContext } from "../context";

interface SearchBarProps {
  query: string;
  setQuery: (query: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  resultsCount: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  query,
  setQuery,
  onKeyDown,
  resultsCount,
}) => {
  const { app } = useAppContext();
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
              <IconDisplay iconName="x" />
            </button>
          )}
          <div className="search-icon-indicator">
            {query ? (
              <IconDisplay iconName="corner-down-left" />
            ) : (
              <IconDisplay iconName="search" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
