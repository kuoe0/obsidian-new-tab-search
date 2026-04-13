import * as React from "react";
import { App, WorkspaceLeaf } from "obsidian";
import { NewTabSettings } from "./types";

interface AppContextValue {
  app: App;
  settings: NewTabSettings;
  leaf: WorkspaceLeaf;
}

const AppContext = React.createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{
  app: App;
  settings: NewTabSettings;
  leaf: WorkspaceLeaf;
  children: React.ReactNode;
}> = ({ app, settings, leaf, children }) => {
  return (
    <AppContext.Provider value={{ app, settings, leaf }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = React.useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
