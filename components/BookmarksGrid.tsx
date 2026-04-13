import * as React from "react";
import { App, TFile } from "obsidian";
import { BookmarkItem } from "../types";
import { IconDisplay } from "./IconDisplay";

interface BookmarksGridProps {
  app: App;
  bookmarks: BookmarkItem[];
  onSelect: (file: TFile) => void;
}

export const BookmarksGrid: React.FC<BookmarksGridProps> = ({
  app,
  bookmarks,
  onSelect,
}) => {
  if (bookmarks.length === 0) return null;

  return (
    <div className="bookmarks-grid">
      {bookmarks.map((b, i) => (
        <div
          key={i}
          className="bookmark-card"
          onClick={() => {
            if (b.type === "file" && b.path) {
              const file = app.vault.getAbstractFileByPath(b.path);
              if (file instanceof TFile) {
                onSelect(file);
              }
            }
          }}
        >
          <div className="bookmark-icon-container">
            <IconDisplay
              app={app}
              iconName={b.icon}
              color={b.color}
              className="bookmark-icon-el"
            />
          </div>
          <span className="bookmark-title">
            {b.title ||
              (b.path
                ? b.path.split("/").pop()?.replace(/\.[^/.]+$/, "")
                : "Untitled")}
          </span>
        </div>
      ))}
    </div>
  );
};
