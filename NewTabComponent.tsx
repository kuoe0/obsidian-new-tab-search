import * as React from "react";
import { App, TFile } from "obsidian";
import fuzzysort from "fuzzysort";
import { getIconForFile, renderIcon } from "./iconUtils";

interface NewTabComponentProps {
  app: App;
}

interface SearchResult {
  file: TFile;
  score: number;
  icon?: string;
  color?: string | null;
}

interface BookmarkItem {
  type: 'file' | 'folder' | 'group' | 'url';
  path?: string;
  title?: string;
  items?: BookmarkItem[];
  url?: string;
  icon?: string;
  color?: string | null;
}

const IconDisplay: React.FC<{ app: App, iconName?: string, color?: string | null, className?: string }> = ({ app, iconName, color, className }) => {
  const ref = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    if (ref.current && iconName) {
      ref.current.empty();
      renderIcon(app, iconName, ref.current, color);
    }
  }, [iconName, color, app]);

  if (!iconName) return <span className={`icon-placeholder ${className || ''}`}>📄</span>;

  return <span ref={ref} className={`icon-render ${className || ''}`} />;
};

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
    const fetchBookmarks = async () => {
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

            // Enrich with icons
            const enriched = await Promise.all(flatBookmarks.slice(0, 10).map(async (b) => {
              let icon = "lucide-file";
              let color: string | null = null;
              if (b.type === 'file' && b.path) {
                const file = app.vault.getAbstractFileByPath(b.path);
                if (file instanceof TFile) {
                  const iconInfo = await getIconForFile(app, file);
                  icon = iconInfo.icon;
                  color = iconInfo.color;
                }
              }
              return { ...b, icon, color };
            }));
            setBookmarks(enriched);
          }
        } catch (e) {
          console.error("Failed to fetch bookmarks", e);
        }
    };
    fetchBookmarks();
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

    const processResults = async () => {
      const mapped = await Promise.all(results.map(async r => {
        const iconInfo = await getIconForFile(app, r.obj.file);
        return {
          file: r.obj.file,
          score: r.score,
          icon: iconInfo.icon,
          color: iconInfo.color
        };
      }));
      setResults(mapped);
      setSelectedIndex(0);
    };
    processResults();

  }, [query, app.vault]);

  const openFile = (file: TFile) => {
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
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        {query && <div className="search-icon-indicator">🔍</div>}
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
              <IconDisplay app={app} iconName={result.icon} color={result.color} className="result-icon-el" />
              <div className="result-info">
                <span className="result-name">{result.file.basename}</span>
                <span className="result-path">{result.file.parent?.path}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !query && bookmarks.length > 0 && (
            <div className="bookmarks-section">
              <div className="bookmarks-grid">
                {bookmarks.map((b, i) => (
                  <div
                    key={i} 
                    className="bookmark-card"
                    onClick={() => {
                      if (b.type === 'file' && b.path) {
                        const file = app.vault.getAbstractFileByPath(b.path);
                        if (file instanceof TFile) {
                          openFile(file);
                        }
                      }
                    }}
                  >
                    <div className="bookmark-icon-container">
                      <IconDisplay app={app} iconName={b.icon} color={b.color} className="bookmark-icon-el" />
                    </div>
                    <span className="bookmark-title">
                      {b.title || (b.path ? b.path.split('/').pop()?.replace(/\.[^/.]+$/, "") : 'Untitled')}
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

