import * as React from "react";
import { App, TFile, WorkspaceLeaf } from "obsidian";
import fuzzysort from "fuzzysort";
import { getIconForFile } from "./iconUtils";
import { BookmarkItem, SearchResult, NewTabSettings, AppWithInternalPlugins } from "./types";

// Components
import { GreetingSection } from "./components/GreetingSection";
import { DailyNoteWidget } from "./components/DailyNoteWidget";
import { SearchBar } from "./components/SearchBar";
import { SearchResults } from "./components/SearchResults";
import { BookmarksGrid } from "./components/BookmarksGrid";

interface NewTabComponentProps {
  app: App;
  leaf: WorkspaceLeaf;
  settings: NewTabSettings;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export const NewTabComponent: React.FC<NewTabComponentProps> = ({ app, leaf, settings }) => {
  const [query, setQuery] = React.useState("");
  const debouncedQuery = useDebounce(query, 200);
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [bookmarks, setBookmarks] = React.useState<BookmarkItem[]>([]);

  // Fetch bookmarks
  React.useEffect(() => {
    if (!settings.showBookmarks) {
      setBookmarks([]);
      return;
    }

    const fetchBookmarks = async () => {
      try {
        const typedApp = app as AppWithInternalPlugins;
        const bookmarksPlugin = typedApp.internalPlugins?.getPluginById("bookmarks");
        
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
  }, [app, settings.showBookmarks]);

  // Search Logic
  React.useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      return;
    }

    const files = app.vault.getFiles();
    const targets = files.map(f => ({
      file: f,
      path: f.path,
      name: f.basename
    }));

    const searchResults = fuzzysort.go(debouncedQuery, targets, {
      key: 'path',
      limit: 10,
      threshold: -10000,
    });

    const processResults = async () => {
      const mapped = await Promise.all(searchResults.map(async r => {
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

  }, [debouncedQuery, app.vault]);

  const openFile = (file: TFile) => {
    if (leaf) {
      leaf.openFile(file);
    } else {
      app.workspace.getLeaf(false).openFile(file);
    }
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
      {(app as any).isMobile && <div className="mobile-ui-spacer" />}
      
      <GreetingSection customGreeting={settings.customGreeting} />

      {!query && settings.showDailyNote && (
        <DailyNoteWidget app={app} leaf={leaf} />
      )}

      <div className="search-group">
        <SearchBar
          app={app}
          query={query}
          setQuery={setQuery}
          onKeyDown={handleKeyDown}
          resultsCount={results.length}
        />

        {results.length > 0 ? (
          <SearchResults
            app={app}
            results={results}
            selectedIndex={selectedIndex}
            onSelect={openFile}
            setSelectedIndex={setSelectedIndex}
          />
        ) : (
          !query && settings.showBookmarks && (
            <BookmarksGrid
              app={app}
              bookmarks={bookmarks}
              onSelect={openFile}
            />
          )
        )}
      </div>
    </div>
  );
};
