import { ItemView, WorkspaceLeaf } from "obsidian";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { NewTabComponent } from "./NewTabComponent";
import NewTabPlugin from "./main";

export const NEW_TAB_VIEW_TYPE = "new-tab-search-view";

export class NewTabView extends ItemView {
  root: ReactDOM.Root | null = null;
  plugin: NewTabPlugin;

  constructor(leaf: WorkspaceLeaf, plugin: NewTabPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType() {
    return NEW_TAB_VIEW_TYPE;
  }

  getDisplayText() {
    return "New Tab";
  }

  getIcon() {
    return "search";
  }

  async onOpen() {
    const container = this.contentEl;
    container.empty();
    container.addClass("new-tab-search-container");
    container.addClass("new-tab-page-view");

    this.root = ReactDOM.createRoot(container);
    this.root.render(
      <React.StrictMode>
        <NewTabComponent app={this.app} leaf={this.leaf} settings={this.plugin.settings} />
      </React.StrictMode>
    );
  }

  refresh() {
    if (this.root) {
      this.root.render(
        <React.StrictMode>
          <NewTabComponent app={this.app} leaf={this.leaf} settings={this.plugin.settings} />
        </React.StrictMode>
      );
    }
  }

  async onClose() {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
  }
}
