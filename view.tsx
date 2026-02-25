import { ItemView, WorkspaceLeaf } from "obsidian";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { NewTabComponent } from "./NewTabComponent";

export const NEW_TAB_VIEW_TYPE = "new-tab-search-view";

export class NewTabView extends ItemView {
  root: ReactDOM.Root | null = null;

  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }

  getViewType() {
    return NEW_TAB_VIEW_TYPE;
  }

  getDisplayText() {
    return "New Tab";
  }

  async onOpen() {
    const container = this.contentEl; // Use contentEl instead of accessing children manually
    container.empty();
    container.addClass("new-tab-search-container");
    container.addClass("new-tab-page-view");

    this.root = ReactDOM.createRoot(container);
    this.root.render(
      <React.StrictMode>
        <NewTabComponent app={this.app} />
      </React.StrictMode>
    );
  }

  async onClose() {
    if (this.root) {
      this.root.unmount();
    }
  }
}
