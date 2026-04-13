import * as React from "react";
import { App, TFile } from "obsidian";
import { SearchResult } from "../types";
import { IconDisplay } from "./IconDisplay";

interface SearchResultsProps {
  app: App;
  results: SearchResult[];
  selectedIndex: number;
  onSelect: (file: TFile) => void;
  setSelectedIndex: (index: number) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  app,
  results,
  selectedIndex,
  onSelect,
  setSelectedIndex,
}) => {
  if (results.length === 0) return null;

  return (
    <div className="search-results">
      {results.map((result, index) => (
        <div
          key={result.file.path}
          className={`search-result-item ${index === selectedIndex ? "selected" : ""}`}
          onClick={() => onSelect(result.file)}
          onMouseEnter={() => setSelectedIndex(index)}
        >
          <IconDisplay
            app={app}
            iconName={result.icon}
            color={result.color}
            className="result-icon-el"
          />
          <div className="result-info">
            <span className="result-name">{result.file.basename}</span>
            <span className="result-path">{result.file.parent?.path}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
