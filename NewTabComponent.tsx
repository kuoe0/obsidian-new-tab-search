import * as React from "react";
import { App, TFile } from "obsidian";
import fuzzysort from "fuzzysort";

interface NewTabComponentProps {
  app: App;
}

interface SearchResult {
  file: TFile;
  score: number;
  highlightIndexes?: ReadonlyArray<number>;
}

interface BookmarkItem {
  type: 'file' | 'folder' | 'group' | 'url';
  path?: string; // for file
  title?: string; // for url or override
  items?: BookmarkItem[]; // for group
  url?: string;
}

export const NewTabComponent: React.FC<NewTabComponentProps> = ({ app }) => {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [bookmarks, setBookmarks] = React.useState<BookmarkItem[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Initial focus and fetch bookmarks
  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }

    // Fetch bookmarks
    try {
      const bookmarksPlugin = (app as any).internalPlugins?.getPluginById("bookmarks");
      if (bookmarksPlugin?.enabled) {
        const instance = bookmarksPlugin.instance;
        const items = instance.items || (instance.getBookmarks ? instance.getBookmarks() : []);

        const flatBookmarks: BookmarkItem[] = [];

        const traverse = (items: BookmarkItem[]) => {
          for (const item of items) {
            if (item.type === 'file') {
              flatBookmarks.push(item);
            } else if (item.type === 'group' && item.items) {
              traverse(item.items);
            }
          }
        };

        if (Array.isArray(items)) {
          traverse(items);
        }
        setBookmarks(flatBookmarks.slice(0, 10)); // Limit to 10 for grid
      }
    } catch (e) {
      console.error("Failed to fetch bookmarks", e);
    }
  }, [app]);

  // Search Logic
  React.useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const files = app.vault.getFiles();
    const targets = files.map(f => ({
      file: f,
      path: f.path,
      name: f.basename
    }));

    const results = fuzzysort.go(query, targets, {
      key: 'path',
      limit: 10,
      threshold: -10000,
    });

    setResults(results.map(r => ({
      file: r.obj.file,
      score: r.score,
      highlightIndexes: fuzzysort.indexes(r) as number[]
    })));
    setSelectedIndex(0);

  }, [query, app.vault]);

  const openFile = (file: TFile) => {
    // Open file in the current leaf (replacing the New Tab view effectively if it's not pinned)
    app.workspace.getLeaf(false).openFile(file);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[selectedIndex]) {
        openFile(results[selectedIndex].file);
      }
    }
  };

  return (
    <div className="new-tab-wrapper">
      <div className="search-container">
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder="Change the world..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      {results.length > 0 ? (
        <div className="search-results">
          {results.map((result, index) => (
            <div
              key={result.file.path}
              className={`search-result-item ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => openFile(result.file)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <span className="result-icon">📄</span>
              <div className="result-info">
                <span className="result-name">{result.file.basename}</span>
                <span className="result-path">{result.file.parent?.path}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !query && bookmarks.length > 0 && (
          <div className="bookmarks-container">
            <h3>Bookmarks</h3>
            <div className="bookmarks-grid">
              {bookmarks.map((b, i) => (
                <div
                  key={i}
                  className="bookmark-item"
                  onClick={() => {
                    if (b.type === 'file' && b.path) {
                      const file = app.vault.getAbstractFileByPath(b.path);
                      if (file instanceof TFile) {
                        openFile(file);
                      }
                    }
                  }}
                >
                  <span className="bookmark-icon">
                    {b.type === 'file' ? '📄' : '⭐'}
                  </span>
                  <span className="bookmark-title">
                    {b.title || (b.path ? b.path.split('/').pop() : 'Untitled')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
};
