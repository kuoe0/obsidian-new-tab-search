import * as React from "react";
import { TFile } from "obsidian";
import { IconDisplay } from "./IconDisplay";
import { getIconForFile } from "../iconUtils";
import { useAppContext } from "../context";

interface RecentFileItem {
  file: TFile;
  icon: string;
  color: string | null;
}

interface RecentFilesGridProps {
  recentFiles: TFile[];
  onSelect: (file: TFile) => void;
}

export const RecentFilesGrid: React.FC<RecentFilesGridProps> = ({
  recentFiles,
  onSelect,
}) => {
  const { app } = useAppContext();
  const [enrichedFiles, setEnrichedFiles] = React.useState<RecentFileItem[]>([]);

  React.useEffect(() => {
    const enrichFiles = async () => {
      const enriched = await Promise.all(
        recentFiles.map(async (file) => {
          const iconInfo = await getIconForFile(app, file);
          return {
            file,
            icon: iconInfo.icon,
            color: iconInfo.color,
          };
        })
      );
      setEnrichedFiles(enriched);
    };
    enrichFiles();
  }, [app, recentFiles]);

  if (enrichedFiles.length === 0) return null;

  return (
    <>
      <h3 className="section-title">Recent Files</h3>
      <div className="bookmarks-grid">
        {enrichedFiles.map((item) => (
          <div
            key={item.file.path}
            className="bookmark-card"
            onClick={() => onSelect(item.file)}
          >
            <div className="bookmark-icon-container">
              <IconDisplay
                iconName={item.icon}
                color={item.color}
                className="bookmark-icon-el"
              />
            </div>
            <span className="bookmark-title">{item.file.basename}</span>
          </div>
        ))}
      </div>
    </>
  );
};
