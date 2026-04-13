import * as React from "react";
import { TFile, normalizePath } from "obsidian";
import { IconDisplay } from "./IconDisplay";
import { AppWithInternalPlugins } from "../types";
import { useAppContext } from "../context";

declare global {
  interface Window {
    moment: any;
  }
}

interface DailyNoteWidgetProps {}

export const DailyNoteWidget: React.FC<DailyNoteWidgetProps> = () => {
  const { app, leaf } = useAppContext();
  const handleDailyNote = async () => {
    try {
      let format = "YYYY-MM-DD";
      let folder = "";

      const typedApp = app as AppWithInternalPlugins;
      const dailyNotesPlugin = typedApp.internalPlugins?.getPluginById("daily-notes")?.instance;
      if (dailyNotesPlugin?.options) {
        format = dailyNotesPlugin.options.format || format;
        folder = dailyNotesPlugin.options.folder || folder;
      }

      const periodicNotes = (app as any).plugins?.getPlugin("periodic-notes");
      if (periodicNotes?.settings?.daily) {
        format = periodicNotes.settings.daily.format || format;
        folder = periodicNotes.settings.daily.folder || folder;
      }

      const date = window.moment();
      const basename = date.format(format);
      let path = folder ? `${folder}/${basename}.md` : `${basename}.md`;
      path = normalizePath(path);

      const abstractFile = app.vault.getAbstractFileByPath(path);

      let fileToOpen = abstractFile;
      if (!fileToOpen) {
        fileToOpen = app.metadataCache.getFirstLinkpathDest(basename, "");
      }

      if (fileToOpen instanceof TFile) {
        if (leaf) {
          await leaf.openFile(fileToOpen);
        } else {
          await app.workspace.getLeaf(false).openFile(fileToOpen);
        }
        return;
      }
    } catch (e) {
      console.error("Error trying to find daily note:", e);
    }

    const commands = (app as any).commands;
    const commandIds = [
      "daily-notes",
      "daily-notes:today",
      "periodic-notes:open-daily-note",
      "periodic-notes:today"
    ];

    let executed = false;
    for (const id of commandIds) {
      if (commands.findCommand(id)) {
        commands.executeCommandById(id);
        executed = true;
        break;
      }
    }
    if (!executed) {
      console.warn("Could not find a command to open the daily note.");
    }
  };

  return (
    <div className="daily-note-section">
      <button className="daily-note-widget" onClick={handleDailyNote}>
        <div className="daily-note-icon-container">
          <IconDisplay iconName="calendar" className="daily-note-icon" />
        </div>
        <div className="daily-note-content">
          <span className="daily-note-label">Today's Note</span>
        </div>
      </button>
    </div>
  );
};
