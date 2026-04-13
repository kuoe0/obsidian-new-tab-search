import { App, TFile } from "obsidian";

export interface BookmarkItem {
    type: 'file' | 'folder' | 'group' | 'url';
    path?: string;
    title?: string;
    items?: BookmarkItem[];
    url?: string;
    icon?: string;
    color?: string | null;
}

export interface SearchResult {
    file: TFile;
    score: number;
    icon?: string;
    color?: string | null;
}

export interface IconInfo {
    icon: string;
    color: string | null;
}

export interface NewTabSettings {
    showDailyNote: boolean;
    customGreeting: string;
    showBookmarks: boolean;
    showRecentFiles: boolean;
}

export const DEFAULT_SETTINGS: NewTabSettings = {
    showDailyNote: true,
    customGreeting: "",
    showBookmarks: true,
    showRecentFiles: true,
};

// Internal Obsidian API types
export interface InternalPlugin {
    enabled: boolean;
    instance: any;
}

export interface DailyNotesPluginInstance {
    options: {
        format?: string;
        folder?: string;
    };
}

export interface BookmarksPluginInstance {
    items: BookmarkItem[];
    getBookmarks?(): BookmarkItem[];
}

export interface AppWithInternalPlugins extends App {
    internalPlugins: {
        getPluginById(id: "daily-notes"): InternalPlugin & { instance: DailyNotesPluginInstance };
        getPluginById(id: "bookmarks"): InternalPlugin & { instance: BookmarksPluginInstance };
        getPluginById(id: string): InternalPlugin;
    };
    commands: {
        findCommand(id: string): any;
        executeCommandById(id: string): boolean;
    };
    isMobile: boolean;
}
