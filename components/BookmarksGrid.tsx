import * as React from "react";
import { TFile } from "obsidian";
import { BookmarkItem } from "../types";
import { IconDisplay } from "./IconDisplay";
import { useAppContext } from "../context";

interface BookmarksGridProps {
  bookmarks: BookmarkItem[];
  onSelect: (file: TFile) => void;
}

export const BookmarksGrid: React.FC<BookmarksGridProps> = ({
  bookmarks,
  onSelect,
}) => {
  const { app } = useAppContext();
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
